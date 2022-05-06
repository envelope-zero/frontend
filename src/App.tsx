import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import BudgetSwitch from './components/BudgetSwitch'
import BudgetForm from './components/BudgetForm'
import cookie from './lib/cookie'
import './i18n'
import { Budget, ApiResponse } from './types'
import { getBudget } from './lib/api/budgets'

const App = () => {
  const [budget, setBudget] = useState<ApiResponse<Budget>>()

  useEffect(() => {
    loadBudget()
  }, [])

  const loadBudget = () => {
    const budgetId = cookie.get('budgetId')

    if (typeof budgetId !== 'undefined') {
      getBudget(budgetId).then(setBudget)
    }
  }

  const selectBudget = (selectedBudget?: ApiResponse<Budget>) => {
    if (typeof selectedBudget === 'undefined') {
      cookie.erase('budgetId')
    } else {
      cookie.set('budgetId', selectedBudget.data.id.toString())
    }
    setBudget(selectedBudget)
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout budget={budget?.data} />}>
          <Route
            path="budgets"
            element={<BudgetSwitch selectBudget={selectBudget} />}
          />
          <Route
            path="budgets/:budgetId"
            element={<BudgetForm selectBudget={selectBudget} />}
          />
          {typeof budget === 'undefined' ? (
            <Route
              path="/"
              element={<BudgetSwitch selectBudget={selectBudget} />}
            />
          ) : (
            <>
              <Route index element={<Dashboard budget={budget} />} />
              {/* TODO: more routes here */}
              <Route
                path="/settings"
                element={
                  <BudgetForm
                    selectBudget={selectBudget}
                    selectedBudget={budget}
                  />
                }
              />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
