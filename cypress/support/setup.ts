import { UnpersistedBudget } from '../../src/types'
import connectBudgetApi from '../../src/lib/api/budgets'

export const createBudget = async (budget: UnpersistedBudget) => {
  return connectBudgetApi().then(api => {
    return api.createBudget(budget)
  })
}
