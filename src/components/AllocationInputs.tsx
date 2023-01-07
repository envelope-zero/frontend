import { useTranslation } from 'react-i18next'
import FormField from './FormField'
import FormFields from './FormFields'
import { Budget, Translation } from '../types'
import InputCurrency from './InputCurrency'

type Props = {
  budget: Budget
  savedAllocation: string
  newAllocation: string
  updateNewAllocation: (allocation: string) => void
}

const AllocationInputs = ({
  budget,
  savedAllocation,
  newAllocation,
  updateNewAllocation,
}: Props) => {
  const { t }: Translation = useTranslation()
  const relativeAllocation = Number(newAllocation) - Number(savedAllocation)

  return (
    <FormFields>
      <FormField
        type="number"
        name="absoluteAllocation"
        label={t('envelopeMonth.absoluteAllocation')}
        value={newAllocation || ''}
        onChange={e => {
          updateNewAllocation(e.target.value)
        }}
        compact
      >
        <InputCurrency currency={budget.currency} />
      </FormField>
      <p className="text-sm text-gray-500 uppercase"> – {t('or')} – </p>
      <FormField
        type="number"
        name="relativeAllocation"
        label={t('envelopeMonth.relativeAllocation')}
        value={(relativeAllocation || '').toString()}
        onChange={e => {
          updateNewAllocation(
            `${Number(savedAllocation) + Number(e.target.value)}`
          )
        }}
        compact
      >
        <InputCurrency currency={budget.currency} />
      </FormField>
    </FormFields>
  )
}

export default AllocationInputs
