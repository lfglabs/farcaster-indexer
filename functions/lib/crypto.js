// See https://www.farcaster.xyz/docs/signed-blob
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { verifyMessage } from '@ethersproject/wallet'

// The following serialization functions are needed because
// JSON stringify is property order dependent.
// See Farcaster doc for the details: https://www.farcaster.xyz/docs/signed-blob#footnotes

// https://github.com/standard-crypto/farcaster-js/blob/main/src/serialization.ts#L26
const serializeDirectoryBody = (body) => {
  const canonicalForm = {
    addressActivityUrl: body.addressActivityUrl,
    avatarUrl: body.avatarUrl,
    displayName: body.displayName,
    proofUrl: body.proofUrl,
    timestamp: body.timestamp,
    version: body.version,
  }
  return JSON.stringify(canonicalForm)
}

// From https://github.com/standard-crypto/farcaster-js/blob/main/src/serialization.ts#L3
const serializeAddressActivityBody = (body) => {
  const canonicalForm = {
    type: body.type,
    publishedAt: body.publishedAt,
    sequence: body.sequence,
    username: body.username,
    address: body.address,
    data: {
      text: body.data.text,
      replyParentMerkleRoot: body.data.replyParentMerkleRoot,
    },
    prevMerkleRoot: body.prevMerkleRoot,
    tokenCommunities: body.tokenCommunities,
  }
  return JSON.stringify(canonicalForm)
}

const validateDirectorySignature = (address, directory) => {
  if (!directory.signature) {
    return false
  }
  const serializedDirectoryBody = serializeDirectoryBody(directory.body)
  const derivedMerkleRoot = keccak256(toUtf8Bytes(serializedDirectoryBody))
  const signerAddress = verifyMessage(derivedMerkleRoot, directory.signature)
  return (
    signerAddress.toLowerCase() === address.toLowerCase() &&
    derivedMerkleRoot === directory.merkleRoot
  )
}

const validateActivitySignature = (address, addressActivity) => {
  const serializedCast = serializeAddressActivityBody(addressActivity.body)
  const derivedMerkleRoot = keccak256(toUtf8Bytes(serializedCast))
  const signerAddress = verifyMessage(
    derivedMerkleRoot,
    addressActivity.signature
  )
  return (
    signerAddress.toLowerCase() === address.toLowerCase() &&
    derivedMerkleRoot === addressActivity.merkleRoot
  )
}

export default {
  validateDirectorySignature,
  validateActivitySignature,
}
