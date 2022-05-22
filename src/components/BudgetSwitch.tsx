import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget } from '../types'
import { ChevronRightIcon, PencilIcon } from '@heroicons/react/solid'
import { PlusCircleIcon, PlusIcon } from '@heroicons/react/outline'
import connectBudgetApi from '../lib/api/budgets'
import { formatMoney } from '../lib/format'
import LoadingSpinner from './LoadingSpinner'
import { safeName } from '../lib/name-helper'
import Error from './Error'

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
        <Link
          to="/budgets/new"
          className="header--action"
          title={t('accounts.create')}
        >
          <PlusIcon className="icon" />
        </Link>
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
                    to={`/budgets/${budget.id}`}
                    title={t('edit')}
                    className="absolute right-4"
                  >
                    <PencilIcon className="icon" />
                  </Link>
                  <Link
                    to="/"
                    className="w-full text-center"
                    onClick={() => {
                      props.selectBudget(budget)
                    }}
                  >
                    <h3
                      className={
                        typeof budget.name === 'undefined' ? 'italic' : ''
                      }
                    >
                      {safeName(budget, 'budget')}
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
                  <Link
                    to="/transactions/new"
                    onClick={() => props.selectBudget(budget)}
                    className="text-sky-600 hover:text-sky-700 flex justify-end"
                  >
                    {t('transactions.add')}
                    <ChevronRightIcon className="inline h-6" />
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
