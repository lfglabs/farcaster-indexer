import db from './lib/db.js'
import fc from './lib/farcaster-api.js'
import crypto from './lib/crypto.js'
import utils from './lib/utils.js'

const extractAddressFromDirectoryUrl = (url) => {
  // Ex: https://guardian.farcaster.xyz/origin/directory/0x2cf0b72866F4e51A7C35a02998B5E66896ee2c50
  const parts = url.split('guardian.farcaster.xyz/origin/directory/')
  return parts.length > 1 ? parts[1] : null
}

export const handler = async (event, context) => {
  console.log('Start indexing directories')
  const timestampUpdate = { directory_updated_at: new Date().toISOString() }
  const directoriesToUpsert = []
  const proofsToUpsert = []
  const proofsToDelete = []
  const profilesToUpsert = []
  const accountsToUpdate = []
  for (const account of await db.getNextAccountsToUpdateDirectory()) {
    const { id, address, url } = account
    accountsToUpdate.push(id)
    console.log(`Processing account ${id}`)
    const directory = await utils.fetchWithLog(url)
    if (!directory) {
      console.warn(`Could not fetch directory found at ${url}`)
      continue
    }
    if (!crypto.validateDirectorySignature(address, directory)) {
      console.warn(`Directory signature is invalid for account ${id}`)
      continue
    }
    directoriesToUpsert.push(utils.convertToDbDirectory(id, directory))
    // Using farcaster address from proof or directory url
    // because graph lowercases account addresses and the
    // profile URL is case sensitive.
    let caseSensitiveAddress
    const proof = await utils.fetchWithLog(directory.body.proofUrl)
    if (proof) {
      proofsToUpsert.push(utils.convertToDbProof(id, proof))
      caseSensitiveAddress = proof.farcasterAddress
    } else {
      proofsToDelete.push(id)
      caseSensitiveAddress = extractAddressFromDirectoryUrl(url)
    }
    if (caseSensitiveAddress) {
      const profile = await fc.getProfile(caseSensitiveAddress)
      if (profile) {
        profilesToUpsert.push(utils.convertToDbProfile(id, profile))
      }
    }
  }
  await db.upsertDirectories(directoriesToUpsert)
  await db.upsertProofs(proofsToUpsert)
  await db.deleteProofs(proofsToDelete)
  await db.upsertProfiles(profilesToUpsert)
  await db.updateAccounts(timestampUpdate, accountsToUpdate)
  console.log('Done indexing directories.')
}
