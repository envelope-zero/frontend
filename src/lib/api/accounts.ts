import { ApiResponse, Budget, Account, UnpersistedAccount } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const endpoint =
  process.env.REACT_APP_API_ENDPOINT || window.location.origin + '/api/v1'

const getAccounts = async (budget: ApiResponse<Budget>) => {
  return fetch(budget.links?.accounts || 'TODO')
    .then(checkStatus)
    .then(parseJSON)
}

const getInternalAccounts = async (budget: ApiResponse<Budget>) => {
  return getAccounts(budget).then((accounts: ApiResponse<Account[]>) =>
    accounts.data.filter(account => !account.external)
  )
}

const getAccount = async (id: string, budget: ApiResponse<Budget>) => {
  return fetch(`${budget.links?.accounts}/${id}` || 'TODO')
    .then(checkStatus)
    .then(parseJSON)
}

const updateAccount = async (account: Account) => {
  return fetch(
    `${endpoint}/budgets/${account.budgetId}/accounts/${account.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(account),
      headers: { 'Content-Type': 'application/json' },
    }
  )
    .then(checkStatus)
    .then(parseJSON)
}

const createAccount = async (
  account: UnpersistedAccount,
  budget: ApiResponse<Budget>
) => {
  return fetch(`${endpoint}/budgets/${budget.data.id}/accounts`, {
    method: 'POST',
    body: JSON.stringify(account),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(checkStatus)
    .then(parseJSON)
}

const deleteAccount = async (account: ApiResponse<Account>) => {
  return fetch(
    `${endpoint}/budgets/${account.data.budgetId}/accounts/${account.data.id}`,
    { method: 'DELETE' }
  ).then(checkStatus)
}

export {
  getInternalAccounts,
  getAccount,
  updateAccount,
  createAccount,
  deleteAccount,
}
