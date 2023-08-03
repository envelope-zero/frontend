import { InformationCircleIcon } from '@heroicons/react/24/outline'

type Props = { text: string }

const InfoBox = ({ text }: Props) => {
  return (
    <div className="flex bg-blue-100/[.75] text-blue-900 p-2 rounded-md">
      <InformationCircleIcon className="icon inline mr-1" />
      {text}
    </div>
  )
}

export default InfoBox
