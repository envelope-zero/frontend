import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget } from '../types'
import { PencilIcon } from '@heroicons/react/solid'
import cookie from '../lib/cookie'
import { getBudgets } from '../lib/api/budgets'
import { formatMoney } from '../lib/format'
import LoadingSpinner from './LoadingSpinner'

type BudgetSwitchProps = {
  setBudgetId: (id: string) => void
}

const BudgetSwitch = (props: BudgetSwitchProps) => {
  const { t }: Translation = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = () => {
    getBudgets().then(data => {
      setBudgets(data)
      setIsLoading(false)
    })
  }

  const setBudgetId = (id: string) => {
    cookie.set('budgetId', id)
    props.setBudgetId(id)
  }

  return (
    <>
      <h1 className="header">{t('budgets.budgets')}</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
          {budgets.map(budget => (
            <li
              key={budget.id}
              className="box col-span-1 flex hover:bg-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              <Link
                to="/"
                className="w-full text-center"
                onClick={() => {
                  setBudgetId(budget.id.toString())
                }}
              >
                <h3>{budget.name || `${t('budgets.budget')} ${budget.id}`}</h3>
                {budget.note ? (
                  <p className="text-sm text-gray-500">{budget.note}</p>
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
      )}
    </>
  )
}

export default BudgetSwitch
