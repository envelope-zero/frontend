import { ApiResponse, Budget, Account } from '../../types'
import { checkStatus, parseJSON } from '../fetch-helper'

const getAccounts = async (budget: ApiResponse<Budget>) => {
  return fetch(budget?.links?.accounts || 'TODO')
    .then(checkStatus)
    .then(parseJSON)
}

const getInternalAccounts = async (budget: ApiResponse<Budget>) => {
  return getAccounts(budget).then((accounts: ApiResponse<Account[]>) =>
    accounts.data.filter(account => !account.external)
  )
}

export { getInternalAccounts }
