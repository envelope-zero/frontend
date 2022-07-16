import { Budget, Account } from '../../types'
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

const getExternalAccounts = async (budget: Budget) => {
  return getAccounts(budget).then((accounts: Account[]) =>
    accounts.filter(account => account.external)
  )
}

export { getInternalAccounts, getExternalAccounts }
