import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AdminChanged,
  Approval,
  ApprovalForAll,
  BeaconUpgraded,
  NameRegistryCancelRecovery,
  ChangeFee,
  ChangePool,
  NameRegistryChangeRecoveryAddress,
  NameRegistryChangeTrustedCaller,
  ChangeVault,
  NameRegistryDisableTrustedOnly,
  Initialized,
  Invite,
  Paused,
  Renew,
  NameRegistryRequestRecovery,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  NameRegistryTransfer,
  Unpaused,
  Upgraded
} from "../generated/NameRegistry/NameRegistry"

export function createAdminChangedEvent(
  previousAdmin: Address,
  newAdmin: Address
): AdminChanged {
  let adminChangedEvent = changetype<AdminChanged>(newMockEvent())

  adminChangedEvent.parameters = new Array()

  adminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdmin",
      ethereum.Value.fromAddress(previousAdmin)
    )
  )
  adminChangedEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return adminChangedEvent
}

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createBeaconUpgradedEvent(beacon: Address): BeaconUpgraded {
  let beaconUpgradedEvent = changetype<BeaconUpgraded>(newMockEvent())

  beaconUpgradedEvent.parameters = new Array()

  beaconUpgradedEvent.parameters.push(
    new ethereum.EventParam("beacon", ethereum.Value.fromAddress(beacon))
  )

  return beaconUpgradedEvent
}

export function createNameRegistryCancelRecoveryEvent(
  by: Address,
  tokenId: BigInt
): NameRegistryCancelRecovery {
  let nameRegistryCancelRecoveryEvent = changetype<NameRegistryCancelRecovery>(
    newMockEvent()
  )

  nameRegistryCancelRecoveryEvent.parameters = new Array()

  nameRegistryCancelRecoveryEvent.parameters.push(
    new ethereum.EventParam("by", ethereum.Value.fromAddress(by))
  )
  nameRegistryCancelRecoveryEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nameRegistryCancelRecoveryEvent
}

export function createChangeFeeEvent(fee: BigInt): ChangeFee {
  let changeFeeEvent = changetype<ChangeFee>(newMockEvent())

  changeFeeEvent.parameters = new Array()

  changeFeeEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )

  return changeFeeEvent
}

export function createChangePoolEvent(pool: Address): ChangePool {
  let changePoolEvent = changetype<ChangePool>(newMockEvent())

  changePoolEvent.parameters = new Array()

  changePoolEvent.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool))
  )

  return changePoolEvent
}

export function createNameRegistryChangeRecoveryAddressEvent(
  tokenId: BigInt,
  recovery: Address
): NameRegistryChangeRecoveryAddress {
  let nameRegistryChangeRecoveryAddressEvent = changetype<
    NameRegistryChangeRecoveryAddress
  >(newMockEvent())

  nameRegistryChangeRecoveryAddressEvent.parameters = new Array()

  nameRegistryChangeRecoveryAddressEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  nameRegistryChangeRecoveryAddressEvent.parameters.push(
    new ethereum.EventParam("recovery", ethereum.Value.fromAddress(recovery))
  )

  return nameRegistryChangeRecoveryAddressEvent
}

export function createNameRegistryChangeTrustedCallerEvent(
  trustedCaller: Address
): NameRegistryChangeTrustedCaller {
  let nameRegistryChangeTrustedCallerEvent = changetype<
    NameRegistryChangeTrustedCaller
  >(newMockEvent())

  nameRegistryChangeTrustedCallerEvent.parameters = new Array()

  nameRegistryChangeTrustedCallerEvent.parameters.push(
    new ethereum.EventParam(
      "trustedCaller",
      ethereum.Value.fromAddress(trustedCaller)
    )
  )

  return nameRegistryChangeTrustedCallerEvent
}

export function createChangeVaultEvent(vault: Address): ChangeVault {
  let changeVaultEvent = changetype<ChangeVault>(newMockEvent())

  changeVaultEvent.parameters = new Array()

  changeVaultEvent.parameters.push(
    new ethereum.EventParam("vault", ethereum.Value.fromAddress(vault))
  )

  return changeVaultEvent
}

export function createNameRegistryDisableTrustedOnlyEvent(): NameRegistryDisableTrustedOnly {
  let nameRegistryDisableTrustedOnlyEvent = changetype<
    NameRegistryDisableTrustedOnly
  >(newMockEvent())

  nameRegistryDisableTrustedOnlyEvent.parameters = new Array()

  return nameRegistryDisableTrustedOnlyEvent
}

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}

export function createInviteEvent(
  inviterId: BigInt,
  inviteeId: BigInt,
  fname: Bytes
): Invite {
  let inviteEvent = changetype<Invite>(newMockEvent())

  inviteEvent.parameters = new Array()

  inviteEvent.parameters.push(
    new ethereum.EventParam(
      "inviterId",
      ethereum.Value.fromUnsignedBigInt(inviterId)
    )
  )
  inviteEvent.parameters.push(
    new ethereum.EventParam(
      "inviteeId",
      ethereum.Value.fromUnsignedBigInt(inviteeId)
    )
  )
  inviteEvent.parameters.push(
    new ethereum.EventParam("fname", ethereum.Value.fromFixedBytes(fname))
  )

  return inviteEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRenewEvent(tokenId: BigInt, expiry: BigInt): Renew {
  let renewEvent = changetype<Renew>(newMockEvent())

  renewEvent.parameters = new Array()

  renewEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  renewEvent.parameters.push(
    new ethereum.EventParam("expiry", ethereum.Value.fromUnsignedBigInt(expiry))
  )

  return renewEvent
}

export function createNameRegistryRequestRecoveryEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): NameRegistryRequestRecovery {
  let nameRegistryRequestRecoveryEvent = changetype<
    NameRegistryRequestRecovery
  >(newMockEvent())

  nameRegistryRequestRecoveryEvent.parameters = new Array()

  nameRegistryRequestRecoveryEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  nameRegistryRequestRecoveryEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  nameRegistryRequestRecoveryEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nameRegistryRequestRecoveryEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createNameRegistryTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): NameRegistryTransfer {
  let nameRegistryTransferEvent = changetype<NameRegistryTransfer>(
    newMockEvent()
  )

  nameRegistryTransferEvent.parameters = new Array()

  nameRegistryTransferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  nameRegistryTransferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  nameRegistryTransferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return nameRegistryTransferEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}
