import db from './lib/db.js'
import graph from './lib/graph.js'
import utils from './lib/utils.js'
import fetch from 'node-fetch'

// This is workaround for urql package depending on fetch() to be defined globally
globalThis.fetch = fetch

export const handler = async (event, context) => {
  console.log('Start indexing accounts')
  const latestAccountUpdatedAt = await db.getLatestAccountUpdatedAt()
  const accounts = await graph.getAccounts(latestAccountUpdatedAt)

  // This function handles the tricky case where the same username
  // goes through register => deregister => register cycles:
  // 1) Username is not already in DB: The graph returns only the latest account and the delete
  //    will be skipped because deleted timestamp is after created timestamp on the account.
  // 2) Username is already in DB: We fail in this case becase we attempt to insert an account
  //    with the same username that is already in the DB.
  // TODO: We should handle the case #2 gracefully.
  // TODO: The following transactions should be atomic, e.g., if this function fails after
  // insert but before completing the update/delete, retrying this function will fail with
  // conflict during the insert step.
  const accountsToInsert = accounts.filter(
    (account) => account.createdAt === account.updatedAt
  )
  console.log(`${accountsToInsert.length}/${accounts.length} accounts are created`)
  await db.insertAccounts(
    accountsToInsert.map((u) => utils.convertGraphAccountToDbAccount(u))
  )

  const accountsToUpdate = accounts.filter(
    (account) => account.createdAt !== account.updatedAt
  )
  console.log(`${accountsToUpdate.length}/${accounts.length} accounts are updated`)
  for (const account of accountsToUpdate) {
    await db.insertOrUpdateAccount(utils.convertGraphAccountToDbAccount(account))
  }

  const deletedAccounts = await graph.getDeletedAccounts(latestAccountUpdatedAt)
  for (const account of deletedAccounts) {
    await db.deleteAccount(account.address, parseInt(account.deletedAt))
  }
  console.log('Done indexing accounts.')
}
