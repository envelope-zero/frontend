type Props = { children: React.ReactNode; className?: string }

const FormFields = ({ children, className }: Props) => (
  <div className={className || 'space-y-6 sm:space-y-10'}>{children}</div>
)

export default FormFields
