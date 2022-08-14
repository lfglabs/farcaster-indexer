import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env['SUPABASE_URL'],
  process.env['SUPABASE_API_KEY']
)

const _checkError = (error) => {
  if (error) {
    throw new Error(error.message)
  }
}

const _defaultAccountSelect = (fields) => {
  // Test accounts uses localhost and/or starts with __tt_
  return supabase
    .from('accounts')
    .select(fields)
    .not('url', 'like', '%://localhost%')
    .not('username', 'like', '\\_\\_tt\\_%')
}

// Update 200 accounts at a time to avoid AWS Lambda timeout
const getNextAccountsToUpdateDirectory = async () => {
  const { data, error } = await _defaultAccountSelect('id, address, url')
    .order('directory_updated_at', { ascending: true, nullsFirst: true })
    .limit(200)
  _checkError(error)
  return data
}

// Update 200 accounts at a time to avoid AWS Lambda timeout
const getNextAccountsToUpdateActivity = async () => {
  const { data, error } = await _defaultAccountSelect(
    'id, address, latest_activity_sequence, directories (activity_url)'
  )
    .order('activity_updated_at', { ascending: true, nullsFirst: true })
    .limit(200)
  _checkError(error)
  return data
}

const getLatestAccountUpdatedAt = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .order('entry_updated_at', { ascending: false })
    .limit(1)
  _checkError(error)
  return data.length ? data[0].entry_updated_at : 0
}

const getLatestAccountDeletedAt = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .order('entry_deleted_at', { ascending: false })
    .not('entry_deleted_at', 'is', null)
    .limit(1)
  _checkError(error)
  return data.length ? data[0].entry_deleted_at : 0
}

const insertAccounts = async (accounts) => {
  if (!accounts.length) return
  const { error } = await supabase.from('accounts').insert(accounts)
  _checkError(error)
  console.log(`Inserted ${accounts.length} accounts`)
}

const _getAccount = async (address, createdAt) => {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .match({ address: address })
    .lt('entry_created_at', createdAt)
  _checkError(error)
  return data.length ? data[0] : null
}

const _checkAccountExists = async (address) => {
  const { count, error } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('address', address)
  _checkError(error)
  return count > 0
}

const updateAccount = async (account) => {
  const { error } = await supabase
    .from('accounts')
    .update(account)
    .eq('id', account.id)
  _checkError(error)
  console.log(`Updated account ${account.id}`)
}

const updateAccounts = async (update, accountIds) => {
  const { data, error } = await supabase
    .from('accounts')
    .update(update)
    .in('id', accountIds)
  _checkError(error)
  console.log(`Updated ${data.length} accounts`)
}

const insertOrUpdateAccount = async (account) => {
  if (await _checkAccountExists(account.address)) {
    const { error } = await supabase
      .from('accounts')
      .update(account)
      .eq('address', account.address)
    _checkError(error)
    console.log(`Updated account ${account.address}`)
  } else {
    await insertAccounts([account])
    console.log(`Inserted account ${account.address}`)
  }
}

const deleteAccount = async (address, deletedAt) => {
  const account = await _getAccount(address, deletedAt)
  if (account) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', account.id)
    _checkError(error)
    console.log(`Deleted account ${account.username}`)
  } else {
    console.warn(
      `Could not delete account: No record found with address ${address}`
    )
  }
}

const _upsert = async (tableName, items, onConflict, returning = 'minimal') => {
  if (!items.length) return { data: [] }
  const { data, error } = await supabase
    .from(tableName)
    .upsert(items, { onConflict: onConflict, returning: returning })
  _checkError(error)
  console.log(`Upserted ${items.length} ${tableName}`)
  return { data }
}

const upsertDirectories = async (directories) => {
  return _upsert('directories', directories, 'account')
}

