import { createClient } from '@supabase/supabase-js'
import utils from './utils.js'

const supabase = createClient(
  process.env['SUPABASE_URL'],
  process.env['SUPABASE_API_KEY']
)

const _checkError = (error) => {
  if (error) {
    console.error(error)
    throw new Error(error)
  }
}

const _insert = async (tableName, items) => {
  if (!items.length) {
    return
  }
  const { error } = await supabase.from(tableName).insert(items)
  _checkError(error)
  console.log(`Inserted ${items.length} ${tableName}`)
}

const _defaultUserSelect = (fields) => {
  // Test accounts uses localhost and/or starts with __tt_
  return supabase
    .from('accounts')
    .select(fields)
    .not('url', 'like', '%://localhost%')
    .not('username', 'like', '\\_\\_tt\\_%')
}

// Update 200 users at a time to avoid AWS Lambda timeout
const getNextUsersToUpdateDirectory = async () => {
  const { data, error } = await _defaultUserSelect('id, address, url')
    .order('directory_updated_at', { ascending: true, nullsFirst: true })
    .limit(200)
  _checkError(error)
  return data
}

// Update 200 users at a time to avoid AWS Lambda timeout
const getNextUsersToUpdateActivity = async () => {
  const { data, error } = await _defaultUserSelect(
    'id, address, latest_activity_sequence, directories (activity_url)'
  )
    .order('activity_updated_at', { ascending: true, nullsFirst: true })
    .limit(200)
  _checkError(error)
  return data
}

const getLatestUserUpdatedAt = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .order('entry_updated_at', { ascending: false })
    .limit(1)
  _checkError(error)
  return data.length ? data[0].entry_updated_at : 0
}

const getLatestUserDeletedAt = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .order('entry_deleted_at', { ascending: false })
    .not('entry_deleted_at', 'is', null)
    .limit(1)
  _checkError(error)
  return data.length ? data[0].entry_deleted_at : 0
}

const insertUsers = async (users) => {
  await _insert('accounts', users)
}

const _getUser = async (address, createdAt) => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .match({ address: address })
    .lt('entry_created_at', createdAt)
  _checkError(error)
  return data.length ? data[0] : null
}

const _checkUserExists = async (address) => {
  const { count, error } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('address', address)
  _checkError(error)
  return count > 0
}

const updateUser = async (user) => {
  const { error } = await supabase
    .from('accounts')
    .update(user)
    .eq('id', user.id)
  _checkError(error)
  console.log(`Updated account ${user.id}`)
}

const updateUsers = async (update, accountIds) => {
  const { data, error } = await supabase
    .from('accounts')
    .update(update)
    .in('id', accountIds)
  _checkError(error)
  console.log(`Updated ${data.length} accounts`)
}

const insertOrUpdateUser = async (user) => {
  if (await _checkUserExists(user.address)) {
    const { error } = await supabase
      .from('accounts')
      .update(user)
      .eq('address', user.address)
    _checkError(error)
    console.log(`Updated account ${user.address}`)
  } else {
    await insertUsers([user])
    console.log(`Inserted account ${user.address}`)
  }
}

const deleteUser = async (address, deletedAt) => {
  const user = await _getUser(address, deletedAt)
  if (user) {
    const { error } = await supabase.from('accounts').delete().eq('id', user.id)
    _checkError(error)
    console.log(`Deleted account ${user.username}`)
  } else {
    console.warn(
      `Could not delete account: No record found with address ${address}`
    )
  }
}

const upsertDirectories = async (directories) => {
  if (!directories.length) return
  const { error } = await supabase
    .from('directories')
    .upsert(directories, { onConflict: 'account', returning: 'minimal' })
  _checkError(error)
  console.log(`Upserted ${directories.length} directories`)
}

const upsertProofs = async (proofs) => {
  if (!proofs.length) return
  const { error } = await supabase
    .from('proofs')
    .upsert(proofs, { onConflict: 'account', returning: 'minimal' })
  _checkError(error)
  console.log(`Upserted ${proofs.length} proofs`)
}

const deleteProofs = async (accountIds) => {
  if (!accountIds.length) return
  const { data, error } = await supabase
    .from('proofs')
    .delete()
    .in('account', accountIds)
  _checkError(error)
  console.log(`Deleted ${data.length} proofs`)
}

const insertActivities = async (activities) => {
  await _insert('activities', activities)
}

const _checkActivityExists = async (accountId, merkleRoot) => {
  const { count, error } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .match({ account: accountId, merkle_root: merkleRoot })
  _checkError(error)
  return count > 0
}

const markActivityAsDeleted = async (accountId, merkleRoot) => {
  if (await _checkActivityExists(accountId, merkleRoot)) {
    const { error } = await supabase
      .from('activities')
      .update({ deleted: true })
      .match({ account: accountId, merkle_root: merkleRoot })
    _checkError(error)
    console.log(`Marked the following activity as deleted: ${merkleRoot}`)
  } else {
    console.warn(
      `Could not find activity to mark as deleted: ${accountId} ${merkleRoot}`
    )
  }
}

/*
CREATE FUNCTION update_reply_to_activity() RETURNS void AS $$
  update activities as a1
  set reply_to = (
    select a2.id from activities as a2 where a2.merkle_root = a1.reply_parent_merkle_root order by a2.published_at asc limit 1
  )
  where reply_parent_merkle_root != '' and reply_to is null
$$ LANGUAGE SQL;
*/
const updateReplyToActivity = async () => {
  const { error } = await supabase.rpc('update_reply_to_activity')
  _checkError(error)
  console.log(
    'Updated reply_to field of activities via the update_reply_to_activity RPC call'
  )
}

export default {
  getNextUsersToUpdateDirectory,
  getNextUsersToUpdateActivity,
  getLatestUserUpdatedAt,
  getLatestUserDeletedAt,
  insertUsers,
  updateUser,
  updateUsers,
  insertOrUpdateUser,
  deleteUser,
  upsertDirectories,
  upsertProofs,
  deleteProofs,
  insertActivities,
  markActivityAsDeleted,
  updateReplyToActivity,
}
