import db from './lib/db.js'
import graph from './lib/graph.js'
import utils from './lib/utils.js'
import fetch from 'node-fetch'

// This is workaround for urql package depending on fetch() to be defined globally
globalThis.fetch = fetch

export const handler = async (event, context) => {
  const latestUserUpdatedAt = await db.getLatestUserUpdatedAt()
  const users = await graph.getUsers(latestUserUpdatedAt)

  // This function handles the tricky case where the same username
  // goes through register => deregister => register cycles:
  // 1) Username is not already in DB: The graph returns only the latest user and the delete
  //    will be skipped because deleted timestamp is after created timestamp on the user.
  // 2) Username is already in DB: We fail in this case becase we attempt to insert a user
  //    with the same username that is already in the DB.
  // TODO: We should handle the case #2 gracefully.
  // TODO: The following transactions should be atomic, e.g., if this function fails after
  // insert but before completing the update/delete, retrying this function will fail with
  // conflict during the insert step.
  const usersToInsert = users.filter(
    (user) => user.createdAt === user.updatedAt
  )
  console.log(`${usersToInsert.length}/${users.length} users are created`)
  await db.insertUsers(
    usersToInsert.map((u) => utils.convertGraphUserToDbUser(u))
  )

  const usersToUpdate = users.filter(
    (user) => user.createdAt !== user.updatedAt
  )
  console.log(`${usersToUpdate.length}/${users.length} users are updated`)
  for (const user of usersToUpdate) {
    await db.insertOrUpdateUser(utils.convertGraphUserToDbUser(user))
  }

  const deletedUsers = await graph.getDeletedUsers(latestUserUpdatedAt)
  for (const user of deletedUsers) {
    await db.deleteUser(user.address, parseInt(user.deletedAt))
  }
}
