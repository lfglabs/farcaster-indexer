import {
  Transfer
} from "../generated/NameRegistry/NameRegistry"
import {
  Name
} from "../generated/schema"

export function handleTransfer(
  event: Transfer
): void {
  let name = Name.load(event.params.tokenId.toString())
  if (name) {
    name.address = event.params.to
  } else {
    name = new Name(event.params.tokenId.toString())
    name.address = event.params.to
    name.createdAt = event.block.timestamp
  }
  name.updatedAt = event.block.timestamp
  name.save()
}