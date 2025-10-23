import React from 'react'

import { Button, Card, Divider, Form, Input, Space, Switch, Typography } from 'antd'

const { Title, Text } = Typography

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm()

  const handleSave = (values: Record<string, unknown>) => {
    console.log('Settings saved:', values)
  }

  return (
    <div>
      <Title level={2}>Settings</Title>
      <Text type='secondary'>Configure your exam checker application settings</Text>

      <div style={{ marginTop: 24 }}>
        <Card title='General Settings' style={{ marginBottom: 24 }}>
          <Form
            form={form}
            layout='vertical'
            onFinish={handleSave}
            initialValues={{
              siteName: 'Exam Checker',
              adminEmail: 'admin@example.com',
              enableNotifications: true,
              autoGrading: true
            }}
          >
            <Form.Item
              label='Site Name'
              name='siteName'
              rules={[{ required: true, message: 'Please enter site name' }]}
            >
              <Input placeholder='Enter site name' />
            </Form.Item>

            <Form.Item
              label='Admin Email'
              name='adminEmail'
              rules={[
                { required: true, message: 'Please enter admin email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input placeholder='Enter admin email' />
            </Form.Item>

            <Divider />

            <Form.Item label='Enable Notifications' name='enableNotifications' valuePropName='checked'>
              <Switch />
            </Form.Item>

            <Form.Item label='Auto Grading' name='autoGrading' valuePropName='checked'>
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type='primary' htmlType='submit'>
                  Save Settings
                </Button>
                <Button htmlType='reset'>Reset</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title='Security Settings'>
          <Form layout='vertical'>
            <Form.Item label='Session Timeout (minutes)'>
              <Input placeholder='30' />
            </Form.Item>

            <Form.Item label='Maximum Login Attempts'>
              <Input placeholder='5' />
            </Form.Item>

            <Form.Item>
              <Button type='primary'>Update Security Settings</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
