import { budgetName } from '../lib/budget-helper'
import { Budget } from '../types'

type DashboardProps = { budget: Budget }

const Home = ({ budget }: DashboardProps) => {
  return (
    <>
      <div className="header">
        <h1>{budgetName(budget)}</h1>
        <div className="header--action">TODO</div>
      </div>
      <p>There should be some content here</p>
    </>
  )
}

export default Home
