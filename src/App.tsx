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
import ExternalAccountsList from './components/ExternalAccountsList'
import AccountForm from './components/AccountForm'
import cookie from './lib/cookie'
import connectBudgetApi from './lib/api/budgets'
import './i18n'
import { Budget } from './types'
import LoadingSpinner from './components/LoadingSpinner'
import Error from './components/Error'

const App = () => {
  const [budget, setBudget] = useState<Budget>()
  const [error, setError] = useState('')
  const budgetId = cookie.get('budgetId')

  useEffect(() => {
    if (typeof budgetId !== 'undefined') {
      connectBudgetApi().then(api => {
        api
          .getBudget(budgetId)
          .then(data => {
            setBudget(data)
            setError('')
          })
          .catch(err => {
            setError(err.message)
          })
      })
    }
  }, [budgetId])

  const selectBudget = (selectedBudget?: Budget) => {
    if (typeof selectedBudget === 'undefined') {
      cookie.erase('budgetId')
    } else {
      cookie.set('budgetId', selectedBudget.id.toString())
    }
    setBudget(selectedBudget)
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout budget={budget} />}>
          {error ? (
            <Route path="*" element={<Error error={error} />} />
          ) : (
            <>
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
                  <Route
                    path="own-accounts/:accountId"
                    element={<AccountForm budget={budget} type="internal" />}
                  />
                  <Route
                    path="external-accounts"
                    element={<ExternalAccountsList budget={budget} />}
                  />
                  <Route
                    path="external-accounts/:accountId"
                    element={<AccountForm budget={budget} type="external" />}
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
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
