import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
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
  note?: string
  tooltip?: string
  className?: string
  inputWrapperClass?: string
  labelClass?: string
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
  note,
  tooltip,
  className,
  inputWrapperClass,
  labelClass,
}: Props) => {
  if (type === 'number' && typeof options?.step === 'undefined') {
    options = { ...options, step: 'any' }
  }

  return (
    <div className={className || ''}>
      <label htmlFor={name} className={labelClass ?? 'form-field--label'}>
        <span className="flex items-center">
          {label}
          {typeof tooltip !== 'undefined' ? (
            <Tooltip
              content={tooltip}
              trigger="click"
              className="mx-2 max-w-lg whitespace-pre-line shadow-2xl dark:border dark:border-slate-800"
            >
              <button
                type="button"
                className="full-centered my-auto ml-1 text-gray-500"
              >
                <QuestionMarkCircleIcon className="icon-xs" />
                <span className="sr-only">?</span>
              </button>
            </Tooltip>
          ) : null}
        </span>
      </label>

      <div className={inputWrapperClass ?? 'input--outer sm:col-span-2'}>
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
      {note && <small className="block">{note}</small>}
    </div>
  )
}

export default FormField
