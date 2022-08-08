import { BigInt, store } from '@graphprotocol/graph-ts'
import {
  RegistryV3,
  DeregisterName,
  ModifyName,
  RegisterName,
  TransferName,
} from '../generated/RegistryV3/RegistryV3'
import { DeletedUser, User } from '../generated/schema'

export function handleRegisterName(event: RegisterName): void {
  let contract = RegistryV3.bind(event.address)
  let username = event.params.username
  let user = new User(username.toString())
  let urlEntry = contract.usernameToUrl(username)
  user.username = username
  user.address = event.params.owner
  user.url = urlEntry.getUrl()
  user.initialized = urlEntry.getInitialized()
  user.createdAt = event.block.timestamp
  user.updatedAt = event.block.timestamp
  user.save()
}

export function handleModifyName(event: ModifyName): void {
  let contract = RegistryV3.bind(event.address)
  let user = User.load(event.params.username.toString())
  if (user) {
    let urlEntry = contract.usernameToUrl(user.username)
    user.url = urlEntry.getUrl()
    user.initialized = urlEntry.getInitialized()
    user.updatedAt = event.block.timestamp
    user.save()
  }
}

export function handleTransferName(event: TransferName): void {
  let user = User.load(event.params.username.toString())
  if (user) {
    user.address = event.params.to
    user.updatedAt = event.block.timestamp
    user.save()
  }
}

export function handleDeregisterName(event: DeregisterName): void {
  let username = event.params.username
  let id = username.toString()
  let user = User.load(id)
  if (user) {
    let deleted = new DeletedUser(
      event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    )
    deleted.username = user.username
    deleted.address = user.address
    deleted.deletedAt = event.block.timestamp
    deleted.save()
    store.remove('User', id)
  }
}
