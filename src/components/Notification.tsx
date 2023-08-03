import { InformationCircleIcon } from '@heroicons/react/24/outline'

type Props = { children: string }

const Notification = ({ children }: Props) => {
  return (
    <div className="alert mb-3">
      <InformationCircleIcon className="icon text-green-800 inline mr-1" />
      {children}
    </div>
  )
}

export default Notification
