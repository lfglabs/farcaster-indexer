import db from './lib/db.js'
import utils from './lib/utils.js'

export const handler = async (event, context) => {
  for (const user of await db.getNextUsersToUpdateDirectory()) {
    const { id, url, address } = user
    console.log(`Updating directory for account ${address}`)
    const directory = await utils.fetchWithLog(url)
    if (directory) {
      await db.insertOrUpdateDirectory(
        utils.convertToDbDirectory(id, directory)
      )
      const proof = await utils.fetchWithLog(directory.body.proofUrl)
      if (proof) {
        await db.insertOrUpdateProof(utils.convertToDbProof(id, proof))
      } else {
        await db.deleteProof(id)
      }
    }
    await db.updateUser({
      address: address,
      directory_updated_at: new Date().toISOString(),
    })
  }
}
