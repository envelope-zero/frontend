import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { safeName } from '../lib/name-helper'
import { Budget, BudgetMonth, Translation } from '../types'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid'
import { get } from '../lib/api/base'
import { formatMoney } from '../lib/format'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'

type DashboardProps = { budget: Budget }

const locale = 'en' // TODO: dynamic
const activeDateFormat = new Intl.DateTimeFormat(locale, {
  month: 'long',
  year: 'numeric',
})
const shortMonthFormat = new Intl.DateTimeFormat(locale, { month: 'short' })

const Dashboard = ({ budget }: DashboardProps) => {
  const { t }: Translation = useTranslation()

  const [activeDate, setActiveDate] = useState(new Date())
  const [budgetMonth, setBudgetMonth] = useState<BudgetMonth>()
  const [error, setError] = useState('')

  useEffect(() => {
    const year = activeDate.toLocaleString('default', { year: 'numeric' })
    const month = activeDate.toLocaleString('default', { month: '2-digit' })

    get(budget.links.groupedMonth.replace('YYYY', year).replace('MM', month))
      .then(data => {
        setBudgetMonth(data)
        if (error) {
          setError('')
        }
      })
      .catch(err => {
        setError(err)
      })
  }, [budget, activeDate])

  const previousMonth = () => {
    const activeYear = activeDate.getFullYear()
    const activeMonth = activeDate.getMonth()

    if (activeMonth === 0) {
      return new Date(activeYear - 1, 11, 1)
    } else {
      return new Date(activeYear, activeMonth - 1, 1)
    }
  }

  const nextMonth = () => {
    const activeYear = activeDate.getFullYear()
    const activeMonth = activeDate.getMonth()

    if (activeMonth === 11) {
      return new Date(activeYear + 1, 0, 1)
    } else {
      return new Date(activeYear, activeMonth + 1, 1)
    }
  }

  return (
    <div className="dashboard">
      <h1 className="header">{safeName(budget, 'budget')}</h1>
      <div className="month-slider">
        <button
          onClick={() => {
            setActiveDate(previousMonth())
          }}
          title={activeDateFormat.format(previousMonth())}
        >
          <ChevronLeftIcon className="inline h-6" />
          {shortMonthFormat.format(previousMonth())}
        </button>
        <div className="border-red-800 text-center">
          {activeDateFormat.format(activeDate)}
        </div>
        <button
          onClick={() => {
            setActiveDate(nextMonth())
          }}
          title={activeDateFormat.format(nextMonth())}
        >
          {shortMonthFormat.format(nextMonth())}
          <ChevronRightIcon className="inline h-6" />
        </button>
      </div>
      {!budgetMonth ? (
        <LoadingSpinner />
      ) : (
        <>
          <Error error={error} />
          <div className="box w-full mt-4 mb-2 py-2 text-center">
            <div
              className={`${
                budgetMonth.available >= 0 ? 'positive' : 'negative'
              } text-xl font-bold`}
            >
              {formatMoney(budgetMonth.available, budget.currency)}
            </div>
            <div className="text-gray-500 font-medium">
              {t('allocations.available')}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
