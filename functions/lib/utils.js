import fetch from 'node-fetch'

const fetchWithLog = async (url) => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`Could not fetch ${url}: ${res.statusText}`)
      return null
    }
    return await res.json()
  } catch (e) {
    console.warn(`Could not fetch ${url}: ${e.message}`)
    return null
  }
}

const convertGraphAccountToDbAccount = (account) => {
  return {
    username: account.id,
    address: account.address,
    url: account.url,
    initialized: account.initialized,
    entry_created_at: parseInt(account.createdAt),
    entry_updated_at: parseInt(account.updatedAt),
  }
}

const convertToDbDirectory = (accountId, directory) => {
  const { body, merkleRoot, signature } = directory
  const { addressActivityUrl, avatarUrl, displayName, proofUrl } = body
  return {
    account: accountId,
    activity_url: addressActivityUrl || '',
    avatar_url: avatarUrl || '',
    display_name: displayName || '',
    proof_url: proofUrl || '',
    merkle_root: merkleRoot || '',
    signature: signature || '',
    raw_data: directory,
  }
}

const convertToDbProof = (accountId, proof) => {
  const { signedMessage, signerAddress, farcasterAddress, originalMessage } =
    proof
  return {
    account: accountId,
    signed_message: signedMessage || '',
    signer_address: signerAddress || '',
    farcaster_address: farcasterAddress || '',
    original_message: originalMessage || '',
    raw_data: proof,
  }
}

const convertToDbProfile = (accountId, profile) => {
  const { user, followStats } = profile
  return {
    account: accountId,
    bio: user?.profile?.bio?.text || '',
    num_followers: followStats?.numFollowers || 0,
    num_following: followStats?.numFollowing || 0,
  }
}

const _getRecastMerkleRoot = (text) => {
  const parts = text.split('recast:farcaster://casts/')
  if (parts.length > 1) {
    return parts[1]
  }
  return ''
}

const _getDeleteMerkleRoot = (text) => {
  const parts = text.split('delete:farcaster://casts/')
  // Prevent delete:farcaster://casts/undefined to get through
  if (parts.length > 1 && parts[1] !== 'undefined') {
    return parts[1]
  }
  return ''
}

const convertToDbActivity = (accountId, activity) => {
  const { body, merkleRoot, signature, meta } = activity
  return {
    account: accountId,
    merkle_root: merkleRoot || '',
    signature: signature || '',
    published_at: body.publishedAt,
    sequence: body.sequence,
    text: body.data.text || '',
    reply_parent_merkle_root: body.data.replyParentMerkleRoot || '',
    prev_merkle_root: body.prevMerkleRoot || '',
    recast_merkle_root: _getRecastMerkleRoot(body.data.text),
    delete_merkle_root: _getDeleteMerkleRoot(body.data.text),
    num_reply_children: meta?.numReplyChildren || 0,
    reactions_count: meta?.reactions?.count || 0,
    recasts_count: meta?.recasts?.count || 0,
    watches_count: meta?.watches?.count || 0,
    deleted: false,
    raw_data: activity,
  }
}

export default {
  fetchWithLog,
  convertGraphAccountToDbAccount,
  convertToDbDirectory,
  convertToDbProof,
  convertToDbProfile,
  convertToDbActivity,
}
