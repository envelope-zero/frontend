import { ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { ArchivableResource, ApiConnection, Translation } from '../types'

type Props = {
  resource: ArchivableResource
  resourceTypeTranslation: string
  apiConnection: ApiConnection<ArchivableResource>
  onSuccess: (data: ArchivableResource) => void
  onError: (error: string) => void
}

const ArchiveButton = ({
  resource,
  resourceTypeTranslation,
  apiConnection,
  onSuccess,
  onError,
}: Props) => {
  const { t }: Translation = useTranslation()

  return (
    <button
      type="button"
      onClick={() => {
        apiConnection
          .update({ ...resource, archived: !resource.archived })
          .then(onSuccess)
          .catch(onError)
      }}
      className="btn-secondary"
    >
      <ArchiveBoxIcon className="icon-sm relative bottom-0.5 mr-1 inline" />
      {t(resource.archived ? 'unarchiveObject' : 'archiveObject', {
        object: resourceTypeTranslation,
      })}
    </button>
  )
}

export default ArchiveButton
