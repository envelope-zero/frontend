import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid'
import { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import {
  dateFromMonthYear,
  monthYearFromDate,
  shortTranslatedMonthFormat,
  translatedMonthFormat,
} from '../lib/dates'
import isSupported from '../lib/is-supported'
import { Budget, Translation } from '../types'
import MonthPicker from './MonthPicker'

type Props = {
  budget: Budget
  route?: string
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const previousMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-')

  if (month === '01') {
    return new Date(parseInt(year) - 1, 11, 15)
  } else {
    return new Date(parseInt(year), parseInt(month) - 2, 15)
  }
}

const nextMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-')

  if (month === '12') {
    return new Date(parseInt(year) + 1, 0, 15)
  } else {
    return new Date(parseInt(year), parseInt(month), 15)
  }
}

const MonthSlider = ({ budget, route = '', setIsLoading }: Props) => {
  const { t }: Translation = useTranslation()
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const activeMonth =
    searchParams.get('month')?.substring(0, 7) || monthYearFromDate(new Date())

  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const useNativeMonthPicker = isSupported.inputTypeMonth()

  const linkToMonth = (month: string) => `/${route}?month=${month}`

  return (
    <div>
      <div className="month-slider">
        <Link
          to={linkToMonth(monthYearFromDate(previousMonth(activeMonth)))}
          title={translatedMonthFormat.format(previousMonth(activeMonth))}
          onClick={() => setIsLoading(true)}
        >
          <ChevronLeftIcon className="inline h-6" />
          {shortTranslatedMonthFormat.format(previousMonth(activeMonth))}
        </Link>
        <div className="border-red-800 dark:border-red-600">
          {useNativeMonthPicker ? (
            <div className="text-center">
              <label htmlFor="month" className="sr-only">
                {t('dashboard.selectMonth')}
              </label>
              <input
                type="month"
                id="month"
                value={activeMonth}
                className="cursor-pointer border-none bg-transparent text-center"
                onChange={e => {
                  e.preventDefault()
                  navigate(linkToMonth(e.target.value))
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2 text-center">
                {translatedMonthFormat.format(dateFromMonthYear(activeMonth))}
              </span>
              <button
                type="button"
                title={t('dashboard.selectMonth')}
                onClick={() => {
                  setShowMonthPicker(!showMonthPicker)
                }}
              >
                <CalendarDaysIcon className="icon" />
              </button>
            </div>
          )}
        </div>
        <Link
          to={linkToMonth(monthYearFromDate(nextMonth(activeMonth)))}
          title={translatedMonthFormat.format(nextMonth(activeMonth))}
          onClick={() => setIsLoading(true)}
        >
          {shortTranslatedMonthFormat.format(nextMonth(activeMonth))}
          <ChevronRightIcon className="inline h-6" />
        </Link>
      </div>

      {useNativeMonthPicker ? null : (
        <MonthPicker
          open={showMonthPicker}
          setOpen={setShowMonthPicker}
          activeMonth={activeMonth}
          route={route}
        />
      )}
    </div>
  )
}

export default MonthSlider
