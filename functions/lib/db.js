import { createClient } from '@supabase/supabase-js'

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
  console.log(`Inserted ${users.length} users`)
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
    .match({ address: address })
  checkError(error)
  return count > 0
}

const updateOrInsertUser = async (user) => {
  if (await checkUserExists(user.address)) {
    const { error } = await supabase
      .from('accounts')
      .update({
        address: user.address,
        url: user.url,
        initialized: user.initialized,
        entry_updated_at: user.entry_updated_at,
      })
      .match({ username: user.username, address: user.address})
    checkError(error)
    console.log(`Updated user ${user.username}`)
  } else {
    await insertUsers([user])
    console.log(`Inserted user ${user.username}`)
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
    console.log(`Deleted user ${user.username}`)
  } else {
    console.warn(`Could not delete ${address}: No record found in DB`)
  }
}

export default {getLatestUserUpdatedAt, getLatestUserDeletedAt, insertUsers, updateOrInsertUser, deleteUser}