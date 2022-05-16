import { safeName } from '../lib/name-helper'
import { Budget } from '../types'

type DashboardProps = { budget: Budget }

const Home = ({ budget }: DashboardProps) => {
  return (
    <>
      <h1 className="header">{safeName(budget, 'budget')}</h1>
      <p>There should be some content here</p>
    </>
  )
}

export default Home
