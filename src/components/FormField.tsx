import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Tooltip } from 'flowbite-react'

type Props = {
  type: string
  name: string
  label: string
  value?: string
  options?: { [option: string]: string | boolean }
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  children?: React.ReactNode
  hideLabel?: boolean
  compact?: boolean
  note?: string
  tooltip?: string
}

const FormField = ({
  type,
  name,
  label,
  value,
  options,
  onChange,
  onFocus,
  children,
  hideLabel,
  compact,
  note,
  tooltip,
}: Props) => {
  if (type === 'number' && typeof options?.step === 'undefined') {
    options = { ...options, step: 'any' }
  }

  return (
    <div className={`form-field--wrapper ${compact ? 'border-0' : ''}`}>
      <label
        htmlFor={name}
        className={`form-field--label ${hideLabel ? 'sr-only' : ''}`}
      >
        <span className="flex">
          {label}
          {typeof tooltip !== 'undefined' ? (
            <Tooltip
              content={tooltip}
              trigger="click"
              className="whitespace-pre-line max-w-lg"
            >
              <button type="button" className="ml-1 my-auto">
                <QuestionMarkCircleIcon className="icon-sm" />
                <span className="sr-only">?</span>
              </button>
            </Tooltip>
          ) : null}
        </span>
        {note && <small className="block">{note}</small>}
      </label>

      <div
        className={`input--outer ${
          hideLabel ? 'sm:col-span-3' : 'sm:col-span-2'
        }`}
      >
        <div className="input--inner">
          <input
            className="input"
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            {...options}
          />
          {children}
        </div>
      </div>
    </div>
  )
}

export default FormField
