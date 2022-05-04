import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, UnpersistedBudget, Budget, ApiResponse } from '../types'
import {
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
} from '../lib/api/budgets'
import cookie from '../lib/cookie'

type BudgetFormProps = {
  setBudgetId: (id: string | undefined) => void
}

const BudgetForm = (props: BudgetFormProps) => {
  const { t }: Translation = useTranslation()
  const { budgetId } = useParams()
  const navigate = useNavigate()

  const [budget, setBudget] = useState<UnpersistedBudget | Budget>()

  useEffect(() => {
    if (typeof budgetId !== 'undefined') {
      getBudget(budgetId).then(setBudget)
    }
  }, [budgetId])

  const updateValue = (key: keyof Budget, value: any) => {
    setBudget({ ...(budget || {}), [key]: value })
  }

  const navigateToDashboard = (selectedBudget: ApiResponse<Budget>) => {
    if (typeof budgetId === 'undefined') {
      const id = selectedBudget.data.id.toString()
      cookie.set('budgetId', id)
      props.setBudgetId(id)
    }
    navigate('/')
  }

  return (
    <>
      <div className="header">
        <h1>{t('budgets.budget')}</h1>
        <div
          className="header--action"
          onClick={() => {
            if (typeof budget === 'undefined') {
              return
            }

            if ('id' in budget) {
              updateBudget(budget.id.toString(), budget).then(newBudget =>
                navigateToDashboard(newBudget)
              )
            } else {
              createBudget(budget).then(newBudget =>
                navigateToDashboard(newBudget)
              )
            }
          }}
        >
          {t('save')}
        </div>
      </div>

      <form className="space-y-8 divide-y divide-gray-200">
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
        {typeof budgetId === 'undefined' ? null : (
          <div className="pt-5">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('budgets.confirmDelete'))) {
                  deleteBudget(budgetId).then(() => {
                    props.setBudgetId(undefined)
                    cookie.erase('budgetId')
                    navigate('/budgets')
                  })
                }
              }}
              className="box w-full text-red-800 py-2 px-4 text-sm font-medium hover:bg-gray-200"
            >
              {t('budgets.delete')}
            </button>
          </div>
        )}
      </form>
    </>
  )
}

export default BudgetForm
