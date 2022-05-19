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
  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
    >
      {label}
    </label>

    <div className="mt-1 sm:mt-0 sm:col-span-2 relative">
      <div className="max-w-lg flex rounded-md shadow-sm">
        <input
          className="flex-1 block w-full min-w-0 sm:text-sm"
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
