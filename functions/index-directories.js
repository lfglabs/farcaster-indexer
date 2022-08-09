import db from './lib/db.js'
import fc from './lib/farcaster-api.js'
import utils from './lib/utils.js'

export const handler = async (event, context) => {
  console.log('Start indexing directories')
  const timestampUpdate = { directory_updated_at: new Date().toISOString() }
  const directoriesToUpsert = []
  const proofsToUpsert = []
  const proofsToDelete = []
  const profilesToUpsert = []
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
        // Using farcaster address from proof because graph lowercases
        // account addresses and the URL is case sensitive.
        // TODO: account address should be cased properly.
        const profile = await fc.getProfile(proof.farcasterAddress)
        if (profile) {
          profilesToUpsert.push(utils.convertToDbProfile(id, profile))
        }
      } else {
        proofsToDelete.push(id)
      }
    }
    accountsToUpdate.push(id)
  }
  await db.upsertDirectories(directoriesToUpsert)
  await db.upsertProofs(proofsToUpsert)
  await db.deleteProofs(proofsToDelete)
  await db.upsertProfiles(profilesToUpsert)
  await db.updateAccounts(timestampUpdate, accountsToUpdate)
  console.log('Done indexing directories.')
}
