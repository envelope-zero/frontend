import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  EnvelopeIcon,
  BanknotesIcon,
  Cog8ToothIcon,
  ArrowsRightLeftIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { Budget, Translation } from '../types'
import { safeName } from '../lib/name-helper'
import Error from './Error'
import Notification from './Notification'
import ImportBanner from './ImportBanner'

type LayoutProps = {
  budget?: Budget
  error: string
  notification: string
  setNotification: (notification: string) => void
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Layout = ({
  budget,
  error,
  notification,
  setNotification,
}: LayoutProps) => {
  const { t }: Translation = useTranslation()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showImportBanner, setShowImportBanner] = useState<boolean>(false)
  const headerRef = useRef<HTMLElement>(undefined)

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY === 0) {
        headerRef.current?.classList.remove('shadow-lg')
      } else {
        headerRef.current?.classList.add('shadow-lg')
      }
    })
  }, [])

  useEffect(() => {
    if (
      localStorage.getItem('importTransactions') &&
      location.pathname !== '/transactions/import'
    ) {
      setShowImportBanner(true)
    } else {
      setShowImportBanner(false)
    }
  }, [location])

  const hideNav = typeof budget === 'undefined'

  const navigation = [
    { name: t('navigation.home'), href: '/', icon: HomeIcon },
    {
      name: t('navigation.transactions'),
      href: 'transactions',
      icon: ArrowsRightLeftIcon,
    },
    {
      name: t('navigation.accounts'),
      href: 'own-accounts',
      icon: BanknotesIcon,
    },
    { name: t('navigation.envelopes'), href: 'envelopes', icon: EnvelopeIcon },
    { name: t('navigation.settings'), href: 'settings', icon: Cog8ToothIcon },
  ]

  return (
    <div>
      {hideNav ? null : (
        <>
          <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-40 flex lg:hidden"
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            >
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-600/[.75] dark:bg-slate-900/[.8]" />
              </Transition.Child>
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-800">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="-mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-hidden"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">
                          {t('navigation.closeSidebar')}
                        </span>
                        <XMarkIcon className="icon-red" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-0 flex-1 flex-col justify-between overflow-y-auto pt-5 pb-4">
                    <div>
                      <div className="flex shrink-0 items-center px-4">
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {safeName(budget, 'budget')}
                          </div>
                          <Link
                            className="link"
                            to="budgets"
                            onClick={() => setSidebarOpen(false)}
                          >
                            {t('navigation.switchBudget')}
                          </Link>
                        </div>
                      </div>
                      <Link
                        to="/transactions/new"
                        onClick={() => setSidebarOpen(false)}
                        className="group my-4 flex items-center border-y p-4 text-base font-medium text-sky-600 shadow-inner dark:border-gray-900 dark:text-sky-400"
                      >
                        <BoltIcon className="mr-4 inline h-6 w-6 shrink-0" />
                        {t('transactions.add')}
                      </Link>
                      <nav className="space-y-1">
                        {navigation.map(item => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              classNames(
                                isActive
                                  ? 'bg-red-800/[.1] text-gray-900 dark:bg-red-600/[.15] dark:text-gray-100'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-200',
                                'group flex items-center px-4 py-4 text-base font-medium'
                              )
                            }
                          >
                            {({ isActive }) => (
                              <div className="flex w-full justify-between">
                                <div className="flex">
                                  <item.icon
                                    className={classNames(
                                      isActive
                                        ? 'text-red-800 dark:text-red-600'
                                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-200',
                                      'mr-4 h-6 w-6 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </div>
                                {isActive ? (
                                  <ChevronLeftIcon className="icon-red" />
                                ) : (
                                  <ChevronRightIcon className="icon text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-200" />
                                )}
                              </div>
                            )}
                          </NavLink>
                        ))}
                      </nav>
                    </div>
                    <div>
                      <a
                        className="group flex items-center px-4 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-100"
                        href="https://github.com/envelope-zero/frontend/issues/new?labels=bug&template=bug_report.md"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExclamationTriangleIcon className="mr-4 h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-100" />{' '}
                        {t('navigation.bugReport')}
                      </a>
                      <div className="flex items-center justify-end px-4 text-sm font-medium text-gray-400">
                        {t('version')} {import.meta.env.VITE_VERSION || '0.0.0'}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 shrink-0">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </Dialog>
          </Transition.Root>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white dark:border-gray-900 dark:bg-slate-800">
              <div className="flex flex-1 flex-col justify-between overflow-y-auto pt-5 pb-4">
                <div>
                  <div className="flex shrink-0 items-center px-4">
                    <div>
                      <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {safeName(budget, 'budget')}
                      </div>
                      <Link
                        className="link"
                        to="budgets"
                        onClick={() => setSidebarOpen(false)}
                      >
                        {t('navigation.switchBudget')}
                      </Link>
                    </div>
                  </div>
                  <Link
                    to="/transactions/new"
                    className="link-blue group my-4 flex items-center border-y p-4 text-sm font-medium shadow-inner hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-slate-700"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <BoltIcon className="mr-3 h-6 w-6 shrink-0" />
                    {t('transactions.add')}
                  </Link>
                  <nav className="mt-5 flex-1 space-y-1 bg-white dark:bg-slate-800">
                    {navigation.map(item => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? 'border-r-4 border-red-800 bg-red-800/[.1] text-gray-900 dark:bg-red-600/[.15] dark:text-gray-100'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-200',
                            'group flex items-center px-4 py-2 text-sm font-medium'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className={classNames(
                                isActive
                                  ? 'text-red-800 dark:text-red-600'
                                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-200',
                                'mr-3 h-6 w-6 shrink-0'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </nav>
                </div>
                <div>
                  <a
                    className="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-100"
                    href="https://github.com/envelope-zero/frontend/issues/new?labels=bug&template=bug_report.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExclamationTriangleIcon className="mr-3 h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-100" />{' '}
                    {t('navigation.bugReport')}
                  </a>
                  <div className="flex items-center px-4 text-sm font-medium text-gray-400">
                    {t('version')} {import.meta.env.VITE_VERSION || '0.0.0'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className={`${hideNav ? '' : 'lg:pl-64'} flex flex-1 flex-col`}>
        <div
          className="sticky top-0 z-10 bg-gray-100 px-6 pt-4 lg:hidden dark:bg-slate-900"
          ref={headerRef as React.RefObject<HTMLDivElement | null>}
        >
          <button
            type="button"
            className={`-mt-0.5 -ml-0.5 inline-flex h-12 items-center rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 ${
              hideNav ? 'invisible' : 'visible'
            }`}
            onClick={() => {
              setSidebarOpen(true)
            }}
          >
            <span className="sr-only">{t('navigation.openSidebar')}</span>
            <Bars3Icon className="icon-red" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-4 lg:py-6">
            {showImportBanner && (
              <ImportBanner
                hideBanner={() => {
                  setShowImportBanner(false)
                }}
              />
            )}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <Error error={error} />
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      {notification && (
        <Notification
          notification={notification}
          setNotification={setNotification}
        />
      )}
    </div>
  )
}

export default Layout
