import { Budget } from '../types'
import i18n from '../i18n'

const budgetName = (budget?: Budget) => {
  if (typeof budget === 'undefined') {
    return ''
  }

  return budget.name || `${i18n.t('budgets.budget')} ${budget.id}`
}

export { budgetName }
