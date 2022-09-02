import { Outlet, NavLink, Link } from 'react-router-dom'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  EnvelopeIcon,
  BanknotesIcon,
  CogIcon,
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

type LayoutProps = { budget?: Budget }

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Layout = ({ budget }: LayoutProps) => {
  const { t }: Translation = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    { name: t('navigation.settings'), href: 'settings', icon: CogIcon },
  ]

  return (
    <div>
      {hideNav ? null : (
        <>
          <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 flex z-40 md:hidden"
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
                <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
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
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
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
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">
                          {t('navigation.closeSidebar')}
                        </span>
                        <XMarkIcon className="icon" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex-1 flex flex-col justify-between h-0 pt-5 pb-4 overflow-y-auto">
                    <div>
                      <div className="flex-shrink-0 flex items-center px-4">
                        <div>
                          <div className="text-lg font-bold">
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
                        className="my-4 border-y text-sky-600 group flex items-center p-4 text-base font-medium"
                      >
                        <BoltIcon className="inline mr-4 flex-shrink-0 h-6 w-6" />
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
                                  ? 'bg-red-800/[.1] text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                'group flex items-center px-4 py-4 text-base font-medium'
                              )
                            }
                          >
                            {({ isActive }) => (
                              <div className="flex justify-between w-full">
                                <div className="flex">
                                  <item.icon
                                    className={classNames(
                                      isActive
                                        ? 'text-red-800'
                                        : 'text-gray-400 group-hover:text-gray-500',
                                      'mr-4 flex-shrink-0 h-6 w-6'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </div>
                                {isActive ? (
                                  <ChevronLeftIcon className="icon" />
                                ) : (
                                  <ChevronRightIcon className="text-gray-400 group-hover:text-gray-500 h-6 w-6" />
                                )}
                              </div>
                            )}
                          </NavLink>
                        ))}
                      </nav>
                    </div>
                    <div>
                      <a
                        className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-4 text-base font-medium"
                        href="https://github.com/envelope-zero/frontend/issues/new?labels=bug&template=bug_report.md"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExclamationTriangleIcon className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6" />{' '}
                        {t('navigation.bugReport')}
                      </a>
                      <div className="text-gray-400 flex items-center px-4 text-sm font-medium justify-end">
                        {t('version')}{' '}
                        {process.env.REACT_APP_VERSION || '0.0.0'}
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
              <div className="flex-shrink-0 w-14">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </Dialog>
          </Transition.Root>

          {/* Static sidebar for desktop */}
          <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
              <div className="flex-1 flex flex-col justify-between pt-5 pb-4 overflow-y-auto">
                <div>
                  <div className="flex-shrink-0 flex items-center px-4">
                    <div>
                      <div className="text-base font-bold">
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
                    className="my-4 border-y text-sky-600 hover:text-sky-700 hover:bg-gray-50 group flex items-center p-4 text-sm font-medium"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <BoltIcon className="mr-3 flex-shrink-0 h-6 w-6" />
                    {t('transactions.add')}
                  </Link>
                  <nav className="mt-5 flex-1 bg-white space-y-1">
                    {navigation.map(item => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? 'bg-red-800/[.1] text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            'group flex items-center px-4 py-2 text-sm font-medium'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className={classNames(
                                isActive
                                  ? 'text-red-800'
                                  : 'text-gray-400 group-hover:text-gray-500',
                                'mr-3 flex-shrink-0 h-6 w-6'
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
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-2 text-sm font-medium"
                    href="https://github.com/envelope-zero/frontend/issues/new?labels=bug&template=bug_report.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExclamationTriangleIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />{' '}
                    {t('navigation.bugReport')}
                  </a>
                  <div className="text-gray-400 flex items-center px-4 text-sm font-medium">
                    {t('version')} {process.env.REACT_APP_VERSION || '0.0.0'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={`${hideNav ? '' : 'md:pl-64'} flex flex-col flex-1`}>
        <div className="sticky top-0 z-10 md:hidden px-6 pt-4 bg-white">
          <button
            type="button"
            className={`-ml-0.5 -mt-0.5 h-12 inline-flex items-center rounded-md text-gray-500 hover:text-gray-900 ${
              hideNav ? 'invisible' : 'visible'
            }`}
            onClick={() => {
              setSidebarOpen(true)
            }}
          >
            <span className="sr-only">{t('navigation.openSidebar')}</span>
            <Bars3Icon className="icon" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
