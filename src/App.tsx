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
import { Account, Budget, Transaction } from './types'
import LoadingSpinner from './components/LoadingSpinner'
import Error from './components/Error'
import { api } from './lib/api/base'

const transactionApi = api('transactions')
const accountApi = api('accounts')

const App = () => {
  const [budget, setBudget] = useState<Budget>()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState('')
  const budgetId = cookie.get('budgetId')

  useEffect(() => {
    if (typeof budgetId !== 'undefined') {
      connectBudgetApi().then(api => {
        api
          .getBudget(budgetId)
          .then(data => {
            setBudget(data)
            getBudgetAccounts(data)
            getBudgetTransactions(data)
            setError('')
          })
          .catch(err => {
            selectBudget()
            setError(err.message)
          })
      })
    }
  }, [budgetId])

  const getBudgetAccounts = (budget: Budget) => {
    accountApi.getAll(budget).then(setAccounts)
  }
  const getBudgetTransactions = (budget: Budget) => {
    transactionApi.getAll(budget).then(setTransactions)
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
                    element={
                      <AccountForm
                        budget={budget}
                        type="internal"
                        accounts={accounts}
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
                      />
                    }
                  />
                  <Route
                    path="transactions"
                    element={
                      <TransactionsList
                        budget={budget}
                        accounts={accounts}
                        transactions={transactions}
                      />
                    }
                  />
                  <Route
                    path="transactions/:transactionId"
                    element={
                      <TransactionForm
                        budget={budget}
                        accounts={accounts}
                        transactions={transactions}
                        setTransactions={setTransactions}
                      />
                    }
                  />
                  <Route
                    path="envelopes"
                    element={<EnvelopesList budget={budget} />}
                  />
                  <Route
                    path="envelopes/:envelopeId"
                    element={
                      <EnvelopeForm budget={budget} accounts={accounts} />
                    }
                  />
                  <Route
                    path="categories/:categoryId"
                    element={<CategoryForm budget={budget} />}
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
