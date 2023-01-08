import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget } from '../types'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { PencilIcon } from '@heroicons/react/24/solid'
import { PlusCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import connectBudgetApi from '../lib/api/budgets'
import LoadingSpinner from './LoadingSpinner'
import { safeName } from '../lib/name-helper'
import Error from './Error'
import FlyoutMenu from './FlyoutMenu'

type BudgetSwitchProps = {
  selectBudget: (budget?: Budget) => void
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
            <ul className="grid grid-cols-1 gap-5 sm:gap-6">
              {budgets.map(budget => (
                <li
                  key={budget.id}
                  className="box col-span-1 relative hover:bg-gray-200 p-4 md:hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <Link
                    to="/"
                    className="w-full text-center"
                    onClick={() => {
                      props.selectBudget(budget)
                    }}
                  >
                    <div className="flex justify-center">
                      <h3
                        className={
                          typeof budget.name === 'undefined' ? 'italic' : ''
                        }
                      >
                        {safeName(budget, 'budget')}
                      </h3>
                      <Link
                        to={`/budgets/${budget.id}`}
                        title={t('edit')}
                        className="pl-2"
                      >
                        <PencilIcon className="icon-red icon-sm" />
                      </Link>
                    </div>
                    {budget.note ? (
                      <p className="text-sm text-gray-500 whitespace-pre-line">
                        {budget.note}
                      </p>
                    ) : null}
                    <div className="flex justify-end">
                      <Link
                        to="/transactions/new"
                        onClick={() => props.selectBudget(budget)}
                        className="text-sky-600 hover:text-sky-700"
                      >
                        {t('transactions.add')}
                        <ChevronRightIcon className="inline h-6" />
                      </Link>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
