import ogs from 'open-graph-scraper'
import urlRegex from 'url-regex'

class PermanentError extends Error {}
class TemporaryError extends Error {}

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
  // Farcaster uses imgur as image hosting service.
  const urls =
    text
      .match(URL_REGEX)
      ?.filter((url) => !url.startsWith('https://i.imgur.com/')) || []
  return new Set(urls.map((url) => url.trim().replace(/\.+$/, '')))
}

const getOpengraph = async (url) => {
  try {
    console.log(`Scraping ${url}`)
    return await ogs({
      url: url,
      downloadLimit: SCRAPE_DOWNLOAD_LIMIT,
      timeout: TIMEOUT,
    })
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

export default {
  PermanentError,
  TemporaryError,
  extractUrls,
  getOpengraph,
}
