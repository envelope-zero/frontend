import { useState, Fragment, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useTranslation } from 'react-i18next'
import { Translation } from '../types'

type Props = {
  notification: string
  setNotification: (notification: string) => void
}

const animationDuration = 100

const Notification = ({ notification, setNotification }: Props) => {
  const { t }: Translation = useTranslation()
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setShow(false)
        setTimeout(() => setNotification(''), animationDuration)
      }, 2500)
    }
  })

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-10 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave={`transition ease-in duration-${animationDuration}`}
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-green-100 shadow-lg ring-1 ring-black">
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <CheckCircleIcon
                    className="h-6 w-6 text-green-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-green-700">
                    {notification}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0">
                  <button
                    type="button"
                    title={t('close')}
                    className="inline-flex rounded-md bg-green-100 text-green-700 hover:text-green-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                    onClick={() => {
                      setShow(false)
                    }}
                  >
                    <span className="sr-only">{t('close')}</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  )
}

export default Notification
