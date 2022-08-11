import db from './lib/db.js'
import scraper from './lib/scraper.js'
import utils from './lib/utils.js'

export const handler = async (event, context) => {
  console.log('Start indexing urls')
  for (const activity of await db.getNextActivitiesToUpdateIndexOpengraphs()) {
    try {
      const urls = scraper.extractUrls(activity.text)
      console.log(`Found ${urls.size} urls in activity ${activity.id}`)
      const opengraphsToUpsert = []
      const normalizedUrls = new Set()
      for (const url of urls) {
        try {
          const { result } = await scraper.getOpengraph(url)
          const opengraph = utils.convertToDbOpengraph(result)
          if (!normalizedUrls.has(opengraph.normalized_url)) {
            normalizedUrls.add(opengraph.normalized_url)
            opengraphsToUpsert.push(opengraph)
          }
        } catch (e) {
          if (e instanceof scraper.PermanentError) {
            console.warn(
              `Skipping ${url} due to the following error: ${e.message}`
            )
            continue
          }
          throw e
        }
      }
      await db.upsertOpengraphs(activity.id, opengraphsToUpsert)
    } catch (e) {
      // Simply skip this activity and retry later
      if (e instanceof scraper.TemporaryError) {
        console.warn(
          `Retrying ${activity.id} later due to the following error: ${e.message}`
        )
        continue
      }
      console.error(`Unknown error scraping ${activity.id}: ${e.message}`)
      throw e
    }
  }
  console.log('Done indexing urls.')
}
