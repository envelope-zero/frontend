import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  CategoryMonth as CategoryMonthType,
  Budget,
  UUID,
  Translation,
} from '../types'
import EnvelopeMonth from './EnvelopeMonth'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { formatMoney } from '../lib/format'
import { safeName } from '../lib/name-helper'

type props = {
  category: CategoryMonthType
  month: Date
  budget: Budget
  editingEnvelope?: UUID
  editEnvelope: (id?: UUID) => void
  reloadBudgetMonth: () => void
}

const CategoryMonth = ({
  month,
  budget,
  category,
  editingEnvelope,
  editEnvelope,
  reloadBudgetMonth,
}: props) => {
  const { t }: Translation = useTranslation()
  const [showEnvelopes, setShowEnvelopes] = useState(true)

  const { spent, allocation, balance } = category

  const envelopes = category.envelopes.filter(envelope => !envelope.archived)

  return (
    <>
      <tr
        className={`${
          showEnvelopes ? 'border-y' : 'border-t'
        } cursor-pointer border-gray-200 bg-gray-50 dark:border-gray-900 dark:bg-slate-700`}
        onClick={() => {
          if (
            category.envelopes.some(envelope => envelope.id === editingEnvelope)
          ) {
            editEnvelope(undefined)
          }

          setShowEnvelopes(!showEnvelopes)
        }}
      >
        <th
          colSpan={4}
          scope="colgroup"
          className="text-ellipsis px-4 py-2 text-left text-sm font-bold text-gray-900 dark:text-gray-300 sm:px-6"
        >
          <span
            className={`flex items-center ${!category.name ? 'italic' : ''}`}
          >
            <button>
              {showEnvelopes ? (
                <ChevronUpIcon className="icon" />
              ) : (
                <ChevronDownIcon className="icon" />
              )}
            </button>
            {safeName(category, 'category', t('categories.category'))}
          </span>
        </th>
      </tr>
      {showEnvelopes ? (
        envelopes.map((envelope, i) => (
          <EnvelopeMonth
            key={envelope.id}
            envelope={envelope}
            month={month}
            i={i}
            budget={budget}
            editingEnvelope={editingEnvelope}
            editEnvelope={editEnvelope}
            reloadBudgetMonth={reloadBudgetMonth}
          ></EnvelopeMonth>
        ))
      ) : (
        <tr className="cursor-pointer bg-gray-50 dark:bg-slate-700">
          <td className="overflow-hidden text-ellipsis whitespace-nowrap pb-2 pl-10 pr-1 text-sm font-medium italic text-gray-500 dark:text-gray-400 sm:pl-12">
            {t('envelopes.envelopesWithCount', {
              count: envelopes.length,
            })}
          </td>
          <td
            className={`hidden whitespace-nowrap px-1 pb-2 text-right text-sm md:table-cell ${
              Number(allocation) < 0
                ? 'negative'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatMoney(allocation, budget.currency, {
              signDisplay: 'auto',
            })}
          </td>
          <td
            className={`hidden whitespace-nowrap px-1 pb-2 text-right text-sm md:table-cell ${
              Number(spent) > 0
                ? 'positive'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatMoney(spent, budget.currency)}
          </td>
          <td
            className={`whitespace-nowrap pb-2 pl-1 pr-4 text-right text-sm sm:pr-6 ${
              Number(balance) < 0
                ? 'negative'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatMoney(balance, budget.currency, { signDisplay: 'auto' })}
          </td>
        </tr>
      )}
    </>
  )
}

export default CategoryMonth
