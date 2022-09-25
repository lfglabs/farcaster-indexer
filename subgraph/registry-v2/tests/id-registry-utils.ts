import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CancelRecovery,
  ChangeHome,
  ChangeRecoveryAddress,
  ChangeTrustedCaller,
  DisableTrustedOnly,
  OwnershipTransferred,
  Register,
  RequestRecovery,
  Transfer
} from "../generated/IdRegistry/IdRegistry"

export function createCancelRecoveryEvent(
  by: Address,
  id: BigInt
): CancelRecovery {
  let cancelRecoveryEvent = changetype<CancelRecovery>(newMockEvent())

  cancelRecoveryEvent.parameters = new Array()

  cancelRecoveryEvent.parameters.push(
    new ethereum.EventParam("by", ethereum.Value.fromAddress(by))
  )
  cancelRecoveryEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return cancelRecoveryEvent
}

export function createChangeHomeEvent(id: BigInt, url: string): ChangeHome {
  let changeHomeEvent = changetype<ChangeHome>(newMockEvent())

  changeHomeEvent.parameters = new Array()

  changeHomeEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  changeHomeEvent.parameters.push(
    new ethereum.EventParam("url", ethereum.Value.fromString(url))
  )

  return changeHomeEvent
}

export function createChangeRecoveryAddressEvent(
  id: BigInt,
  recovery: Address
): ChangeRecoveryAddress {
  let changeRecoveryAddressEvent = changetype<ChangeRecoveryAddress>(
    newMockEvent()
  )

  changeRecoveryAddressEvent.parameters = new Array()

  changeRecoveryAddressEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  changeRecoveryAddressEvent.parameters.push(
    new ethereum.EventParam("recovery", ethereum.Value.fromAddress(recovery))
  )

  return changeRecoveryAddressEvent
}

export function createChangeTrustedCallerEvent(
  trustedCaller: Address
): ChangeTrustedCaller {
  let changeTrustedCallerEvent = changetype<ChangeTrustedCaller>(newMockEvent())

  changeTrustedCallerEvent.parameters = new Array()

  changeTrustedCallerEvent.parameters.push(
    new ethereum.EventParam(
      "trustedCaller",
      ethereum.Value.fromAddress(trustedCaller)
    )
  )

  return changeTrustedCallerEvent
}

export function createDisableTrustedOnlyEvent(): DisableTrustedOnly {
  let disableTrustedOnlyEvent = changetype<DisableTrustedOnly>(newMockEvent())

  disableTrustedOnlyEvent.parameters = new Array()

  return disableTrustedOnlyEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRegisterEvent(
  to: Address,
  id: BigInt,
  recovery: Address,
  url: string
): Register {
  let registerEvent = changetype<Register>(newMockEvent())

  registerEvent.parameters = new Array()

  registerEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  registerEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  registerEvent.parameters.push(
    new ethereum.EventParam("recovery", ethereum.Value.fromAddress(recovery))
  )
  registerEvent.parameters.push(
    new ethereum.EventParam("url", ethereum.Value.fromString(url))
  )

  return registerEvent
}

export function createRequestRecoveryEvent(
  from: Address,
  to: Address,
  id: BigInt
): RequestRecovery {
  let requestRecoveryEvent = changetype<RequestRecovery>(newMockEvent())

  requestRecoveryEvent.parameters = new Array()

  requestRecoveryEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  requestRecoveryEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  requestRecoveryEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return requestRecoveryEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  id: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return transferEvent
}
