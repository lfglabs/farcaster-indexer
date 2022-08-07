import { createClient } from '@supabase/supabase-js'
import utils from './utils.js'

const supabase = createClient(
  process.env['SUPABASE_URL'],
  process.env['SUPABASE_API_KEY']
)

const checkError = (error) => {
  if (error) {
    console.error(error)
    throw new Error(error)
  }
}

// Update 150 users at a time to avoid AWS Lambda timeout
const getNextUsersToUpdateDirectory = async () => {
  const {data, error} = await supabase
    .from('accounts')
    .select()
    .order('directory_updated_at', { ascending: true, nullsFirst: true })
    .limit(150)
  checkError(error)
  return data
}

const getLatestUserUpdatedAt = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .order('entry_updated_at', { ascending: false })
    .limit(1)
  checkError(error)
  return data.length ? data[0].entry_updated_at : 0;
}

const getLatestUserDeletedAt = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .order('entry_deleted_at', { ascending: false })
    .not('entry_deleted_at', 'is', null)
    .limit(1)
  checkError(error)
  return data.length ? data[0].entry_deleted_at : 0;
}

const insertUsers = async (users) => {
  if (!users.length) {
    return
  }
  const { error } = await supabase
    .from('accounts')
    .insert(users)
  checkError(error)
  console.log(`Inserted ${users.length} accounts`)
}

const _getUser = async (address, createdAt) => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .match({ address: address })
    .lt('entry_created_at', createdAt)
  checkError(error)
  return data.length ? data[0] : null
}

const checkUserExists = async (address) => {
  const { count, error } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('address', address)
  checkError(error)
  return count > 0
}

const updateUser = async (user) => {
  const { error } = await supabase
    .from('accounts')
    .update(user)
    .eq('address', user.address)
  checkError(error)
  console.log(`Updated account ${user.address}`)
}

const insertOrUpdateUser = async (user) => {
  if (await checkUserExists(user.address)) {
    updateUser(user)
  } else {
    await insertUsers([user])
    console.log(`Inserted account ${user.username}`)
  }
}

const deleteUser = async (address, deletedAt) => {
  const user = await _getUser(address, deletedAt)
  if (user) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', user.id)
    checkError(error)
    console.log(`Deleted account ${user.username}`)
  } else {
    console.warn(`Could not delete account: No record found with address ${address}`)
  }
}

const _getDirectory = async (accountId) => {
  const { data, error } = await supabase
    .from('directories')
    .select()
    .eq('account', accountId)
  checkError(error)
  return data.length ? data[0] : null
}

const insertDirectories = async (directories) => {
  if (!directories.length) {
    return
  }
  const { error } = await supabase
    .from('directories')
    .insert(directories)
  checkError(error)
  console.log(`Inserted ${directories.length} directories`)
}

const insertOrUpdateDirectory = async (directory) => {
  const curDirectory = await _getDirectory(directory.account)
  if (curDirectory) {
    if (!utils.checkDirectoryEqual(curDirectory, directory)) {
      const { error } = await supabase
        .from('directories')
        .update(directory)
        .eq('account', directory.account)
      checkError(error)
      console.log(`Updated directory for account ${directory.account}`)
    }
  } else {
    insertDirectories([directory])
  }
}

const _getProof = async (accountId) => {
  const { data, error } = await supabase
    .from('proofs')
    .select()
    .eq('account', accountId)
  checkError(error)
  return data.length ? data[0] : null
}

const insertProofs = async (proofs) => {
  if (!proofs.length) {
    return
  }
  const { error } = await supabase
    .from('proofs')
    .insert(proofs)
  checkError(error)
  console.log(`Inserted ${proofs.length} proofs`)
}

const insertOrUpdateProof = async (proof) => {
  const curProof = await _getProof(proof.account)
  if (curProof) {
    if (!utils.checkProofEqual(curProof, proof)) {
      const { error } = await supabase
        .from('proofs')
        .update(proof)
        .eq('account', proof.account)
      checkError(error)
      console.log(`Updated proof for account ${proof.account}`)
    }
  } else {
    insertProofs([proof])
  }
}

const deleteProof = async (accountId) => {
  const proof = await _getProof(accountId)
  if (proof) {
    const { error } = await supabase
      .from('proofs')
      .delete()
      .eq('account', accountId)
    checkError(error)
    console.log(`Deleted proof for account ${accountId}`)
  } else {
    console.warn(`Could not delete proof: No record found for account ${accountId}`)
  }
}

export default {
  getNextUsersToUpdateDirectory,
  getLatestUserUpdatedAt,
  getLatestUserDeletedAt,
  insertUsers,
  updateUser,
  insertOrUpdateUser,
  deleteUser,
  insertOrUpdateDirectory,
  insertOrUpdateProof,
  deleteProof,
}