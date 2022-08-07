import { createClient } from '@urql/core'

const PAGE_SIZE = 100

const client = createClient({
  url: process.env['GRAPH_API_URL'],
})

const _query = async (query, vars={}) => {
  const {data, error} = await client.query(query, vars).toPromise()
  if (error) {
    console.error('Error querying graph:', error)
    throw new Error(error)
  }
  return data
}

const _queryAllRows = async (query, tableName) => {
  const res = []
  let currentPage
  let currentIndex = 0
  console.log(`Querying all rows from ${tableName}`)
  do {
    const data = await _query(query, {skip: currentIndex * PAGE_SIZE})
    currentPage = data ? data[tableName] : []
    console.log(`Page ${currentIndex + 1}: ${currentPage.length} rows`)
    res.push(...currentPage)
    currentIndex++
  } while (currentPage.length > 0)
  console.log(`Found ${res.length} rows in ${tableName}`)
  return res
}

const getUsers = async (updatedSince) => {
  const query = `
    query($skip: Int) {
      users(first: ${PAGE_SIZE}, skip: $skip, where: {updatedAt_gt: ${updatedSince}}, orderBy: updatedAt, orderDirection: asc) {
        id
        username
        address
        url
        initialized
        createdAt
        updatedAt
      }
    }
  `
  let users = await _queryAllRows(query, 'users')
  if (updatedSince === 0) {
    // @noon and @spoon have the same address which should never happen.
    // This is probably due to a bug in the early contract development.
    // @noon is active on Farcaster while @spoon is not so we are skipping @spoon.
    users = users.filter(user => user.id !== 'spoon')
  }
  console.log(`Found ${users.length} users updated in the registry since ${updatedSince}`)
  return users
}

const getDeletedUsers = async (deletedSince) => {
  const query = `
    query($skip: Int) {
      deletedUsers(first: ${PAGE_SIZE}, skip: $skip, where: {deletedAt_gt: ${deletedSince}}, orderBy: deletedAt, orderDirection: asc) {
        id
        username
        address
        deletedAt
      }
    }
  `
  const users = await _queryAllRows(query, 'deletedUsers')
  console.log(`Found ${users.length} users deleted from the registry since ${deletedSince}`)
  return users
}

export default {getUsers, getDeletedUsers}