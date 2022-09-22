import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type Props = { error: string }

const Error = ({ error }: Props) => {
  if (!error) {
    return null
  }

  return (
    <div className="error mb-3">
      <ExclamationTriangleIcon className="icon-red inline mr-1" /> {error}
    </div>
  )
}

export default Error
