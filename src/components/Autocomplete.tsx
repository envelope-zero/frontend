import { UUID } from '../types'
import { useState } from 'react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Combobox } from '@headlessui/react'
import { Translation } from '../types'
import { useTranslation } from 'react-i18next'

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

type Props<T> = {
  groups: { title?: string; items: T[] }[]
  label: string
  value: T
  disabled?: boolean
  onChange: (selectedItem: T) => void
  itemLabel: (item: T) => string
  itemId: (item: T) => UUID
}

const Autocomplete = <T,>({
  groups,
  label,
  value,
  onChange,
  itemLabel,
  itemId,
  disabled,
}: Props<T>) => {
  const { t }: Translation = useTranslation()
  const [query, setQuery] = useState('')

  const filteredGroups = (
    query === ''
      ? groups
      : groups.map(group => ({
          title: group.title,
          items: group.items.filter(item => {
            return itemLabel(item).toLowerCase().includes(query.toLowerCase())
          }),
        }))
  ).filter(group => group.items.length)

  return (
    <Combobox as="div" value={value} onChange={onChange} disabled={disabled}>
      <div className="form-field--wrapper">
        <Combobox.Label className="form-field--label">{label}</Combobox.Label>
        <div className="input--outer">
          <div className="input--inner">
            <Combobox.Input
              className="input"
              onChange={event => setQuery(event.target.value)}
              displayValue={(item: T) => (item ? itemLabel(item) : '')}
              autoComplete="off"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <SelectorIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>

          <Combobox.Options className="absolute z-10 mt-1 max-h-60 max-w-lg w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredGroups.map((group, i) => (
              <div key={i}>
                {filteredGroups.length > 1 ? (
                  <div className="relative py-2 pl-3 pr-9 text-gray-800 bg-gray-200">
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
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900'
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
                            {itemLabel(item)}
                          </span>
                        </div>

                        {selected && (
                          <span
                            className={classNames(
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                              active ? 'text-white' : 'text-indigo-600'
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

            {query.length ? (
              <Combobox.Option
                key={`new-${query}`}
                value={{ name: query }}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9 border-t',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
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
          </Combobox.Options>
        </div>
      </div>
    </Combobox>
  )
}

export default Autocomplete
