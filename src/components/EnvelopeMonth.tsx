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
import { getApiInfo } from '../lib/api/base'

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

  // TODO: Can this be done better using a MonthConfig?
  const apiMonth = `${month.getFullYear()}-${month
    .getMonth()
    .toString()
    .padStart(2, '0')}${month.getMonth() + 1}`

  const updateAllocation = async () => {
    const endpoint = await getApiInfo().then(data => data.links.envelopes)

    return api('').update(
      { allocation: allocatedAmount },
      `${endpoint}/${envelope.id}/${apiMonth}`
    )
  }

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-slate-700 border-t ${
        i === 0
          ? 'border-gray-300 dark:border-black'
          : 'border-gray-200 dark:border-gray-900'
      }`}
    >
      <td>
        <Link
          to={`/envelopes/${envelope.id}`}
          className={`h-full block whitespace-nowrap py-4 pl-4 pr-1 text-sm font-medium text-gray-900 dark:text-gray-300 sm:pl-6 overflow-hidden text-ellipsis ${
            !envelope.name && 'italic'
          }`}
        >
          {safeName(envelope, 'envelope')}
        </Link>
      </td>

      <td
        className={`whitespace-nowrap px-1 py-4 text-sm text-right ${
          Number(allocatedAmount) < 0
            ? 'negative'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
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
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-sky-500 dark:bg-sky-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-sky-600 dark:hover:bg-sky-500 sm:col-start-2 sm:text-sm"
              >
                {t('save')}
              </button>
              <button
                type="reset"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-400 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 sm:col-start-1 sm:mt-0 sm:text-sm"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </Modal>

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
          {formatMoney(envelope.balance, budget.currency, {
            hideZero: true,
            signDisplay: 'auto',
          })}
        </Link>
      </td>
    </tr>
  )
}

export default EnvelopeMonth
