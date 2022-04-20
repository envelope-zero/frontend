import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Translation, Budget } from '../types'
import cookie from '../lib/cookie'

type BudgetSwitchProps = {
  setBudgetId: (id: string) => void
}

const BudgetSwitch = (props: BudgetSwitchProps) => {
  const { t }: Translation = useTranslation()

  const setBudgetId = (id: string) => {
    cookie.set('budgetId', id)
    props.setBudgetId(id)
  }

  const budgets: Budget[] = []

  return (
    <>
      {budgets.map(budget => (
        <div key={budget.id}>
          <Link
            to="/"
            onClick={() => {
              setBudgetId(budget.id.toString())
            }}
          >
            {budget.name}
          </Link>
        </div>
      ))}
    </>
  )
}

export default BudgetSwitch
