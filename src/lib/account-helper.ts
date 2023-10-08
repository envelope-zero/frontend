import { Account } from '../types'

const isExternal = (accountId: string | undefined, accounts: Account[]) => {
  console.log(`looking for ${accountId} in ${accounts}`)
  if (typeof accountId === 'undefined') {
    return true
  }

  const account = accounts.find(acc => acc.id === accountId)
  if (typeof account === 'undefined') {
    return true
  }

  return account.external
}

export { isExternal }
