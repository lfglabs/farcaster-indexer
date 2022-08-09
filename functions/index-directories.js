import db from './lib/db.js'
import utils from './lib/utils.js'

export const handler = async (event, context) => {
  console.log('Start indexing directories')
  const timestampUpdate = { directory_updated_at: new Date().toISOString() }
  const directoriesToUpsert = []
  const proofsToUpsert = []
  const proofsToDelete = []
  const accountsToUpdate = []
  for (const account of await db.getNextAccountsToUpdateDirectory()) {
    const { id, url } = account
    console.log(`Processing account ${id}`)
    const directory = await utils.fetchWithLog(url)
    if (directory) {
      directoriesToUpsert.push(utils.convertToDbDirectory(id, directory))
      const proof = await utils.fetchWithLog(directory.body.proofUrl)
      if (proof) {
        proofsToUpsert.push(utils.convertToDbProof(id, proof))
      } else {
        proofsToDelete.push(id)
      }
    }
    accountsToUpdate.push(id)
  }
  await db.upsertDirectories(directoriesToUpsert)
  await db.upsertProofs(proofsToUpsert)
  await db.deleteProofs(proofsToDelete)
  await db.updateAccounts(timestampUpdate, accountsToUpdate)
  console.log('Done indexing directories.')
}
