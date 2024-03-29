import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { get } from '../lib/api/base'
import { monthYearFromDate } from '../lib/dates'
import { formatMoney } from '../lib/format'
import { replaceMonthInLinks } from '../lib/month-helper'
import { safeName } from '../lib/name-helper'
import { Budget, BudgetMonth, Translation, UUID } from '../types'
import CategoryMonth from './CategoryMonth'
import Error from './Error'
import LoadingSpinner from './LoadingSpinner'
import MonthSlider from './MonthSlider'
import QuickAllocationForm from './QuickAllocationForm'

type DashboardProps = { budget: Budget }

const Dashboard = ({ budget }: DashboardProps) => {
  const { t }: Translation = useTranslation()

  const [searchParams] = useSearchParams()
  const activeMonth =
    searchParams.get('month')?.substring(0, 7) || monthYearFromDate(new Date())

  const [budgetMonth, setBudgetMonth] = useState<BudgetMonth>()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingEnvelope, setEditingEnvelope] = useState<UUID>()

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

      <MonthSlider
        budget={budget}
        activeMonth={activeMonth}
        setIsLoading={setIsLoading}
      />

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
