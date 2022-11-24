import { useState } from 'react'
import { CategoryMonth as CategoryMonthType, Budget, UUID } from '../types'
import EnvelopeMonth from './EnvelopeMonth'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

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
  const [showEnvelopes, setShowEnvelopes] = useState(true)

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
          colSpan={3}
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
      {showEnvelopes
        ? category.envelopes.map((envelope, i) => (
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
        : null}
    </>
  )
}

export default CategoryMonth
