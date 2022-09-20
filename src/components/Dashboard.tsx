import { useTranslation } from 'react-i18next'
import { useEffect, useState, Fragment } from 'react'
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
                          <Fragment key={category.id}>
                            <tr className="border-t border-gray-200">
                              <th
                                colSpan={3}
                                scope="colgroup"
                                className="bg-gray-50 px-4 py-2 text-left text-sm font-bold text-gray-900 sm:px-6"
                              >
                                {category.name}
                              </th>
                            </tr>
                            {category.envelopes.map((envelope, i) => (
                              <tr
                                key={envelope.id}
                                className={`border-t border-gray-${
                                  i === 0 ? '300' : '200'
                                }`}
                              >
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {envelope.name}
                                </td>
                                <td
                                  className={`whitespace-nowrap px-3 py-4 text-sm text-right ${
                                    envelope.allocation < 0
                                      ? 'negative'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {formatMoney(
                                    envelope.allocation,
                                    budget.currency,
                                    'auto'
                                  )}
                                </td>
                                <td
                                  className={`whitespace-nowrap pl-3 pr-4 sm:pr-6 py-4 text-sm text-right ${
                                    envelope.balance < 0
                                      ? 'negative'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {formatMoney(
                                    envelope.balance,
                                    budget.currency,
                                    'auto'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </Fragment>
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
