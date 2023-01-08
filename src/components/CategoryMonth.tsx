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

type props = {
  category: CategoryMonthType
  budget: Budget
  editingEnvelope?: UUID
  editEnvelope: (id?: UUID) => void
  reloadBudgetMonth: () => void
  setError: (message: string) => void
}

const CategoryMonth = ({
  budget,
  category,
  editingEnvelope,
  editEnvelope,
  reloadBudgetMonth,
  setError,
}: props) => {
  const { t }: Translation = useTranslation()
  const [showEnvelopes, setShowEnvelopes] = useState(true)

  const { spent, allocation, balance } = category

  return (
    <>
      <tr
        className="border-t border-gray-200 bg-gray-50 cursor-pointer"
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
          className="px-4 py-2 text-left text-sm font-bold text-gray-900 sm:px-6 text-ellipsis"
        >
          <span className="flex items-center">
            <button>
              {showEnvelopes ? (
                <ChevronUpIcon className="icon" />
              ) : (
                <ChevronDownIcon className="icon" />
              )}
            </button>
            {category.name}
          </span>
        </th>
      </tr>
      {showEnvelopes ? (
        category.envelopes.map((envelope, i) => (
          <EnvelopeMonth
            key={envelope.id}
            envelope={envelope}
            i={i}
            budget={budget}
            editingEnvelope={editingEnvelope}
            editEnvelope={editEnvelope}
            reloadBudgetMonth={reloadBudgetMonth}
            setError={setError}
          ></EnvelopeMonth>
        ))
      ) : (
        <tr className="bg-gray-50 cursor-pointer">
          <td className="whitespace-nowrap pb-2 pl-10 pr-1 text-sm font-medium text-gray-500 sm:pl-12 overflow-hidden text-ellipsis italic">
            {t('envelopes.envelopesWithCount', {
              count: category.envelopes.length,
            })}
          </td>
          <td
            className={`whitespace-nowrap px-1 pb-2 text-sm text-right ${
              Number(allocation) < 0 ? 'negative' : 'text-gray-500'
            }`}
          >
            {formatMoney(allocation, budget.currency, {
              signDisplay: 'auto',
            })}
          </td>
          <td
            className={`hidden md:table-cell whitespace-nowrap px-1 pb-2 text-sm text-right ${
              Number(spent) > 0 ? 'positive' : 'text-gray-500'
            }`}
          >
            {formatMoney(spent, budget.currency)}
          </td>
          <td
            className={`whitespace-nowrap pl-1 pr-4 sm:pr-6 pb-2 text-sm text-right ${
              Number(balance) < 0 ? 'negative' : 'text-gray-500'
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
