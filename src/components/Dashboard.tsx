import { budgetName } from '../lib/budget-helper'
import { Budget, ApiResponse } from '../types'

type DashboardProps = { budget: ApiResponse<Budget> }

const Home = ({ budget }: DashboardProps) => {
  return (
    <>
      <div className="header">
        <h1>{budgetName(budget.data)}</h1>
        <div className="header--action">TODO</div>
      </div>
      <p>There should be some content here</p>
    </>
  )
}

export default Home
