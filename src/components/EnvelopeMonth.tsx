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
      <td>
        <Link
          to={`/transactions?envelope=${envelope.id}`}
          className="h-full block whitespace-nowrap py-4 pl-4 pr-1 text-sm font-medium text-gray-900 sm:pl-6 overflow-hidden text-ellipsis"
        >
          {envelope.name}
        </Link>
      </td>

      <td
        className={`whitespace-nowrap px-1 py-4 text-sm text-right ${
          Number(allocatedAmount) < 0 ? 'negative' : 'text-gray-500'
        }`}
      >
        <Modal
          open={editingEnvelope === envelope.id}
          setOpen={open => (open ? editEnvelope(envelope.id) : closeInput())}
        >
          <form
            onSubmit={e => {
              e.preventDefault()
              const response =
                Number(envelope.allocation) === 0
                  ? createAllocation()
                  : updateAllocation()

              response.then(closeInput).then(reloadBudgetMonth).catch(setError)
            }}
            onReset={e => {
              e.preventDefault()
              setAllocatedAmount(envelope.allocation)
              closeInput()
            }}
          >
            <div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
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
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
              >
                {t('save')}
              </button>
              <button
                type="reset"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
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
                month: month,
              }),
            })}
          >
            <PencilIcon className="inline icon-xs text-gray-400" />
          </button>
        </div>
      </td>
      <td
        className={`hidden md:table-cell whitespace-nowrap px-1 py-4 text-sm text-right ${
          Number(envelope.spent) > 0 ? 'positive' : 'text-gray-500'
        }`}
      >
        {formatMoney(envelope.spent, budget.currency, {
          hideZero: true,
        })}
      </td>
      <td
        className={`whitespace-nowrap pl-1 pr-4 sm:pr-6 py-4 text-sm text-right ${
          Number(envelope.balance) < 0 ? 'negative' : 'text-gray-500'
        }`}
      >
        {formatMoney(envelope.balance, budget.currency, {
          hideZero: true,
          signDisplay: 'auto',
        })}
      </td>
    </tr>
  )
}

export default EnvelopeMonth
