const LoadingSpinner = () => {
  return (
    <div className="w-full flex justify-center">
      <div
        style={{ borderTopColor: 'transparent' }}
        className="w-8 h-8 border-4 border-gray-600 border-dotted rounded-full animate-spin"
      ></div>
    </div>
  )
}

export default LoadingSpinner
