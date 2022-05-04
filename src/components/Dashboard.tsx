import { useTranslation } from 'react-i18next'
import { Budget, Translation } from '../types'

type DashboardProps = { budget: Budget }

const Home = ({ budget }: DashboardProps) => {
  const { t }: Translation = useTranslation()

  return (
    <>
      <div className="header">
        <h1>
          {typeof budget.name === 'undefined'
            ? `${t('budgets.budget')} ${budget.id}`
            : budget.name}
        </h1>
        <div className="header--action">TODO</div>
      </div>
      <p>There should be some content here</p>
    </>
  )
}

export default Home
