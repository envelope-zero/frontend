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
import Modal from './Modal'
import { translatedMonthFormat } from '../lib/dates'
import AllocationInputs from './AllocationInputs'
import { safeName } from '../lib/name-helper'
import { replaceMonthInLinks } from '../lib/month-helper'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

type props = {
  envelope: EnvelopeMonthType
  month: Date
  i: number
  budget: Budget
  editingEnvelope?: UUID
  editEnvelope: (id?: UUID) => void
  reloadBudgetMonth: () => void
  setError: (message: string) => void
}

const EnvelopeMonth = ({
  envelope,
  month,
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

  const localMonth = translatedMonthFormat.format(month)
  const lastDay = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).toISOString()
  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  ).toISOString()

  const apiMonth = `${month.getFullYear()}-${(month.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`

  const updateAllocation = async () => {
    return api('').update(
      { allocation: allocatedAmount },
      replaceMonthInLinks(envelope.links.month, apiMonth)
    )
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700">
      <td>
        <Link
          to={`/envelopes/${envelope.id}`}
          className={`h-full block whitespace-nowrap py-4 pl-4 pr-1 text-sm font-medium text-gray-900 dark:text-gray-300 sm:pl-6 overflow-hidden text-ellipsis ${
            !envelope.name ? 'italic' : ''
          }`}
        >
          {safeName(envelope, 'envelope')}
        </Link>
        <Modal
          open={editingEnvelope === envelope.id}
          setOpen={open => (open ? editEnvelope(envelope.id) : closeInput())}
        >
          <form
            onSubmit={e => {
              e.preventDefault()
              updateAllocation()
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
            <div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg font-medium leading-6">
                  {t('editObject', {
                    object: t('dashboard.allocationForEnvelope', {
                      envelope: envelope.name,
                    }),
                  })}
                </h3>
                <div className="mt-2">
                  <AllocationInputs
                    budget={budget}
                    savedAllocation={envelope.allocation}
                    newAllocation={allocatedAmount}
                    updateNewAllocation={setAllocatedAmount}
                  />
                </div>
              </div>
            </div>
            <div className="button-group mt-8">
              <button type="submit" className="btn-primary">
                {t('save')}
              </button>
              <button type="reset" className="btn-secondary">
                {t('cancel')}
              </button>
            </div>
          </form>
        </Modal>
      </td>

      <td
        className={`hidden md:table-cell whitespace-nowrap px-1 py-4 text-sm text-right ${
          Number(allocatedAmount) < 0
            ? 'negative'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <div onClick={() => editEnvelope(envelope.id)}>
          <span className="pr-1">
            {formatMoney(envelope.allocation, budget.currency, {
              signDisplay: 'auto',
            })}
          </span>
          <button
            aria-label={t('editObject', {
              object: t('dashboard.allocationForEnvelopeMonth', {
                envelope: envelope.name,
                month: localMonth,
              }),
            })}
          >
            <PencilIcon className="inline icon-xs text-gray-400" />
          </button>
        </div>
      </td>
      <td
        className={`hidden md:table-cell whitespace-nowrap px-1 py-4 text-sm text-right ${
          Number(envelope.spent) > 0
            ? 'positive'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Link
          to={`/transactions?envelope=${envelope.id}&fromDate=${firstDay}&untilDate=${lastDay}`}
        >
          {formatMoney(envelope.spent, budget.currency, {
            hideZero: true,
          })}
        </Link>
      </td>
      <td
        className={`whitespace-nowrap pl-1 pr-4 sm:pr-6 py-4 text-sm text-right ${
          Number(envelope.balance) < 0
            ? 'negative'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Link
          to={`/transactions?envelope=${envelope.id}&fromDate=${firstDay}&untilDate=${lastDay}`}
        >
          <span className="hidden md:inline">
            {formatMoney(envelope.balance, budget.currency, {
              hideZero: true,
              signDisplay: 'auto',
            })}
          </span>
          {/* Only hide zero on bigger displays */}
          <span className="md:hidden">
            {formatMoney(envelope.balance, budget.currency, {
              signDisplay: 'auto',
            })}
          </span>
        </Link>
        <button
          aria-label={t('editObject', {
            object: t('dashboard.allocationForEnvelopeMonth', {
              envelope: envelope.name,
              month: localMonth,
            }),
          })}
          onClick={() => editEnvelope(envelope.id)}
          className="md:hidden pl-2"
        >
          <PlusCircleIcon className="inline icon text-gray-400" />
        </button>
      </td>
    </tr>
  )
}

export default EnvelopeMonth
