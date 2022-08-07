import fetch from 'node-fetch'
import db from './lib/db.js'
import utils from './lib/utils.js'

const _fetch = async (url) => {
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`Could not fetch ${url}: ${res.statusText}`)
    return null
  }
  return res.json()
}

export const handler = async (event, context) => {
  for (const user of await db.getNextUsersToUpdateDirectory()) {
    const { id, url, username, address } = user
    console.log(`Updating directory for account ${address}`)
    // Test accounts starts with __tt_
    if (!url || url.includes('://localhost') || username.startsWith('__tt_')) {
      console.log(`Skip account ${address}`)
      continue
    }
    const directory = await _fetch(url)
    if (directory) {
      await db.insertOrUpdateDirectory(utils.convertToDbDirectory(id, directory))
      const proof = await _fetch(directory.body.proofUrl)
      if (proof) {
        await db.insertOrUpdateProof(utils.convertToDbProof(id, proof))
      } else {
        await db.deleteProof(id)
      }
    }
    await db.updateUser({ address: address, directory_updated_at: (new Date()).toISOString() })
  }
}
