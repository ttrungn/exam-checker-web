import { orange } from '@ant-design/colors'

import { ConfigProvider, theme } from 'antd'

interface Props {
  children: React.ReactNode
}

const AppConfigProvider: React.FC<Props> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        components: {
          Button: {
            colorPrimary: orange.primary,
            colorPrimaryHover: orange[4]
          },
          Switch: {
            colorPrimary: orange.primary,
            colorPrimaryHover: orange[4]
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default AppConfigProvider
