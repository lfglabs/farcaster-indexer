import db from './lib/db.js'
import utils from './lib/utils.js'
import crypto from './lib/crypto.js'

// Reindex up to most recent 20 activities or 14 days ago in case metrics have changed
const REINDEX_UP_TO_MOST_RECENT = 20
const REINDEX_UP_TO_DAYS_AGO = 14

export const handler = async (event, context) => {
  console.log('Start indexing activities')
  const timestampUpdate = { activity_updated_at: new Date().toISOString() }
  const daysAgoThreshold = utils.getDaysAgoInTime(REINDEX_UP_TO_DAYS_AGO)
  const accountsToUpdate = []
  for (const account of await db.getNextAccountsToUpdateActivity()) {
    const { id, address, directories, latest_activity_sequence } = account
    accountsToUpdate.push(id)
    if (!directories.length) continue
    console.log(`Indexing activities for account ${id}`)
    // TODO: https://guardian.farcaster.xyz/origin/address_activity
    // Currently returns up to 5000 latest activities and does not seem to support pagination.
    // We could not index all activities for the following accounts that had more than
    // 5000 activities: @dwr.
    const activities = await utils.fetchWithLog(directories[0].activity_url)
    // We currently assume changes in content hosted on activity URLs are backwards compatible.
    // EX: sequence is always increasing vs. decreasing.
    if (activities) {
      const activitiesToUpsert = []
      const deletedActivities = {}
      let prevSequence = null
      let activityValid = true
      for (const rawActivity of activities) {
        const activity = utils.convertToDbActivity(id, rawActivity)
        const { sequence, merkle_root, delete_merkle_root } = activity
        activityValid = crypto.validateActivitySignature(address, rawActivity)
        if (!activityValid) {
          console.warn(
            `Invalid activity signature for account ${id} at sequence ${sequence}`
          )
          break
        }
        if (
          latest_activity_sequence !== null && // Index all if not indexed yet
          sequence <= latest_activity_sequence &&
          activitiesToUpsert.length >= REINDEX_UP_TO_MOST_RECENT &&
          activity.published_at < daysAgoThreshold
        ) {
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
        activitiesToUpsert.push(activity)
        prevSequence = sequence
      }
      // Skip updating activities if at least one activity is invalid
      if (activityValid) {
        // Mark activities that are already in DB as deleted
        await db.markActivitiesAsDeleted(id, Object.keys(deletedActivities))
        await db.upsertActivities(activitiesToUpsert)
      }
    }
  }
  await db.updateAccounts(timestampUpdate, accountsToUpdate)
  await db.updateLatestActivitySequence(accountsToUpdate)
  await db.updateReplyToActivity()
  console.log('Done indexing activities.')
}
