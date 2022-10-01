import { CategoryMonth as CategoryMonthType, Budget, UUID } from '../types'
import EnvelopeMonth from './EnvelopeMonth'

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
  return (
    <>
      <tr className="border-t border-gray-200">
        <th
          colSpan={3}
          scope="colgroup"
          className="bg-gray-50 px-4 py-2 text-left text-sm font-bold text-gray-900 sm:px-6 text-ellipsis"
        >
          {category.name}
        </th>
      </tr>
      {category.envelopes.map((envelope, i) => (
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
      ))}
    </>
  )
}

export default CategoryMonth
