type Props = { children: React.ReactNode }

const FormFields = ({ children }: Props) => (
  <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-900">
    <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-900 sm:space-y-5">
      <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">{children}</div>
    </div>
  </div>
)

export default FormFields
