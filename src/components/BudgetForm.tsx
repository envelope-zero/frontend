import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Translation,
  UnpersistedBudget,
  Budget,
  BudgetApiConnection,
} from '../types'
import connectBudgetApi, {
  updateBudget,
  deleteBudget,
} from '../lib/api/budgets'

type BudgetFormProps = {
  selectBudget: (budget?: Budget) => void
  selectedBudget?: Budget
}

const BudgetForm = ({ selectBudget, selectedBudget }: BudgetFormProps) => {
  const { t }: Translation = useTranslation()
  const params = useParams()
  const navigate = useNavigate()

  const budgetId = params.budgetId || selectedBudget?.id.toString()

  const [budget, setBudget] = useState<UnpersistedBudget | Budget>({})
  const [budgetApi, setBudgetApi] = useState<BudgetApiConnection>()

  const isPersisted = typeof budgetId !== 'undefined' && budgetId !== 'new'

  useEffect(() => {
    connectBudgetApi().then(api => {
      setBudgetApi(api)
      if (typeof selectedBudget !== 'undefined') {
        setBudget(selectedBudget)
      } else if (isPersisted) {
        api.getBudget(budgetId).then(setBudget)
      }
    })
  }, [budgetId, selectedBudget, isPersisted])

  const updateValue = (key: keyof Budget, value: any) => {
    setBudget({ ...budget, [key]: value })
  }

  const navigateToDashboard = (selectedBudget: Budget) => {
    selectBudget(selectedBudget)
    navigate('/')
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()

        if (typeof budget === 'undefined') {
          return
        }

        if ('id' in budget) {
          updateBudget(budget).then(navigateToDashboard)
        } else {
          budgetApi?.createBudget(budget).then(navigateToDashboard)
        }
      }}
    >
      <div className="header">
        <h1>{t('budgets.budget')}</h1>
        <div className="header--action">
          <Link to={-1 as any} className="header--action__secondary">
            {t('cancel')}
          </Link>
          <button type="submit">{t('save')}</button>
        </div>
      </div>

      <div className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  {t('budgets.name')}
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={budget?.name || ''}
                      onChange={e => updateValue('name', e.target.value)}
                      className="flex-1 block w-full min-w-0 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  {t('budgets.currency')}
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="max-w-lg flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="currency"
                      id="currency"
                      value={budget?.currency || ''}
                      onChange={e => updateValue('currency', e.target.value)}
                      className="flex-1 block w-full min-w-0 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  {t('budgets.note')}
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={budget?.note || ''}
                    onChange={e => updateValue('note', e.target.value)}
                    className="max-w-lg shadow-sm block w-full sm:text-sm border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {isPersisted ? (
          <div className="pt-5">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('budgets.confirmDelete'))) {
                  deleteBudget(budget as Budget).then(() => {
                    selectBudget(undefined)
                    navigate('/budgets')
                  })
                }
              }}
              className="box w-full text-red-800 py-2 px-4 text-sm font-medium hover:bg-gray-200"
            >
              {t('budgets.delete')}
            </button>
          </div>
        ) : null}
      </div>
    </form>
  )
}

export default BudgetForm
