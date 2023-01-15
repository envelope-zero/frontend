import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Translation } from '../types'

type Props = {
  resourceLabel: string
  value?: string | null
  onSubmit: (value: string) => void
}

const SearchBar = ({ resourceLabel, onSubmit, value }: Props) => {
  const { t }: Translation = useTranslation()
  const [search, setSearch] = useState(value || '')

  return (
    <form
      role="search"
      onSubmit={e => {
        e.preventDefault()
        onSubmit(search)
      }}
    >
      <label htmlFor="search" className="sr-only">
        {t('searchResource', { resource: resourceLabel })}
      </label>
      <div className="input--outer mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="search"
          name="search"
          id="search"
          className="input pl-10"
          placeholder={t('searchResource', { resource: resourceLabel })}
          value={search}
          onChange={e => {
            setSearch(e.target.value)
          }}
        />
      </div>
    </form>
  )
}

export default SearchBar
