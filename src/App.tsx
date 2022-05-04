import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import BudgetSwitch from './components/BudgetSwitch'
import Layout from './components/Layout'
import BudgetForm from './components/BudgetForm'
import cookie from './lib/cookie'
import './i18n'
import { Budget } from './types'
import { getBudget } from './lib/api/budgets'

const App = () => {
  const [budget, setBudget] = useState<Budget>()

  useEffect(() => {
    loadBudget()
  }, [])

  const loadBudget = () => {
    const budgetId = cookie.get('budgetId')

    if (typeof budgetId !== 'undefined') {
      getBudget(budgetId).then(setBudget)
    }
  }

  const selectBudget = (budget?: Budget) => {
    if (typeof budget === 'undefined') {
      cookie.erase('budgetId')
    } else {
      cookie.set('budgetId', budget.id.toString())
    }
    setBudget(budget)
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              typeof budget === 'undefined' ? (
                <BudgetSwitch selectBudget={selectBudget} />
              ) : (
                <Dashboard budget={budget} />
              )
            }
          />
          <Route
            path="budgets"
            element={<BudgetSwitch selectBudget={selectBudget} />}
          />
          <Route
            path="budgets/new"
            element={<BudgetForm selectBudget={selectBudget} />}
          />
          <Route
            path="budgets/:budgetId"
            element={<BudgetForm selectBudget={selectBudget} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
