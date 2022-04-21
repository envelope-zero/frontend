import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Translation, Budget } from '../types'
import cookie from '../lib/cookie'
import getBudgets from '../lib/getBudgets'

type BudgetSwitchProps = {
  setBudgetId: (id: string) => void
}

const BudgetSwitch = (props: BudgetSwitchProps) => {
  const { t }: Translation = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = () => {
    getBudgets().then(data => {
      setBudgets(data)
      setIsLoading(false)
    })
  }

  const setBudgetId = (id: string) => {
    cookie.set('budgetId', id)
    props.setBudgetId(id)
  }

  return (
    <>
      {isLoading ? (
        <div>loading...</div>
      ) : (
        budgets.map(budget => (
          <div key={budget.id}>
            <Link
              to="/"
              onClick={() => {
                setBudgetId(budget.id.toString())
              }}
            >
              {budget.name || `Budget ${budget.id}`}
            </Link>
          </div>
        ))
      )}
    </>
  )
}

export default BudgetSwitch
