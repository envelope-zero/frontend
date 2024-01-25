import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QuickAllocationMode, Translation } from '../types'
import { checkStatus } from '../lib/fetch-helper'
import Error from './Error'
import Modal from './Modal'
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'

const quickAllocationModes = [
  'ALLOCATE_LAST_MONTH_BUDGET',
  'ALLOCATE_LAST_MONTH_SPEND',
]

type Props = { link: string; reloadBudgetMonth: () => void }

const QuickAllocationForm = ({ link, reloadBudgetMonth }: Props) => {
  const { t }: Translation = useTranslation()

  const [error, setError] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  const submitMode = async (selectedMode: QuickAllocationMode) => {
    return fetch(link, {
      method: 'POST',
      body: JSON.stringify({ mode: selectedMode }),
    })
      .then(checkStatus)
      .then(() => {
        reloadBudgetMonth()
        if (error) {
          setError('')
        }
      })
  }

  return (
    <div>
      <button
        className="text-base w-full full-centered"
        onClick={() => setShowPopup(true)}
      >
        {t('dashboard.quickAllocation')}
        <ChevronRightIcon className="icon-sm inline" />
      </button>
      <Modal
        open={showPopup}
        setOpen={open => {
          setShowPopup(open)
          if (!open && error) {
            setError('')
          }
        }}
      >
        <Error error={error} />
        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
          <button
            type="button"
            className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => {
              setShowPopup(false)
              if (error) {
                setError('')
              }
            }}
          >
            <span className="sr-only">{t('cancel')}</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium leading-6">
            {t('dashboard.quickAllocation')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.quickAllocationExplanation')}
          </p>
          <div>{t('dashboard.quickAllocationMode.allocateBasedOn')}</div>
          <div className="space-y-2">
            {quickAllocationModes.map(quickAllocationMode => (
              <button
                key={quickAllocationMode}
                className="btn-secondary w-full"
                onClick={() =>
                  submitMode(quickAllocationMode as QuickAllocationMode)
                    .then(() => setShowPopup(false))
                    .catch(error => {
                      setError(error.message)
                    })
                }
              >
                {t(`dashboard.quickAllocationMode.${quickAllocationMode}`)}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default QuickAllocationForm
