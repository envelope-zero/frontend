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
import QuickAllocationForm from './QuickAllocationForm'
import { replaceMonthInLinks } from '../lib/month-helper'

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
    return get(replaceMonthInLinks(budget.links.month, activeMonth))
      .then(data => {
        setBudgetMonth(data)
        if (error) {
          setError('')
        }
      })
      .catch(err => {
        setError(err)
      })
  }, [budget, activeMonth]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadBudgetMonth().then(() => setIsLoading(false))
  }, [loadBudgetMonth, budget, activeMonth])

  const reloadBudgetMonth = () => {
    setIsLoading(true)
    loadBudgetMonth().then(() => setIsLoading(false))
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>{safeName(budget, 'budget')}</h1>
      </div>

      <div className="month-slider">
        <Link
          to={linkToMonth(monthYearFromDate(previousMonth(activeMonth)))}
          title={translatedMonthFormat.format(previousMonth(activeMonth))}
          onClick={() => setIsLoading(true)}
        >
          <ChevronLeftIcon className="inline h-6" />
          {shortTranslatedMonthFormat.format(previousMonth(activeMonth))}
        </Link>
        <div className="border-red-800 dark:border-red-600">
          {useNativeMonthPicker ? (
            <div className="text-center">
              <label htmlFor="month" className="sr-only">
                {t('dashboard.selectMonth')}
              </label>
              <input
                type="month"
                id="month"
                value={activeMonth}
                className="cursor-pointer border-none bg-transparent text-center"
                onChange={e => {
                  e.preventDefault()
                  navigate(linkToMonth(e.target.value))
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">
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
          <div className="card my-4 w-full p-0 text-center text-gray-500 md:mb-8">
            <div className="py-4 md:py-8">
              <div className="font-medium uppercase text-gray-500 dark:text-gray-400">
                {t('dashboard.available')}
              </div>
              <div
                className={`${
                  Number(budgetMonth.available) >= 0 ? 'positive' : 'negative'
                } text-3xl font-bold`}
              >
                {formatMoney(budgetMonth.available, budget.currency, {
                  signDisplay: 'auto',
                })}
              </div>
            </div>
            <div className="rounded-b-md bg-gray-100 py-2 text-sm font-medium dark:bg-slate-700 dark:text-gray-300">
              <QuickAllocationForm
                link={replaceMonthInLinks(budget.links.month, activeMonth)}
                reloadBudgetMonth={reloadBudgetMonth}
              />
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-4 flex flex-col py-2">
              <div className="card -mx-4 -my-2 overflow-x-auto px-0 py-2 sm:-mx-6 lg:-mx-8">
                <div className="inline-block w-full align-middle">
                  <table className="w-full table-fixed">
                    <thead className="bg-white uppercase dark:bg-slate-800">
                      <tr>
                        <th
                          scope="col"
                          className="w-2/3 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pl-6 md:w-1/2"
                        ></th>
                        <th
                          scope="col"
                          className="hidden w-1/6 px-3 pt-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-300 md:table-cell"
                        >
                          {t('dashboard.allocation')}
                        </th>
                        <th
                          scope="col"
                          className="hidden w-1/6 px-3 pt-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-300 md:table-cell"
                        >
                          {t('dashboard.spent')}
                        </th>
                        <th
                          scope="col"
                          className="w-1/3 pl-3 pr-4 pt-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pr-6 md:w-1/6"
                        >
                          {t('dashboard.balance')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800">
                      <tr>
                        <td></td>
                        <td
                          className={`hidden whitespace-nowrap px-3 pb-3 text-right text-sm font-semibold md:table-cell ${
                            Number(budgetMonth.allocation) < 0
                              ? 'negative'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {formatMoney(
                            budgetMonth.allocation,
                            budget.currency,
                            {
                              signDisplay: 'auto',
                            }
                          )}
                        </td>
                        <td
                          className={`hidden whitespace-nowrap px-3 pb-3 text-right text-sm font-semibold md:table-cell ${
                            Number(budgetMonth.spent) > 0
                              ? 'positive'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {formatMoney(budgetMonth.spent, budget.currency)}
                        </td>
                        <td
                          className={`whitespace-nowrap pb-3 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 ${
                            Number(budgetMonth.balance) < 0
                              ? 'negative'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {formatMoney(budgetMonth.balance, budget.currency, {
                            signDisplay: 'auto',
                          })}
                        </td>
                      </tr>
                      {budgetMonth.categories
                        .filter(
                          category =>
                            !category.archived ||
                            category.envelopes.some(
                              envelope => !envelope.archived
                            )
                        )
                        .map(category => (
                          <CategoryMonth
                            key={category.id}
                            month={new Date(budgetMonth.month)}
                            category={category}
                            budget={budget}
                            editingEnvelope={editingEnvelope}
                            editEnvelope={setEditingEnvelope}
                            reloadBudgetMonth={() => {
                              reloadBudgetMonth()
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
