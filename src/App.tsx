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
import OwnAccountsList from './components/OwnAccountsList'
import cookie from './lib/cookie'
import './i18n'
import { Budget, ApiResponse } from './types'
import { getBudget } from './lib/api/budgets'
import LoadingSpinner from './components/LoadingSpinner'

const App = () => {
  const [budget, setBudget] = useState<ApiResponse<Budget>>()
  const budgetId = cookie.get('budgetId')

  useEffect(() => {
    if (typeof budgetId !== 'undefined') {
      getBudget(budgetId).then(setBudget)
    }
  }, [budgetId])

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
          {typeof budgetId === 'undefined' ? (
            <Route
              path="/"
              element={<BudgetSwitch selectBudget={selectBudget} />}
            />
          ) : typeof budget === 'undefined' ? (
            <Route path="*" element={<LoadingSpinner />} />
          ) : (
            <>
              <Route index element={<Dashboard budget={budget} />} />
              <Route
                path="own-accounts"
                element={<OwnAccountsList budget={budget} />}
              />
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
