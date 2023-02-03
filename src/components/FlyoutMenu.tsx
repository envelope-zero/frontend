import { useTranslation } from 'react-i18next'
import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { Translation } from '../types'
import { Link } from 'react-router-dom'

type Props = {
  items: { name: string; href: string; description?: string }[]
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const FlyoutMenu = ({ items }: Props) => {
  const { t }: Translation = useTranslation()

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              open ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500',
              'group inline-flex items-center rounded-md bg-white dark:bg-slate-800 text-base font-medium hover:text-gray-900 dark:hover:text-gray-100'
            )}
            title={t('more')}
          >
            <EllipsisHorizontalIcon className="icon" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute -right-10 z-10 mt-3 w-screen max-w-xs transform">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative grid gap-6 bg-white dark:bg-slate-800 px-5 py-6 sm:gap-8 text-left">
                  {items.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="-m-3 block rounded-md p-3 transition duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default FlyoutMenu
