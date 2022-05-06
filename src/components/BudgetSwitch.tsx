import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget, ApiResponse } from '../types'
import { PencilIcon } from '@heroicons/react/solid'
import { PlusCircleIcon } from '@heroicons/react/outline'
import { getBudgets } from '../lib/api/budgets'
import { formatMoney } from '../lib/format'
import LoadingSpinner from './LoadingSpinner'
import { budgetName } from '../lib/budget-helper'

type BudgetSwitchProps = {
  selectBudget: (budget?: ApiResponse<Budget>) => void
}

const BudgetSwitch = (props: BudgetSwitchProps) => {
  const { t }: Translation = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [budgets, setBudgets] = useState<ApiResponse<Budget[]>>({ data: [] })

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = () => {
    getBudgets().then(data => {
      setBudgets(data)
      setIsLoading(false)
    })
  }

  return (
    <>
      <h1 className="header">{t('budgets.budgets')}</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-3">
          {budgets.data.length ? (
            <ul className="grid grid-cols-1 gap-5 sm:gap-6">
              {budgets.data.map(budget => (
                <li
                  key={budget.id}
                  className="box col-span-1 flex hover:bg-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <Link
                    to="/"
                    className="w-full text-center"
                    onClick={() => {
                      props.selectBudget({ data: budget })
                    }}
                  >
                    <h3
                      className={
                        typeof budget.name === 'undefined' ? 'italic' : ''
                      }
                    >
                      {budgetName(budget)}
                    </h3>
                    {budget.note ? (
                      <p className="text-sm text-gray-500 whitespace-pre-line">
                        {budget.note}
                      </p>
                    ) : null}
                    <div className="text-lime-600 mt-2 text-lg">
                      <strong>{formatMoney(1337, budget.currency)}</strong>
                    </div>
                  </Link>
                  <Link to={`/budgets/${budget.id}`} title={t('edit')}>
                    <PencilIcon className="icon" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div>{t('budgets.emptyList')}</div>
          )}
          <Link to="/budgets/new" title={t('budgets.create')}>
            <PlusCircleIcon className="icon icon-lg mx-auto mt-4" />
          </Link>
        </div>
      )}
    </>
  )
}

export default BudgetSwitch
