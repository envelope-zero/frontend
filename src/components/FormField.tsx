type Props = {
  type: string
  name: string
  label: string
  value: string | number
  options?: { [option: string]: string | boolean }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
}

const FormField = ({
  type,
  name,
  label,
  value,
  options,
  onChange,
  children,
}: Props) => (
  <div className="form-field--wrapper">
    <label htmlFor={name} className="form-field--label">
      {label}
    </label>

    <div className="input--outer">
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
