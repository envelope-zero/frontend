import { useTranslation } from 'react-i18next'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { safeName } from '../lib/name-helper'
import { Budget, BudgetMonth, Translation, UUID } from '../types'
import { CalendarDaysIcon } from '@heroicons/react/24/solid'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid'
import { get } from '../lib/api/base'
import { formatMoney } from '../lib/format'
import isSupported from '../lib/is-supported'
import LoadingSpinner from './LoadingSpinner'
import Error from './Error'
import {
  dateFromMonthYear,
  monthYearFromDate,
  translatedMonthFormat,
  shortTranslatedMonthFormat,
} from '../lib/dates'
import CategoryMonth from './CategoryMonth'
import MonthPicker from './MonthPicker'

type DashboardProps = { budget: Budget }

const previousMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-')

  if (month === '01') {
    return new Date(parseInt(year) - 1, 11, 15)
  } else {
    return new Date(parseInt(year), parseInt(month) - 2, 15)
  }
}

const nextMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-')

  if (month === '12') {
    return new Date(parseInt(year) + 1, 0, 15)
  } else {
    return new Date(parseInt(year), parseInt(month), 15)
  }
}

const linkToMonth = (month: string) => `/?month=${month}`

const Dashboard = ({ budget }: DashboardProps) => {
  const { t }: Translation = useTranslation()
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const activeMonth =
    searchParams.get('month')?.substring(0, 7) || monthYearFromDate(new Date())

  const [budgetMonth, setBudgetMonth] = useState<BudgetMonth>()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [editingEnvelope, setEditingEnvelope] = useState<UUID>()

  const useNativeMonthPicker = isSupported.inputTypeMonth()

  const loadBudgetMonth = useCallback(async () => {
    const [year, month] = activeMonth.split('-')

    return get(
      budget.links.groupedMonth.replace('YYYY', year).replace('MM', month)
    )
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

  useEffect(() => {
    loadBudgetMonth().then(() => setIsLoading(false))
  }, [loadBudgetMonth, budget, activeMonth])

  return (
    <div className="dashboard">
      <h1 className="header">{safeName(budget, 'budget')}</h1>

      <div className="month-slider">
        <Link
          to={linkToMonth(monthYearFromDate(previousMonth(activeMonth)))}
          title={translatedMonthFormat.format(previousMonth(activeMonth))}
          onClick={() => setIsLoading(true)}
        >
          <ChevronLeftIcon className="inline h-6" />
          {shortTranslatedMonthFormat.format(previousMonth(activeMonth))}
        </Link>
        <div className="border-red-800">
          {useNativeMonthPicker ? (
            <div className="text-center">
              <label htmlFor="month" className="sr-only">
                {t('dashboard.selectMonth')}
              </label>
              <input
                type="month"
                id="month"
                value={activeMonth}
                className="border-none cursor-pointer text-center"
                onChange={e => {
                  e.preventDefault()
                  navigate(linkToMonth(e.target.value))
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <span className="mr-2 text-center">
                {translatedMonthFormat.format(dateFromMonthYear(activeMonth))}
              </span>
              <button
                type="button"
                title={t('dashboard.selectMonth')}
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker)
                }}
              >
                <CalendarDaysIcon className="icon" />
              </button>
            </div>
          )}
        </div>
        <Link
          to={linkToMonth(monthYearFromDate(nextMonth(activeMonth)))}
          title={translatedMonthFormat.format(nextMonth(activeMonth))}
          onClick={() => setIsLoading(true)}
        >
          {shortTranslatedMonthFormat.format(nextMonth(activeMonth))}
          <ChevronRightIcon className="inline h-6" />
        </Link>
      </div>

      {useNativeMonthPicker ? null : (
        <MonthPicker
          open={showMonthPicker}
          setOpen={setShowMonthPicker}
          activeMonth={activeMonth}
        />
      )}

      {isLoading || !budgetMonth ? (
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
              {formatMoney(budgetMonth.available, budget.currency, 'auto')}
            </div>
            <div className="text-gray-500 font-medium">
              {t('dashboard.available')}
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-4 flex flex-col py-2">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 md:shadow md:ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="inline-block w-full align-middle">
                  <table className="w-full table-fixed">
                    <thead className="bg-white">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 w-1/2"
                        ></th>
                        <th
                          scope="col"
                          className="px-3 pt-3.5 text-right text-sm font-semibold text-gray-900 w-1/4 md:w-1/6"
                        >
                          {t('dashboard.allocation')}
                        </th>
                        <th
                          scope="col"
                          className="hidden md:table-cell px-3 pt-3.5 text-right text-sm font-semibold text-gray-900 w-1/6"
                        >
                          {t('dashboard.spent')}
                        </th>
                        <th
                          scope="col"
                          className="pl-3 pr-4 sm:pr-6 pt-3.5 text-right text-sm font-semibold text-gray-900 w-1/4 md:w-1/6"
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
                          className={`hidden md:table-cell whitespace-nowrap px-3 pb-3 text-sm font-semibold text-right ${
                            budgetMonth.spent < 0 ? 'positive' : 'text-gray-500'
                          }`}
                        >
                          {formatMoney(
                            budgetMonth.spent,
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
                          {formatMoney(budgetMonth.balance, budget.currency)}
                        </td>
                      </tr>
                      {budgetMonth.categories.map(category => (
                        <CategoryMonth
                          key={category.id}
                          category={category}
                          budget={budget}
                          editingEnvelope={editingEnvelope}
                          editEnvelope={setEditingEnvelope}
                          reloadBudgetMonth={() => {
                            setIsLoading(true)
                            loadBudgetMonth().then(() => setIsLoading(false))
                          }}
                          setError={setError}
                        />
                      ))}
                    </tbody>
                  </table>
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
