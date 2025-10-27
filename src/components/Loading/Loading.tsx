import { Spin } from 'antd'

export type LoadingProps = {
  message: string
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}
    >
      <Spin size='large' />
      <div>{message}</div>
    </div>
  )
}

export default Loading
