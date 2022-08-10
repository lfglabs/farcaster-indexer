import ogs from 'open-graph-scraper'
import urlRegex from 'url-regex'
import db from './lib/db.js'
import utils from './lib/utils.js'

const SCRAPE_ERRORS_TO_IGNORE = [
  'Page not found',
  'Must scrape an HTML page',
  'Page must return a header content-type with text/html',
  'certificate has expired',
  'Hostname/IP does not match certificate',
  'Invalid URL',
  'Response code 999 (Request denied)',
  'connect ECONNREFUSED',
  'self signed certificate',
  'write EPROTO',
]
const ERRORS_TO_RETRY_LATER = [
  'Time out',
  'Client network socket disconnected before secure TLS connection was established',
  'Web server is returning error',
]
// open graph scraper options:
// https://www.npmjs.com/package/open-graph-scraper
// Maximum size of the content downloaded from the server, in bytes
const SCRAPE_DOWNLOAD_LIMIT = 10000000 // 10MB

const URL_REGEX = urlRegex()

const extractUrls = (text) => {
  // Farcaster uses imgur as image hosting service.
  const urls =
    text
      .match(URL_REGEX)
      ?.filter((url) => !url.startsWith('https://i.imgur.com/')) || []
  return new Set(urls.map((url) => url.trim().replace(/\.+$/, '')))
}

export const handler = async (event, context) => {
  console.log('Start indexing urls')
  for (const activity of await db.getNextActivitiesToUpdateIndexOpengraphs()) {
    try {
      const urls = extractUrls(activity.text)
      console.log(`Found ${urls.size} urls in activity ${activity.id}`)
      const opengraphsToUpsert = []
      const normalizedUrls = new Set()
      for (const url of urls) {
        try {
          console.log(`Scraping ${url}`)
          const { result } = await ogs({
            url: url,
            downloadLimit: SCRAPE_DOWNLOAD_LIMIT,
          })
          const opengraph = utils.convertToDbOpengraph(result)
          if (!normalizedUrls.has(opengraph.normalized_url)) {
            normalizedUrls.add(opengraph.normalized_url)
            opengraphsToUpsert.push(opengraph)
          }
        } catch (e) {
          if (
            SCRAPE_ERRORS_TO_IGNORE.some((msg) =>
              e.result?.error?.startsWith(msg)
            )
          ) {
            console.warn(`Could not scrape ${url}: ${e.result?.error}`)
          } else {
            throw e
          }
        }
      }
      await db.upsertOpengraphs(activity.id, opengraphsToUpsert)
    } catch (e) {
      if (ERRORS_TO_RETRY_LATER.includes(e.result?.error)) {
        console.warn(
          `Retrying ${activity.id} later due to the following error: ${e.result?.error}`
        )
      } else {
        console.error(`Could not index opengraphs for activity ${activity.id}`)
        console.error(e)
      }
    }
  }
  console.log('Done indexing urls.')
}
