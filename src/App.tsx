import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.scss'
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
import { Account, Budget, Theme } from './types'
import LoadingSpinner from './components/LoadingSpinner'
import { api } from './lib/api/base'
import BudgetImport from './components/BudgetImport'
import Settings from './components/Settings'

const accountApi = api('accounts')

const preferredTheme = () => localStorage.theme || 'default'

const App = () => {
  const [budget, setBudget] = useState<Budget>()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState(preferredTheme())
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

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'default' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const loadAccounts = (budget: Budget) => {
    accountApi
      .getAll(budget)
      .then(setAccounts)
      .then(() => {
        setIsLoading(false)
      })
  }

  const updateTheme = (setting: Theme) => {
    setTheme(setting)

    if (['dark', 'light'].includes(setting)) {
      localStorage.theme = setting
    } else {
      localStorage.removeItem('theme')
    }
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
          <Route
            path="budget-import"
            element={<BudgetImport selectBudget={selectBudget} />}
          />
          {isLoading ? (
            <Route path="*" element={<LoadingSpinner />} />
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
                  <Settings
                    budget={budget}
                    setBudget={setBudget}
                    theme={theme}
                    setTheme={updateTheme}
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
