import { useState } from 'react'
import { safeName } from '../lib/name-helper'
import { Budget } from '../types'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid'

type DashboardProps = { budget: Budget }

const locale = 'en' // TODO: dynamic
const activeDateFormat = new Intl.DateTimeFormat(locale, {
  month: 'long',
  year: 'numeric',
})
const shortMonthFormat = new Intl.DateTimeFormat(locale, { month: 'short' })

const Dashboard = ({ budget }: DashboardProps) => {
  const [activeDate, setActiveDate] = useState(new Date())

  const previousMonth = () => {
    const activeYear = activeDate.getFullYear()
    const activeMonth = activeDate.getMonth()

    if (activeMonth === 0) {
      return new Date(activeYear - 1, 11, 1)
    } else {
      return new Date(activeYear, activeMonth - 1, 1)
    }
  }

  const nextMonth = () => {
    const activeYear = activeDate.getFullYear()
    const activeMonth = activeDate.getMonth()

    if (activeMonth === 11) {
      return new Date(activeYear + 1, 0, 1)
    } else {
      return new Date(activeYear, activeMonth + 1, 1)
    }
  }

  return (
    <div className="dashboard">
      <h1 className="header">{safeName(budget, 'budget')}</h1>
      <div className="month-slider">
        <button
          onClick={() => {
            setActiveDate(previousMonth())
          }}
          title={activeDateFormat.format(previousMonth())}
        >
          <ChevronLeftIcon className="inline h-6" />
          {shortMonthFormat.format(previousMonth())}
        </button>
        <div className="border-red-800 text-center">
          {activeDateFormat.format(activeDate)}
        </div>
        <button
          onClick={() => {
            setActiveDate(nextMonth())
          }}
          title={activeDateFormat.format(nextMonth())}
        >
          {shortMonthFormat.format(nextMonth())}
          <ChevronRightIcon className="inline h-6" />
        </button>
      </div>
    </div>
  )
}

export default Dashboard
