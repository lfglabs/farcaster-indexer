import db from './lib/db.js'
import graph from './lib/graph.js'
import utils from './lib/utils.js'
import fetch from 'node-fetch'

// This is workaround for urql package depending on fetch() to be defined globally
globalThis.fetch = fetch

export const handler = async (event, context) => {
  const latestUserUpdatedAt = await db.getLatestUserUpdatedAt()
  const users = await graph.getUsers(latestUserUpdatedAt)

  // TODO: The following transactions should be atomic
  const usersToInsert = users.filter(user => user.createdAt === user.updatedAt)
  console.log(`${usersToInsert.length}/${users.length} users are created`)
  await db.insertUsers(usersToInsert.map(u => utils.convertGraphUserToDbUser(u)))

  const usersToUpdate = users.filter(user => user.createdAt !== user.updatedAt)
  console.log(`${usersToUpdate.length}/${users.length} users are updated`)
  for (const user of usersToUpdate) {
    await db.insertOrUpdateUser(utils.convertGraphUserToDbUser(user))
  }

  const deletedUsers = await graph.getDeletedUsers(latestUserUpdatedAt)
  for (const user of deletedUsers) {
    await db.deleteUser(user.address, parseInt(user.deletedAt))
  }
}
