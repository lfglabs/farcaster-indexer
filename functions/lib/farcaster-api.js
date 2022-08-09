import utils from './utils.js'

const HOST = 'https://api.farcaster.xyz/'

const getProfile = async (address) => {
  return await utils.fetchWithLog(`${HOST}indexer/profiles/${address}`)
}

export default {
  getProfile,
}
