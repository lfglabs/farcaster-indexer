import ogs from 'open-graph-scraper'
import urlRegex from 'url-regex'
import utils from './utils.js'

class PermanentError extends Error {}
class TemporaryError extends Error {}

// Farcaster uses imgur as image hosting service.
const isValidOpengraphUrl = (url) => {
  return url && !url.startsWith('https://i.imgur.com/')
}

// We don't want to retry if we get these errors.
const PERMANENT_ERRORS = [
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
  'Web server is returning error',
  'Encoding not recognized:',
  'unable to verify the first certificate',
  'Protocol ', // Protocol not supported
]
// We want to retry if we get these errors.
const TEMP_ERRORS = [
  'socket hang up',
  'Time out',
  'Client network socket disconnected before secure TLS connection was established',
  'Exceeded the download limit of',
]
// open graph scraper options:
// https://www.npmjs.com/package/open-graph-scraper
// Maximum size of the content downloaded from the server, in bytes
const SCRAPE_DOWNLOAD_LIMIT = 20000000 // 10MB
const TIMEOUT = 10000 // 10 seconds

const URL_REGEX = urlRegex()

const extractUrls = (text) => {
  const urls = text.match(URL_REGEX)?.filter(isValidOpengraphUrl) || []
  return new Set(urls.map((url) => url.trim().replace(/\.+$/, '')))
}

const getOpengraphFromUrl = async (url) => {
  try {
    console.log(`Scraping ${url}`)
    const { result } = await ogs({
      url: url,
      downloadLimit: SCRAPE_DOWNLOAD_LIMIT,
      timeout: TIMEOUT,
    })
    return utils.convertToDbOpengraph(result)
  } catch (e) {
    const errorMsg = e.result?.error
    if (errorMsg) {
      if (PERMANENT_ERRORS.some((msg) => errorMsg.startsWith(msg))) {
        throw new PermanentError(errorMsg)
      } else if (TEMP_ERRORS.includes(errorMsg)) {
        throw new TemporaryError(errorMsg)
      }
    }
    // Unknown error
    throw new Error(errorMsg)
  }
}

const getOpengraphsFromActivity = (activity) => {
  const { raw_data } = activity
  return (
    raw_data?.attachments?.openGraph
      ?.filter((og) => isValidOpengraphUrl(og.url))
      .map(utils.convertToDbOpengraph) || []
  )
}

export default {
  PermanentError,
  TemporaryError,
  extractUrls,
  getOpengraphFromUrl,
  getOpengraphsFromActivity,
}
