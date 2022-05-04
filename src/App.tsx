import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import BudgetSwitch from './components/BudgetSwitch'
import Layout from './components/Layout'
import BudgetForm from './components/BudgetForm'
import cookie from './lib/cookie'
import './i18n'

const App = () => {
  const [budgetId, setBudgetId] = useState(cookie.get('budgetId'))

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              typeof budgetId === 'undefined' ? (
                <BudgetSwitch setBudgetId={setBudgetId} />
              ) : (
                <Dashboard budgetId={parseInt(budgetId)} />
              )
            }
          />
          <Route
            path="budgets"
            element={<BudgetSwitch setBudgetId={setBudgetId} />}
          />
          <Route
            path="budgets/new"
            element={<BudgetForm setBudgetId={setBudgetId} />}
          />
          <Route
            path="budgets/:budgetId"
            element={<BudgetForm setBudgetId={setBudgetId} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
