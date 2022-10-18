import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { Link } from 'react-router-dom'
import { PencilIcon } from '@heroicons/react/24/solid'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { api } from '../lib/api/base'
import { formatMoney } from '../lib/format'
import {
  Budget,
  EnvelopeMonth as EnvelopeMonthType,
  UUID,
  Translation,
} from '../types'
import FormField from './FormField'
import { monthYearFromDate, translatedMonthFormat } from '../lib/dates'

type props = {
  envelope: EnvelopeMonthType
  i: number
  budget: Budget
  editingEnvelope?: UUID
  editEnvelope: (id?: UUID) => void
  reloadBudgetMonth: () => void
  setError: (message: string) => void
}

const allocationApi = api('allocation')

const EnvelopeMonth = ({
  envelope,
  i,
  budget,
  editingEnvelope,
  editEnvelope,
  reloadBudgetMonth,
  setError,
}: props) => {
  const { t }: Translation = useTranslation()
  const [allocatedAmount, setAllocatedAmount] = useState(envelope.allocation)

  const closeInput = () => {
    editEnvelope(undefined)
  }

  const updateAllocation = async () => {
    if (Number(allocatedAmount) === 0) {
      return allocationApi.delete(undefined, { url: envelope.links.allocation })
    } else {
      return allocationApi.update(
        { amount: allocatedAmount },
        envelope.links.allocation
      )
    }
  }

  const createAllocation = async () => {
    return allocationApi.create(
      {
        amount: allocatedAmount,
        envelopeId: envelope.id,
        month: envelope.month,
      },
      budget,
      envelope.links.allocation
    )
  }

  const month = translatedMonthFormat.format(new Date(envelope.month))

  return (
    <tr
      className={`hover:bg-gray-50 border-t border-gray-${
        i === 0 ? '300' : '200'
      }`}
    >
      <Link
        to={`/transactions?envelope=${envelope.id}`}
        className="h-full block"
      >
        <td className="whitespace-nowrap py-4 pl-4 pr-1 text-sm font-medium text-gray-900 sm:pl-6 overflow-hidden text-ellipsis ">
          {envelope.name}
        </td>
      </Link>

      <td
        className={`whitespace-nowrap px-1 py-4 text-sm text-right ${
          allocatedAmount < 0 ? 'negative' : 'text-gray-500'
        }`}
      >
        {editingEnvelope === envelope.id ? (
          <div>
            <form
              onSubmit={e => {
                e.preventDefault()
                const response =
                  Number(envelope.allocation) === 0
                    ? createAllocation()
                    : updateAllocation()

                response
                  .then(closeInput)
                  .then(reloadBudgetMonth)
                  .catch(setError)
              }}
              onReset={e => {
                e.preventDefault()
                setAllocatedAmount(envelope.allocation)
                closeInput()
              }}
            >
              <FormField
                type="number"
                value={Number(allocatedAmount) === 0 ? '' : allocatedAmount}
                label={t('dashboard.allocationForEnvelopeMonth', {
                  envelope: envelope.name,
                  month: month,
                })}
                name={`${envelope.id}-${envelope.month}`}
                onChange={e => setAllocatedAmount(Number(e.target.value))}
                options={{ autoFocus: true, step: 'any' }}
                hideLabel
                compact
              />
              <div className="flex pt-1 sm:pt-2">
                <button
                  type="submit"
                  aria-label={t('save')}
                  className="w-6/12 flex justify-center"
                >
                  <CheckIcon className="icon-sm text-gray-500" />
                </button>

                <button
                  type="reset"
                  aria-label={t('cancel')}
                  className="w-6/12 flex justify-center"
                >
                  <XMarkIcon className="icon-sm text-gray-500" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div onClick={() => editEnvelope(envelope.id)}>
            <span className="pr-1">
              {formatMoney(envelope.allocation, budget.currency, 'auto')}
            </span>
            <button
              aria-label={t('editObject', {
                object: t('dashboard.allocationForEnvelopeMonth', {
                  envelope: envelope.name,
                  month: month,
                }),
              })}
            >
              <PencilIcon className="inline icon-xs text-gray-400" />
            </button>
          </div>
        )}
      </td>
      <td
        className={`whitespace-nowrap pl-1 pr-4 sm:pr-6 py-4 text-sm text-right ${
          envelope.balance < 0 ? 'negative' : 'text-gray-500'
        }`}
      >
        {formatMoney(envelope.balance, budget.currency)}
      </td>
    </tr>
  )
}

export default EnvelopeMonth
