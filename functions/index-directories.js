import db from './lib/db.js'
import utils from './lib/utils.js'

export const handler = async (event, context) => {
  console.log('Start indexing directories')
  const timestampUpdate = { directory_updated_at: new Date().toISOString() }
  const directoriesToUpsert = []
  const proofsToUpsert = []
  const proofsToDelete = []
  const usersToUpdate = []
  for (const user of await db.getNextUsersToUpdateDirectory()) {
    const { id, url } = user
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
    usersToUpdate.push(id)
  }
  await db.upsertDirectories(directoriesToUpsert)
  await db.upsertProofs(proofsToUpsert)
  await db.deleteProofs(proofsToDelete)
  await db.updateUsers(timestampUpdate, usersToUpdate)
  console.log('Done indexing directories.')
}
