import { useState } from 'react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Combobox } from '@headlessui/react'

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

type Props<T> = {
  items: T[]
  label: string
  value: T
  disabled?: boolean
  onChange: (selectedItem: T) => void
  itemLabel: (item: T) => string
  itemId: (item: T) => number
}

const Autocomplete = <T,>({
  items,
  label,
  value,
  onChange,
  itemLabel,
  itemId,
  disabled,
}: Props<T>) => {
  const [query, setQuery] = useState('')

  const filteredItems =
    query === ''
      ? items
      : items.filter(item => {
          return itemLabel(item).toLowerCase().includes(query.toLowerCase())
        })

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

          {filteredItems.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 max-w-lg w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredItems.map(item => (
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
            </Combobox.Options>
          )}
        </div>
      </div>
    </Combobox>
  )
}

export default Autocomplete
