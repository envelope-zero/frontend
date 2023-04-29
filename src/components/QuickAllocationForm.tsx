import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QuickAllocationMode, Translation } from '../types'
import { checkStatus } from '../lib/fetch-helper'
import Error from './Error'
import Modal from './Modal'

const quickAllocationModes = [
  'ALLOCATE_LAST_MONTH_BUDGET',
  'ALLOCATE_LAST_MONTH_SPEND',
]

type Props = { link: string; reloadBudgetMonth: () => void }

const QuickAllocationForm = ({ link, reloadBudgetMonth }: Props) => {
  const { t }: Translation = useTranslation()

  const [mode, setMode] = useState<QuickAllocationMode | ''>('')
  const [error, setError] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  const submitMode = async (selectedMode: QuickAllocationMode) => {
    return fetch(link, {
      method: 'POST',
      body: JSON.stringify({ mode: selectedMode }),
    })
      .then(checkStatus)
      .then(() => {
        setMode('')
        reloadBudgetMonth()
        if (error) {
          setError('')
        }
      })
  }

  return (
    <>
      {/* mobile: popup */}

      <div className="sm:hidden">
        <button
          className="link-blue text-base w-full"
          onClick={() => setShowPopup(true)}
        >
          {t('dashboard.quickAllocation')}
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
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-medium leading-6">
              {t('dashboard.quickAllocation')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.quickAllocationExplanation')}
            </p>
            <div>{t('dashboard.quickAllocationMode.allocateBasedOn')}</div>
            <div className="rounded-md border border-gray-200 dark:border-gray-500 divide-y divide-gray-200 dark:divide-gray-500">
              {quickAllocationModes.map(quickAllocationMode => (
                <button
                  key={quickAllocationMode}
                  className="btn-secondary link-blue rounded-none first:rounded-t-md w-full"
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
              <button
                className="rounded-b-md rounded-t-none btn-secondary"
                onClick={() => {
                  setShowPopup(false)
                  if (error) {
                    setError('')
                  }
                }}
              >
                {t(`cancel`)}
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* wider screens: dropdown */}

      <form
        onSubmit={e => {
          e.preventDefault()
          if (!quickAllocationModes.includes(mode)) {
            return
          }

          submitMode(mode as QuickAllocationMode).catch(error => {
            setError(error.message)
          })
        }}
        onReset={() => {
          setMode('')
        }}
        className="hidden sm:block"
      >
        <label htmlFor="mode" className="link-blue text-base">
          {t('dashboard.quickAllocation')}
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('dashboard.quickAllocationExplanation')}
        </p>
        <select
          id="mode"
          name="mode"
          className="input my-2 sm:w-auto mx-auto bg-gray-100 dark:bg-slate-700"
          value={mode}
          onChange={e => setMode(e.target.value as QuickAllocationMode)}
        >
          <option value="">
            {t('dashboard.quickAllocationMode.allocateBasedOn')}
          </option>
          {quickAllocationModes.map(quickAllocationMode => (
            <option key={quickAllocationMode} value={quickAllocationMode}>
              {t(`dashboard.quickAllocationMode.${quickAllocationMode}`)}
            </option>
          ))}
        </select>

        <Error error={error} />

        {mode === '' ? null : (
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-sky-500 dark:bg-sky-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-sky-600 dark:hover:bg-sky-500 sm:col-start-2 sm:text-sm"
            >
              {t('submit')}
            </button>
            <button
              type="reset"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-600 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-500 sm:col-start-1 sm:mt-0 sm:text-sm"
            >
              {t('cancel')}
            </button>
          </div>
        )}
      </form>
    </>
  )
}

export default QuickAllocationForm
