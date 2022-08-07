const convertGraphUsreToDbUser = (user) => {
  return {
    username: user.id,
    address: user.address,
    url: user.url,
    initialized: user.initialized,
    entry_created_at: parseInt(user.createdAt),
    entry_updated_at: parseInt(user.updatedAt),
  }
}

export default {convertGraphUsreToDbUser}