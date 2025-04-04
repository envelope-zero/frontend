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
import Error from './Error'

type props = {
  envelope: EnvelopeMonthType
  month: Date
  i: number
  budget: Budget
  editingEnvelope?: UUID
  editEnvelope: (id?: UUID) => void
  reloadBudgetMonth: () => void
}

const EnvelopeMonth = ({
  envelope,
  month,
  i,
  budget,
  editingEnvelope,
  editEnvelope,
  reloadBudgetMonth,
}: props) => {
  const { t }: Translation = useTranslation()
  const [allocatedAmount, setAllocatedAmount] = useState(envelope.allocation)
  const [allocationError, setAllocationError] = useState('')

  const closeInput = () => {
    editEnvelope(undefined)
    setAllocationError('')
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
          className={`block h-full overflow-hidden py-4 pr-1 pl-4 text-sm font-medium text-ellipsis whitespace-nowrap text-gray-900 sm:pl-6 dark:text-gray-300 ${
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
                .catch(setAllocationError)
            }}
            onReset={e => {
              e.preventDefault()
              setAllocatedAmount(envelope.allocation)
              closeInput()
            }}
          >
            <Error error={allocationError} />
            <div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium">
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
        className={`hidden px-1 py-4 text-right text-sm whitespace-nowrap md:table-cell ${
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
            <PencilIcon className="icon-xs inline text-gray-400" />
          </button>
        </div>
      </td>
      <td
        className={`hidden px-1 py-4 text-right text-sm whitespace-nowrap md:table-cell ${
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
        className={`py-4 pr-4 pl-1 text-right text-sm whitespace-nowrap sm:pr-6 ${
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
          className="pl-2 md:hidden"
        >
          <PlusCircleIcon className="icon inline text-gray-400" />
        </button>
      </td>
    </tr>
  )
}

export default EnvelopeMonth
