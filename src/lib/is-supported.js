import { browserName, isMobile } from 'react-device-detect'

const inputTypeMonth = () => {
  const supportingDesktopBrowsers = ['Chrome', 'Opera', 'Edge', 'EdgeChromium']
  return isMobile || supportingDesktopBrowsers.includes(browserName)
}

const isSupported = { inputTypeMonth }

export default isSupported
