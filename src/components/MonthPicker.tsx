import { Fragment, SetStateAction, Dispatch, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { translatedMonthFormat } from '../lib/dates'
import { ArrowLongRightIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { Link } from 'react-router-dom'
import { Translation } from '../types'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  activeMonth: string
}

const MonthPicker = ({ open, setOpen, activeMonth }: Props) => {
  const { t }: Translation = useTranslation()
  const [selectedDate, setSelectedDate] = useState(`${activeMonth}-01`)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10 flex justify-center"
        onClose={setOpen}
      >
        <div className="fixed inset-y-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-28 text-center sm:pb-0 sm:pl-0 sm:pr-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 pt-6 pb-4 text-left shadow-xl border transition-all sm:max-w-sm sm:p-6">
                <div>
                  <button
                    type="button"
                    title={t('close')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={e => {
                      e.preventDefault()
                      setOpen(false)
                    }}
                  >
                    <XMarkIcon className="icon-sm" />
                  </button>
                  <div className="text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300"
                    >
                      <label htmlFor="month" className="sr-only">
                        {t('dashboard.selectMonth')}
                      </label>
                    </Dialog.Title>
                    <div className="mt-2">
                      <input
                        type="date"
                        id="month"
                        name="month"
                        value={selectedDate}
                        onChange={e => {
                          e.preventDefault()
                          if (e.target.value) {
                            setSelectedDate(e.target.value)
                          }
                        }}
                      ></input>
                      <Link
                        to={`/?month=${selectedDate}`}
                        onClick={() => setOpen(false)}
                        className="pl-2"
                        title={translatedMonthFormat.format(
                          new Date(selectedDate)
                        )}
                      >
                        <ArrowLongRightIcon className="icon-red inline" />
                      </Link>
                      <Link
                        to="/"
                        className="block link-blue text-end text-sm pt-2"
                        onClick={() => setOpen(false)}
                      >
                        {t('dashboard.goToCurrentMonth')}
                      </Link>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default MonthPicker
