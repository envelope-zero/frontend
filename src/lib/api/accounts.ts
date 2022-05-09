import { Budget, Account, UnpersistedAccount } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const getAccounts = async (budget: Budget) => {
  return fetch(budget.links.accounts)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const getInternalAccounts = async (budget: Budget) => {
  return getAccounts(budget).then((accounts: Account[]) =>
    accounts.filter(account => !account.external)
  )
}

const getAccount = async (id: string, budget: Budget) => {
  const url = new URL(budget.links.accounts)
  url.pathname += `/${id}`

  return fetch(url.href)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const updateAccount = async (account: Account) => {
  return fetch(account.links.self, {
    method: 'PATCH',
    body: JSON.stringify(account),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const createAccount = async (account: UnpersistedAccount, budget: Budget) => {
  return fetch(budget.links.accounts, {
    method: 'POST',
    body: JSON.stringify(account),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data.data)
}

const deleteAccount = async (account: Account) => {
  return fetch(account.links.self, { method: 'DELETE' }).then(checkStatus)
}

export {
  getInternalAccounts,
  getAccount,
  updateAccount,
  createAccount,
  deleteAccount,
}
