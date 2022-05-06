import { safeName } from '../lib/name-helper'
import { Budget, ApiResponse } from '../types'

type DashboardProps = { budget: ApiResponse<Budget> }

const Home = ({ budget }: DashboardProps) => {
  return (
    <>
      <div className="header">
        <h1>{safeName(budget.data, 'budget')}</h1>
        <div className="header--action">TODO</div>
      </div>
      <p>There should be some content here</p>
    </>
  )
}

export default Home
