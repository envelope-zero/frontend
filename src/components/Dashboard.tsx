import { useTranslation } from 'react-i18next'
import { useEffect, useState, Fragment } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { safeName } from '../lib/name-helper'
import { Budget, BudgetMonth, Translation } from '../types'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid'
import { get } from '../lib/api/base'
import { formatMoney } from '../lib/format'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import { dateFromMonthYear, monthYearFromDate } from '../lib/dates'
import CategoryMonth from './CategoryMonth'

type DashboardProps = { budget: Budget }

const locale = 'en' // TODO: dynamic
const activeDateFormat = new Intl.DateTimeFormat(locale, {
  month: 'long',
  year: 'numeric',
})
const shortMonthFormat = new Intl.DateTimeFormat(locale, { month: 'short' })

const previousMonth = (yearMonth: string) => {
  const [month, year] = yearMonth.split('/')

  if (month === '01') {
    return new Date(parseInt(year) - 1, 11, 1)
  } else {
    return new Date(parseInt(year), parseInt(month) - 2, 1)
  }
}

const nextMonth = (yearMonth: string) => {
  const [month, year] = yearMonth.split('/')

  if (month === '12') {
    return new Date(parseInt(year) + 1, 0, 1)
  } else {
    return new Date(parseInt(year), parseInt(month), 1)
  }
}

const Dashboard = ({ budget }: DashboardProps) => {
  const { t }: Translation = useTranslation()

  const [searchParams] = useSearchParams()
  const activeMonth = searchParams.get('month') || monthYearFromDate(new Date())

  const [budgetMonth, setBudgetMonth] = useState<BudgetMonth>()
  const [error, setError] = useState('')

  useEffect(() => {
    const [month, year] = activeMonth.split('/')

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
  }, [budget, activeMonth])

  return (
    <div className="dashboard">
      <h1 className="header">{safeName(budget, 'budget')}</h1>
      <div className="month-slider">
        <Link
          to={`/?month=${monthYearFromDate(previousMonth(activeMonth))}`}
          title={activeDateFormat.format(previousMonth(activeMonth))}
        >
          <ChevronLeftIcon className="inline h-6" />
          {shortMonthFormat.format(previousMonth(activeMonth))}
        </Link>
        <div className="border-red-800 text-center">
          {activeDateFormat.format(dateFromMonthYear(activeMonth))}
        </div>
        <Link
          to={`/?month=${monthYearFromDate(nextMonth(activeMonth))}`}
          title={activeDateFormat.format(nextMonth(activeMonth))}
        >
          {shortMonthFormat.format(nextMonth(activeMonth))}
          <ChevronRightIcon className="inline h-6" />
        </Link>
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
              {t('dashboard.available')}
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-4 flex flex-col py-2">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 md:shadow md:ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-white">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          ></th>
                          <th
                            scope="col"
                            className="px-3 pt-3.5 text-right text-sm font-semibold text-gray-900"
                          >
                            {t('dashboard.allocation')}
                          </th>
                          <th
                            scope="col"
                            className="pl-3 pr-4 sm:pr-6 pt-3.5 text-right text-sm font-semibold text-gray-900"
                          >
                            {t('dashboard.balance')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td></td>
                          <td
                            className={`whitespace-nowrap px-3 pb-3 text-sm font-semibold text-right ${
                              budgetMonth.budgeted < 0
                                ? 'negative'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatMoney(
                              budgetMonth.budgeted,
                              budget.currency,
                              'auto'
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap pl-3 pr-4 sm:pr-6 pb-3 text-sm font-semibold text-right ${
                              budgetMonth.balance < 0
                                ? 'negative'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatMoney(
                              budgetMonth.balance,
                              budget.currency,
                              'auto'
                            )}
                          </td>
                        </tr>
                        {budgetMonth.categories.map(category => (
                          <CategoryMonth
                            key={category.id}
                            category={category}
                            budget={budget}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
