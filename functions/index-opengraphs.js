import getUrls from 'get-urls'
import ogs from 'open-graph-scraper'
import db from './lib/db.js'
import utils from './lib/utils.js'

const SCRAPE_ERRORS_TO_IGNORE = ['Page not found', 'Must scrape an HTML page']
const ERRORS_TO_RETRY_LATER = ['Time out']
// open graph scraper options:
// https://www.npmjs.com/package/open-graph-scraper
// Maximum size of the content downloaded from the server, in bytes
const SCRAPE_DOWNLOAD_LIMIT = 10000000 // 10MB

export const handler = async (event, context) => {
  console.log('Start indexing urls')
  for (const activity of await db.getNextActivitiesToUpdateIndexOpengraphs()) {
    try {
      const urls = getUrls(activity.text)
      console.log(`Found ${urls.size} urls in activity ${activity.id}`)
      const opengraphsToUpsert = []
      for (const url of urls) {
        try {
          const { result } = await ogs({
            url: url,
            downloadLimit: SCRAPE_DOWNLOAD_LIMIT,
          })
          opengraphsToUpsert.push(utils.convertToDbOpengraph(result))
        } catch (e) {
          if (SCRAPE_ERRORS_TO_IGNORE.includes(e.result?.error)) {
            console.warn(`Could not scrape ${url}: ${e.result?.error}`)
          } else {
            throw e
          }
        }
      }
      await db.upsertOpengraphs(activity.id, opengraphsToUpsert)
    } catch (e) {
      if (!ERRORS_TO_RETRY_LATER.includes(e.result?.error)) {
        console.error(`Could not index opengraphs for activity ${activity.id}`)
        console.error(e)
      }
    }
  }
  console.log('Done indexing urls.')
}
