import {
  Budget,
  UnpersistedAccount,
  UnpersistedBudget,
  UnpersistedCategory,
  UnpersistetEnvelope,
} from '../../src/types'
import connectBudgetApi from '../../src/lib/api/budgets'
import { api } from '../../src/lib/api/base'

export const createBudget = async (budget: UnpersistedBudget) => {
  return connectBudgetApi().then(api => {
    return api.createBudget(budget)
  })
}

export const createAccount = async (
  account: UnpersistedAccount,
  budget: Budget
) => api('accounts').create(account, budget)

export const createCategory = async (
  category: UnpersistedCategory,
  budget: Budget
) => api('categories').create(category, budget)

export const createEnvelope = async (
  envelope: UnpersistetEnvelope,
  budget: Budget
) => {
  const envelopeApi = api('envelopes')

  if (typeof envelope.categoryId !== 'undefined') {
    return envelopeApi.create(envelope, budget)
  }

  return createCategory({}, budget).then(category =>
    envelopeApi.create({ ...envelope, categoryId: category.id }, budget)
  )
}
