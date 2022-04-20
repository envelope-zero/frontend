import { Outlet, NavLink, Link } from 'react-router-dom'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  MailIcon,
  CashIcon,
  CogIcon,
  SwitchHorizontalIcon,
  HomeIcon,
  MenuIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationIcon,
} from '@heroicons/react/outline'
import { useTranslation } from 'react-i18next'
import { Translation } from '../types'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Layout = () => {
  const { t }: Translation = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: t('navigation.home'), href: '/', icon: HomeIcon },
    { name: t('navigation.envelopes'), href: 'envelopes', icon: MailIcon },
    {
      name: t('navigation.transactions'),
      href: 'transactions',
      icon: SwitchHorizontalIcon,
    },
    { name: t('navigation.accounts'), href: 'accounts', icon: CashIcon },
    { name: t('navigation.settings'), href: 'settings', icon: CogIcon },
  ]

  return (
    <div>
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
                    <XIcon
                      className="h-6 w-6 text-red-800"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 flex flex-col justify-between h-0 pt-5 pb-4 overflow-y-auto">
                <div>
                  <div className="flex-shrink-0 flex items-center px-4">
                    <div>
                      <div className="text-lg font-bold">Budget Morre</div>
                      <Link
                        className="link"
                        to="budgets"
                        onClick={() => setSidebarOpen(false)}
                      >
                        {t('navigation.switchBudget')}
                      </Link>
                    </div>
                  </div>
                  <nav className="mt-5 space-y-1">
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
                              <ChevronLeftIcon className="text-red-800 h-6 w-6" />
                            ) : (
                              <ChevronRightIcon className="text-gray-400 group-hover:text-gray-500 h-6 w-6" />
                            )}
                          </div>
                        )}
                      </NavLink>
                    ))}
                  </nav>
                </div>
                <a
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-4 text-base font-medium"
                  href="https://github.com/envelope-zero/frontend/issues/new?labels=bug&template=bug_report.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExclamationIcon className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6" />{' '}
                  {t('navigation.bugReport')}
                </a>
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
                  <div className="text-base font-bold">Budget Morre</div>
                  <Link
                    className="link"
                    to="budgets"
                    onClick={() => setSidebarOpen(false)}
                  >
                    {t('navigation.switchBudget')}
                  </Link>
                </div>
              </div>
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
            <a
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-2 text-sm font-medium"
              href="https://github.com/envelope-zero/frontend/issues/new?labels=bug&template=bug_report.md"
              target="_blank"
              rel="noreferrer"
            >
              <ExclamationIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />{' '}
              {t('navigation.bugReport')}
            </a>
          </div>
        </div>
      </div>
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-800"
            onClick={() => {
              setSidebarOpen(true)
            }}
          >
            <span className="sr-only">{t('navigation.openSidebar')}</span>
            <MenuIcon className="h-6 w-6 text-red-800" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
