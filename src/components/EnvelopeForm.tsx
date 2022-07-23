import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api/base'
import { Translation } from '../types'

const envelopeApi = api('envelopes')

type Props = {}

const EnvelopeForm = ({}: Props) => {
  const { t }: Translation = useTranslation()
  const { envelopeId } = useParams()
  const navigate = useNavigate()

  const [error, setError] = useState('')

  return <>Edit me! - {envelopeId}</>
}

export default EnvelopeForm
