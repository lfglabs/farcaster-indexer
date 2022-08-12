import db from './lib/db.js'
import scraper from './lib/scraper.js'

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
        if (!normalizedUrls.has(url.normalized_url)) {
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
