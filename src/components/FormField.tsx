type Props = {
  type: string
  name: string
  label: string
  value?: string
  options?: { [option: string]: string | boolean }
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
  hideLabel?: boolean
  compact?: boolean
}

const FormField = ({
  type,
  name,
  label,
  value,
  options,
  onChange,
  children,
  hideLabel,
  compact,
}: Props) => (
  <div className={`form-field--wrapper ${compact ? 'border-0' : ''}`}>
    <label
      htmlFor={name}
      className={`form-field--label ${hideLabel ? 'sr-only' : ''}`}
    >
      {label}
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
          {...options}
        />
        {children}
      </div>
    </div>
  </div>
)

export default FormField
