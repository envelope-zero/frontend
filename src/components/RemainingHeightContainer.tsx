import { createRef, useEffect } from 'react'

type Props = { children: React.ReactNode }

const RemainingHeightContainer = ({ children }: Props) => {
  const ref = createRef<HTMLDivElement>()

  const setMaximumHeight = () => {
    if (ref.current !== null) {
      const viewportHeight = window.innerHeight
      const offsetTop = ref.current.getBoundingClientRect().top

      const maxHeight = viewportHeight - offsetTop
      ref.current.style.height = `${maxHeight}px`
    }
  }

  useEffect(() => {
    setMaximumHeight()
    window.addEventListener('resize', setMaximumHeight)
  })

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      {children}
    </div>
  )
}

export default RemainingHeightContainer
