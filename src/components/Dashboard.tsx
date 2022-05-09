import { safeName } from '../lib/name-helper'
import { Budget } from '../types'

type DashboardProps = { budget: Budget }

const Home = ({ budget }: DashboardProps) => {
  return (
    <>
      <div className="header">
        <h1>{safeName(budget, 'budget')}</h1>
        <div className="header--action">TODO</div>
      </div>
      <p>There should be some content here</p>
    </>
  )
}

export default Home
