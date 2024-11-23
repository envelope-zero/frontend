import { UUID, Translation, ArchivableResource } from '../types'
import { useEffect, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import { useTranslation } from 'react-i18next'
import { ArchiveBoxIcon } from '@heroicons/react/24/outline'

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

type Props<T> = {
  groups: { title?: string; items: T[] }[]
  label: string
  value: T
  disabled?: boolean
  allowNewCreation?: boolean
  emptyOption?: string
  onChange: (selectedItem: T) => void
  itemLabel: (item: T) => string
  itemId: (item: T) => UUID
  wrapperClass?: string
  labelClass?: string
  inputWrapperClass?: string
}

const valueOrDefault = (customValue: any, defaultValue: any) => {
  if (typeof customValue === 'undefined') {
    return defaultValue
  }
  return customValue
}

const Autocomplete = <T extends ArchivableResource>({
  groups,
  label,
  value,
  onChange,
  itemLabel,
  itemId,
  disabled,
  allowNewCreation,
  emptyOption,
  wrapperClass,
  labelClass,
  inputWrapperClass,
}: Props<T>) => {
  const { t }: Translation = useTranslation()
  const [query, setQuery] = useState('')

  const isArchived = (item: T) => {
    return item.archived
  }

  useEffect(() => {
    if (value?.name !== query) {
      setQuery(value?.name || '')
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredGroups = (
    query === ''
      ? groups.map(group => ({
          ...group,
          items: group.items.filter(item => !isArchived(item)),
        }))
      : groups.map(group => ({
          title: group.title,
          items: group.items.filter(item => {
            if (isArchived(item)) {
              return itemLabel(item).toLowerCase() === query.toLowerCase()
            } else {
              return itemLabel(item).toLowerCase().includes(query.toLowerCase())
            }
          }),
        }))
  ).filter(group => group.items.length)

  return (
    <Combobox
      as="div"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={wrapperClass ?? ''}
    >
      <Combobox.Label
        className={valueOrDefault(labelClass, 'form-field--label')}
      >
        {label}
      </Combobox.Label>
      <div className={`${valueOrDefault(inputWrapperClass, 'input--outer')}`}>
        <Combobox.Input
          className="input"
          onChange={event => setQuery(event.target.value)}
          displayValue={(item: T) => (item ? itemLabel(item) : '')}
          placeholder={t('select')}
          autoComplete="off"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800 sm:text-sm">
          {emptyOption && query.length === 0 ? (
            <Combobox.Option
              value={null}
              className={({ active }) =>
                classNames(
                  'relative cursor-default select-none py-2 pl-3 pr-9',
                  active
                    ? 'bg-sky-600 text-white'
                    : 'text-gray-900 dark:text-gray-300'
                )
              }
            >
              <div className="flex items-center">
                <span className="ml-3 truncate italic">{emptyOption}</span>
              </div>
            </Combobox.Option>
          ) : null}

          {filteredGroups.map((group, i) => (
            <div key={i}>
              {filteredGroups.length > 1 ? (
                <div className="relative bg-gray-200 py-2 pl-3 pr-9 text-gray-800 dark:bg-slate-700 dark:text-gray-200">
                  {group.title}
                </div>
              ) : null}

              {group.items.map(item => (
                <Combobox.Option
                  key={itemId(item)}
                  value={item}
                  className={({ active }) =>
                    classNames(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active
                        ? 'bg-sky-600 text-white'
                        : 'text-gray-900 dark:text-gray-300'
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <div className="flex items-center">
                        <span
                          className={classNames(
                            'ml-3 truncate',
                            selected && 'font-semibold'
                          )}
                        >
                          {isArchived(item) ? (
                            <ArchiveBoxIcon
                              className="icon-sm link-blue mr-2 inline stroke-2"
                              title={t('archived')}
                            />
                          ) : null}
                          {itemLabel(item)}
                        </span>
                      </div>

                      {selected && (
                        <span
                          className={classNames(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active
                              ? 'text-white dark:text-gray-300'
                              : 'text-sky-600'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </div>
          ))}

          {allowNewCreation && query.length ? (
            <Combobox.Option
              key={`new-${query}`}
              value={{ name: query }}
              className={({ active }) =>
                classNames(
                  'relative cursor-default select-none border-t py-2 pl-3 pr-9 dark:border-gray-900',
                  active
                    ? 'bg-sky-600 text-white'
                    : 'text-gray-900 dark:text-gray-300'
                )
              }
            >
              <div className="flex items-center">
                <span className="ml-3 truncate italic">
                  {t('transactions.createResource', {
                    name: query,
                  })}
                </span>
              </div>
            </Combobox.Option>
          ) : null}

          {filteredGroups.length === 0 && !allowNewCreation && !emptyOption ? (
            <Combobox.Option value={undefined} disabled>
              <div className="flex items-center">
                <span className="ml-3 truncate italic">
                  {t('autocomplete.empty')}
                </span>
              </div>
            </Combobox.Option>
          ) : null}
        </Combobox.Options>
      </div>
    </Combobox>
  )
}

export default Autocomplete
