import db from './lib/db.js'
import scraper from './lib/scraper.js'

const TWITTER_DOMAINS = ['mobile.twitter.com', 'twitter.com']

export const handler = async (event, context) => {
  console.log('Start indexing urls')
  for (const activity of await db.getNextActivitiesToUpdateIndexOpengraphs()) {
    const errors = []
    try {
      // Get the opengraphs from the activity text
      const urlsInActivityText = scraper.extractUrls(activity.text)
      console.log(
        `Found ${urlsInActivityText.size} urls in activity's text ${activity.id}`
      )
      const opengraphsToUpsert = []
      const normalizedUrls = new Set()
      for (const url of urlsInActivityText) {
        try {
          const opengraph = await scraper.getOpengraphFromUrl(url)
          if (
            TWITTER_DOMAINS.includes(opengraph.domain) &&
            !opengraph.title &&
            !opengraph.description
          ) {
            // We sometimes don't scrape twitter well.
            // If so we fall back to Farcaster's scraper.
            continue
          }
          if (!normalizedUrls.has(opengraph.normalized_url)) {
            normalizedUrls.add(opengraph.normalized_url)
            opengraphsToUpsert.push(opengraph)
          }
        } catch (e) {
          // Skipping both permanent and temporary errors for now
          // since we fall back to the opengraphs in the activity
          if (
            e instanceof scraper.PermanentError ||
            e instanceof scraper.TemporaryError
          ) {
            errors.push(e.message)
            console.warn(
              `Skipping ${url} due to the following error: ${e.message}`
            )
            continue
          }
          throw e
        }
      }
      // Get the opengraphs from the activity opengraphs
      const urlsInActivityOpengraphs =
        scraper.getOpengraphsFromActivity(activity)
      console.log(
        `Found ${urlsInActivityOpengraphs.length} urls in activity's opengraphs ${activity.id}`
      )
      for (const url of urlsInActivityOpengraphs) {
        // Index only if there is no similar url already extracted from the activity text
        if (
          !Array.from(normalizedUrls).some(
            (nu) =>
              nu.startsWith(url.normalized_url) ||
              url.normalized_url.startsWith(nu)
          )
        ) {
          normalizedUrls.add(url.normalized_url)
          opengraphsToUpsert.push(url)
        }
      }
      await db.upsertOpengraphs(activity.id, opengraphsToUpsert)
    } catch (e) {
      console.error(`Unknown error scraping ${activity.id}: ${e.message}`)
      throw e
    }
    if (errors.length) {
      db.getNextActivitiesToUpdateIndexOpengraphs(
        activity.id,
        errors.join('\n')
      )
    }
  }
  console.log('Done indexing urls.')
}
