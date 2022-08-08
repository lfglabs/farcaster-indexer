import db from './lib/db.js'
import utils from './lib/utils.js'

export const handler = async (event, context) => {
  for (const account of await db.getNextUsersToUpdateActivity()) {
    const { id, address, directories, latest_activity_sequence } = account
    const updates = {
      address: address,
      activity_updated_at: new Date().toISOString(),
    }
    if (!directories.length) {
      await db.updateUser(updates)
      continue
    }

    console.log(`Updating activities for account ${id}`)
    // TODO: https://guardian.farcaster.xyz/origin/address_activity
    // Currently returns up to 5000 latest activities and does not seem to support pagination.
    // We could not index all activities for the following accounts that had more than
    // 5000 activities: @dwr.
    const activities = await utils.fetchWithLog(directories[0].activity_url)
    if (activities) {
      const activitiesToInsert = []
      const deletedActivities = {}
      let prevSequence = null
      for (const rawActivity of activities) {
        const activity = utils.convertToDbActivity(id, rawActivity)
        const { sequence, merkle_root, delete_merkle_root } = activity
        if (updates.latest_activity_sequence === undefined) {
          updates.latest_activity_sequence = sequence
        }
        // Already indexed
        if (sequence === latest_activity_sequence) {
          break
        }
        // Some activity JSON files have multiple items with the same sequence number
        // e.g., https://gist.githubusercontent.com/gsgalloway/0a922a4fab3127404bded802fcde80b2/raw/activity.json
        // We skip earlier ones in those cases.
        if (sequence === prevSequence) {
          console.warn(
            `Skipping duplicate sequence ${sequence} for account ${id} (prevSequence: ${prevSequence})`
          )
          continue
        }
        if (delete_merkle_root) {
          deletedActivities[delete_merkle_root] = true
        }
        if (merkle_root in deletedActivities) {
          activity.deleted = true
          delete deletedActivities[merkle_root]
        }
        activitiesToInsert.push(activity)
        prevSequence = sequence
      }
      // Mark activities that are already in DB as deleted
      for (const merkleRootToDelete of Object.keys(deletedActivities)) {
        await db.markActivityAsDeleted(id, merkleRootToDelete)
      }
      await db.insertActivities(activitiesToInsert)
    }
    await db.updateUser(updates)
  }
  await db.updateReplyToActivity()
}
