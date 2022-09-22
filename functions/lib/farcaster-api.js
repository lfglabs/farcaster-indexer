import utils from './utils.js'

const HOST = 'https://api.farcaster.xyz/v1'

const getProfile = async (address) => {
  return await utils.fetchWithLog(`${HOST}/profiles/${address}`)
}

export default {
  getProfile,
}
