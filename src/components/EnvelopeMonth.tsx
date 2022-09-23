import { formatMoney } from '../lib/format'
import { Budget, EnvelopeMonth as EnvelopeMonthType } from '../types'

type props = { envelope: EnvelopeMonthType; i: number; budget: Budget }

const EnvelopeMonth = ({ envelope, i, budget }: props) => {
  return (
    <tr className={`border-t border-gray-${i === 0 ? '300' : '200'}`}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-ellipsis">
        {envelope.name}
      </td>
      <td
        className={`whitespace-nowrap px-3 py-4 text-sm text-right ${
          envelope.allocation < 0 ? 'negative' : 'text-gray-500'
        }`}
      >
        {formatMoney(envelope.allocation, budget.currency, 'auto')}
      </td>
      <td
        className={`whitespace-nowrap pl-3 pr-4 sm:pr-6 py-4 text-sm text-right ${
          envelope.balance < 0 ? 'negative' : 'text-gray-500'
        }`}
      >
        {formatMoney(envelope.balance, budget.currency, 'auto')}
      </td>
    </tr>
  )
}

export default EnvelopeMonth
