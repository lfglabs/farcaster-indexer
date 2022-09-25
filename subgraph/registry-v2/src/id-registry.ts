import {
  ChangeHome,
  Register,
  Transfer
} from "../generated/IdRegistry/IdRegistry"
import { Account } from "../generated/schema"

export function handleRegister(event: Register): void {
  let account = new Account(event.params.id.toString())
  account.address = event.params.to
  account.url = event.params.url
  account.createdAt = event.block.timestamp
  account.updatedAt = event.block.timestamp
  account.save()
}

export function handleChangeHome(event: ChangeHome): void {
  let account = Account.load(event.params.id.toString())
  if (account) {
    account.url = event.params.url
    account.updatedAt = event.block.timestamp
    account.save()
  }
}

export function handleTransfer(event: Transfer): void {
  let account = Account.load(event.params.id.toString())
  if (account) {
    account.address = event.params.to
    account.updatedAt = event.block.timestamp
    account.save()
  }
}
