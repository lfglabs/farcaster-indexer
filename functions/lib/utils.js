const convertGraphUserToDbUser = (user) => {
  return {
    username: user.id,
    address: user.address,
    url: user.url,
    initialized: user.initialized,
    entry_created_at: parseInt(user.createdAt),
    entry_updated_at: parseInt(user.updatedAt),
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

const checkDirectoryEqual = (dir1, dir2) => {
  return (
    dir1.account === dir2.account &&
    dir1.activity_url === dir2.activity_url &&
    dir1.avatar_url === dir2.avatar_url &&
    dir1.display_name === dir2.display_name &&
    dir1.proof_url === dir2.proof_url &&
    dir1.merkle_root === dir2.merkle_root &&
    dir1.signature === dir2.signature
  )
}

const convertToDbProof = (accountId, proof) => {
  const { signedMessage, signerAddress, farcasterAddress, originalMessage } = proof
  return {
    account: accountId,
    signed_message: signedMessage || '',
    signer_address: signerAddress || '',
    farcaster_address: farcasterAddress || '',
    original_message: originalMessage || '',
    raw_data: proof,
  }
}

const checkProofEqual = (proof1, proof2) => {
  return (
    proof1.account === proof2.account &&
    proof1.signed_message === proof2.signed_message &&
    proof1.signer_address === proof2.signer_address &&
    proof1.farcaster_address === proof2.farcaster_address &&
    proof1.original_message === proof2.original_message
  )
}

export default {
  convertGraphUserToDbUser,
  convertToDbDirectory,
  checkDirectoryEqual,
  convertToDbProof,
  checkProofEqual,
}