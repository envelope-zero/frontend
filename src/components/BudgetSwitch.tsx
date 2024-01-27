import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget } from '../types'
import { PencilIcon } from '@heroicons/react/24/solid'
import {
  ArrowsRightLeftIcon,
  EyeIcon,
  PlusCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import connectBudgetApi from '../lib/api/budgets'
import LoadingSpinner from './LoadingSpinner'
import { safeName } from '../lib/name-helper'
import Error from './Error'
import FlyoutMenu from './FlyoutMenu'

type BudgetSwitchProps = {
  selectBudget: (budget?: Budget) => void
  currentBudget?: Budget
}

const BudgetSwitch = (props: BudgetSwitchProps) => {
  const { t }: Translation = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    connectBudgetApi().then(api => {
      api
        .getBudgets()
        .then(data => {
          setBudgets(data)
          setIsLoading(false)
          setError('')
        })
        .catch(err => {
          setError(err.message)
          setIsLoading(false)
        })
    })
  }, [])

  return (
    <>
      <div className="header">
        <h1>{t('budgets.budgets')}</h1>
        <div className="header--action">
          <div>
            <FlyoutMenu
              items={[
                {
                  name: t('budgets.import.importBudget'),
                  href: '/budget-import',
                  description: t('budgets.import.shortDescription'),
                },
              ]}
            />
          </div>
          <Link to="/budgets/new" title={t('budgets.create')}>
            <PlusIcon className="icon-red" />
          </Link>
        </div>
      </div>
      <Error error={error} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-3">
          {budgets.length ? (
            <>
              <ul className="grid grid-cols-1 gap-10 lg:gap-6 lg:grid-cols-2">
                {budgets.map(budget => (
                  <li
                    key={budget.id}
                    className={`card p-0 col-span-1 divide-y divide-gray-200 dark:divide-gray-600 flex flex-col justify-between ${
                      budget.id === props.currentBudget?.id
                        ? 'border-2 border-red-800 dark:border-red-600'
                        : ''
                    }`}
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3
                            className={`truncate text-sm ${
                              budget.name === '' ? 'italic' : ''
                            }`}
                          >
                            {safeName(budget, 'budget')}
                          </h3>
                        </div>
                        {budget.note && (
                          <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                            {budget.note}
                          </p>
                        )}
                      </div>
                      <Link
                        className="flex-shrink-0"
                        to={`/budgets/${budget.id}`}
                        title={t('edit')}
                      >
                        <PencilIcon className="icon-red icon-sm" />
                      </Link>
                    </div>
                    <div className="-mt-px flex divide-x divide-gray-200 dark:divide-gray-600">
                      <div className="flex w-0 flex-1">
                        <Link
                          to="/"
                          onClick={() => {
                            props.selectBudget(budget)
                          }}
                          className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-gray-100"
                        >
                          <EyeIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          {t('open')}
                        </Link>
                      </div>
                      <div className="-ml-px flex w-0 flex-1">
                        <Link
                          to="/transactions/new"
                          onClick={() => props.selectBudget(budget)}
                          className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-gray-100"
                        >
                          <ArrowsRightLeftIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          {t('transactions.add')}
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div>{t('budgets.emptyList')}</div>
              <Link to="/budgets/new" title={t('budgets.create')}>
                <PlusCircleIcon className="icon-red icon-lg mx-auto mt-4" />
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default BudgetSwitch
