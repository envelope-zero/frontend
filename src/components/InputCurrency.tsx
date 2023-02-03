const InputCurrency = (props: { currency?: string }) => {
  return (
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
        {props.currency || ''}
      </span>
    </div>
  )
}

export default InputCurrency
