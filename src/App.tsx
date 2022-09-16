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
import TransactionsList from './components/TransactionsList'
import TransactionForm from './components/TransactionForm'
import EnvelopesList from './components/EnvelopesList'
import EnvelopeForm from './components/EnvelopeForm'
import CategoryForm from './components/CategoryForm'
import cookie from './lib/cookie'
import connectBudgetApi from './lib/api/budgets'
import './i18n'
import { Account, Budget } from './types'
import LoadingSpinner from './components/LoadingSpinner'
import { api } from './lib/api/base'

const accountApi = api('accounts')

const App = () => {
  const [budget, setBudget] = useState<Budget>()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const budgetId = cookie.get('budgetId')

  useEffect(() => {
    if (typeof budgetId !== 'undefined') {
      connectBudgetApi().then(api => {
        api
          .getBudget(budgetId)
          .then(data => {
            setBudget(data)
            loadAccounts(data)
            setError('')
          })
          .catch(err => {
            selectBudget()
            setError(err.message)
            setIsLoading(false)
          })
      })
    } else {
      setIsLoading(false)
    }
  }, [budgetId])

  const loadAccounts = (budget: Budget) => {
    accountApi
      .getAll(budget)
      .then(setAccounts)
      .then(() => {
        setIsLoading(false)
      })
  }

  const selectBudget = (selectedBudget?: Budget) => {
    if (typeof selectedBudget === 'undefined') {
      cookie.erase('budgetId')
    } else {
      cookie.set('budgetId', selectedBudget.id)
    }
    setBudget(selectedBudget)
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout budget={budget} error={error} />}>
          <Route
            path="budgets"
            element={<BudgetSwitch selectBudget={selectBudget} />}
          />
          <Route
            path="budgets/:budgetId"
            element={<BudgetForm selectBudget={selectBudget} />}
          />
          {isLoading ? (
            <Route path="/" element={<LoadingSpinner />} />
          ) : typeof budgetId === 'undefined' ||
            typeof budget === 'undefined' ? (
            <Route
              path="/"
              element={<BudgetSwitch selectBudget={selectBudget} />}
            />
          ) : (
            <>
              <Route index element={<Dashboard budget={budget} />} />
              <Route
                path="own-accounts"
                element={<OwnAccountsList budget={budget} />}
              />
              <Route
                path="own-accounts/:accountId"
                element={
                  <AccountForm
                    budget={budget}
                    type="internal"
                    accounts={accounts}
                    reloadAccounts={() => loadAccounts(budget)}
                  />
                }
              />
              <Route
                path="external-accounts"
                element={<ExternalAccountsList budget={budget} />}
              />
              <Route
                path="external-accounts/:accountId"
                element={
                  <AccountForm
                    budget={budget}
                    type="external"
                    accounts={accounts}
                    reloadAccounts={() => loadAccounts(budget)}
                  />
                }
              />
              <Route
                path="transactions"
                element={
                  <TransactionsList budget={budget} accounts={accounts} />
                }
              />
              <Route
                path="transactions/:transactionId"
                element={
                  <TransactionForm
                    budget={budget}
                    accounts={accounts}
                    reloadAccounts={() => loadAccounts(budget)}
                  />
                }
              />
              <Route
                path="envelopes"
                element={<EnvelopesList budget={budget} />}
              />
              <Route
                path="envelopes/:envelopeId"
                element={<EnvelopeForm budget={budget} accounts={accounts} />}
              />
              <Route
                path="categories/:categoryId"
                element={<CategoryForm budget={budget} />}
              />

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
