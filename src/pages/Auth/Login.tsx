import { LockOutlined, UserOutlined } from '@ant-design/icons'

import React from 'react'

import { Button, Card, Col, Form, Input, Layout, Row, Typography } from 'antd'

const { Title, Text } = Typography

interface LoginFormValues {
  username: string
  password: string
}

const Login: React.FC = () => {
  const [form] = Form.useForm()

  const onFinish = (values: LoginFormValues) => {
    console.log('Login values:', values)
    // Handle login logic here
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Row style={{ height: '100vh' }}>
        {/* Left side - Login Form */}
        <Col
          xs={24}
          md={12}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            padding: '2rem'
          }}
        >
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <Card
              style={{
                padding: '2rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                borderRadius: '12px',
                border: 'none'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Title level={2} style={{ marginBottom: '0.5rem' }}>
                  Welcome Back
                </Title>
                <Text type='secondary'>Please sign in to your account</Text>
              </div>

              <Form form={form} name='login' onFinish={onFinish} layout='vertical' size='large'>
                <Form.Item
                  name='username'
                  label='Username'
                  rules={[{ required: true, message: 'Please input your username!' }]}
                  style={{ marginBottom: '1.5rem' }}
                >
                  <Input prefix={<UserOutlined />} placeholder='Enter your username' />
                </Form.Item>

                <Form.Item
                  name='password'
                  label='Password'
                  rules={[{ required: true, message: 'Please input your password!' }]}
                  style={{ marginBottom: '1.5rem' }}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder='Enter your password' />
                </Form.Item>

                <Form.Item>
                  <Button
                    type='primary'
                    htmlType='submit'
                    block
                    style={{
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: 500,
                      borderRadius: '8px',
                      marginTop: '1rem'
                    }}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Text type='secondary'>
                  Don't have an account?{' '}
                  <a
                    href='#register'
                    style={{
                      color: '#1890ff',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    Sign up
                  </a>
                </Text>
              </div>
            </Card>
          </div>
        </Col>

        {/* Right side - Image Section */}
        <Col
          xs={0}
          md={12}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
              // When you add your image, replace the above styles with:
              // backgroundImage: 'url("path-to-your-image.jpg")',
              // backgroundSize: 'cover',
              // backgroundPosition: 'center',
              // backgroundRepeat: 'no-repeat',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: 'white',
                maxWidth: '400px',
                padding: '2rem'
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
              <Title level={3} style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>
                Exam Checker
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', display: 'block' }}>
                Streamline your exam process with our comprehensive checking system
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Layout>
  )
}

export default Login
