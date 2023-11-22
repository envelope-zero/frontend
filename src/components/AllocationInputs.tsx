import { useTranslation } from 'react-i18next'
import FormField from './FormField'
import FormFields from './FormFields'
import { Budget, Translation } from '../types'
import InputCurrency from './InputCurrency'
import bigDecimal from 'js-big-decimal'
import { useState } from 'react'

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
  const [relativeAllocation, setRelativeAllocation] = useState(
    bigDecimal.subtract(newAllocation, savedAllocation)
  )

  return (
    <FormFields>
      <FormField
        type="number"
        name="absoluteAllocation"
        label={t('envelopeMonth.absoluteAllocation')}
        value={newAllocation || ''}
        onChange={e => {
          updateNewAllocation(e.target.value)
          setRelativeAllocation(
            bigDecimal.subtract(e.target.value, savedAllocation)
          )
        }}
        onFocus={e => {
          e.target.select()
        }}
        compact
      >
        <InputCurrency currency={budget.currency} />
      </FormField>
      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
        {' '}
        – {t('or')} –{' '}
      </p>
      <FormField
        type="number"
        name="relativeAllocation"
        label={t('envelopeMonth.relativeAllocation')}
        value={Number(relativeAllocation) ? relativeAllocation : ''}
        onChange={e => {
          updateNewAllocation(
            `${bigDecimal.add(savedAllocation, e.target.value)}`
          )
          setRelativeAllocation(e.target.value)
        }}
        compact
      >
        <InputCurrency currency={budget.currency} />
      </FormField>
    </FormFields>
  )
}

export default AllocationInputs
