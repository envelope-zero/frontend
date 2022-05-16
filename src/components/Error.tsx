import { ExclamationIcon } from '@heroicons/react/outline'

type Props = { error: string }

const Error = ({ error }: Props) => {
  if (!error) {
    return null
  }

  return (
    <div className="error">
      <ExclamationIcon className="icon inline mr-1" /> {error}
    </div>
  )
}

export default Error
