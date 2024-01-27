import { InformationCircleIcon } from '@heroicons/react/24/outline'

type Props = { text: string }

const InfoBox = ({ text }: Props) => {
  return (
    <div className="flex rounded-r-md border-l-4 border-blue-900 bg-blue-100/[.75] p-2 text-blue-900 dark:rounded-md dark:border-none">
      <InformationCircleIcon className="icon mr-1 inline" />
      {text}
    </div>
  )
}

export default InfoBox
