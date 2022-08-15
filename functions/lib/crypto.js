// See https://www.farcaster.xyz/docs/signed-blob
// We are not verifying directory signatures because it's getting deprecated in v2 protocol.
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { verifyMessage } from '@ethersproject/wallet'

// The following serialization function is needed because
// JSON stringify is property order dependent.
// See Farcaster doc for the details: https://www.farcaster.xyz/docs/signed-blob#footnotes
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
  validateActivitySignature,
}