const upsertProofs = async (proofs) => {
  return _upsert('proofs', proofs, 'account')
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

const upsertProfiles = async (profiles) => {
  return _upsert('profiles', profiles, 'account')
}

const upsertActivities = async (activities) => {
  return _upsert('activities', activities, 'account, sequence')
}

const markActivitiesAsDeleted = async (accountId, merkleRoots) => {
  if (!merkleRoots.length) return
  const { data, error } = await supabase
    .from('activities')
    .update({ deleted: true })
    .eq('account', accountId) // Only can delete own activities
    .in('merkle_root', merkleRoots)
  try {
    _checkError(error)
  } catch (error) {
    // Try break up updates into two requests if URI too long
    // TODO: This should be a generic function for all batch updates
    if (error.message?.startsWith('URI too long')) {
      const breakIndex = Math.floor(merkleRoots.length / 2)
      if (breakIndex !== 0) {
        await markActivitiesAsDeleted(
          accountId,
          merkleRoots.slice(0, breakIndex)
        )
        await markActivitiesAsDeleted(accountId, merkleRoots.slice(breakIndex))
        return
      }
    }
    throw error
  }
  if (data.length < merkleRoots.length) {
    console.warn(
      `Could not find ${
        merkleRoots.length - data.length
      } activities to mark as deleted`
    )
  }
  console.log(
    `Marked ${data.length} activities as deleted for account ${accountId}`
  )
}

/*
CREATE FUNCTION update_latest_activity_sequence(account_ids int[]) RETURNS void AS $$
    UPDATE accounts AS a
    SET latest_activity_sequence = (
      SELECT max(sequence) FROM activities WHERE a.id = account
    )
    WHERE a.id = ANY(account_ids)
$$ language sql;
*/
const updateLatestActivitySequence = async (accountIds) => {
  const { error } = await supabase.rpc('update_latest_activity_sequence', {
    account_ids: accountIds,
  })
  _checkError(error)
  console.log(
    `Updated latest_activity_sequence field of ${accountIds.length} accounts via the update_latest_activity_sequence RPC call`
  )
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

const getNextActivitiesToUpdateIndexOpengraphs = async () => {
  const { data, error } = await supabase
    .rpc('select_activities_to_index_opengraphs')
    .order('published_at', { ascending: false })
    .limit(300)
  _checkError(error)
  return data
}

const upsertOpengraphs = async (activityId, opengraphs) => {
  if (opengraphs.length) {
    const { data } = await _upsert(
      'opengraphs',
      opengraphs,
      'normalized_url',
      'representation'
    )
    const manyToMany = data.map((og) => {
      return { activity: activityId, opengraph: og.id }
    })
    return _upsert('activities_opengraphs', manyToMany, 'activity, opengraph')
  } else {
    // Insert an entry with opengraph null indicates opengraphs were scraped but empty
    const { error } = await supabase
      .from('activities_opengraphs')
      .insert({ activity: activityId, opengraph: null })
    _checkError(error)
    console.log(`Marked activity ${activityId} as scraped`)
  }
}

const updateOpengraphIndexingErrors = async (activityId, errors) => {
  const { error } = await supabase
    .from('activities')
    .update({ opengraph_indexing_errors: errors })
    .eq('id', activityId)
  _checkError(error)
  console.log(`Logged opengraph indexing errors for activity ${activityId}`)
}

export default {
  getNextAccountsToUpdateDirectory,
  getNextAccountsToUpdateActivity,
  getLatestAccountUpdatedAt,
  getLatestAccountDeletedAt,
  insertAccounts,
  updateAccount,
  updateAccounts,
  insertOrUpdateAccount,
  deleteAccount,
  upsertDirectories,
  upsertProofs,
  deleteProofs,
  upsertProfiles,
  upsertActivities,
  markActivitiesAsDeleted,
  updateLatestActivitySequence,
  updateReplyToActivity,
  getNextActivitiesToUpdateIndexOpengraphs,
  upsertOpengraphs,
  updateOpengraphIndexingErrors,
}
