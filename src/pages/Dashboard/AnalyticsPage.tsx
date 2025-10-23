import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons'

import React from 'react'

import { Button, Card, Col, Row, Space, Statistic, Typography } from 'antd'

const { Title, Paragraph } = Typography

const AnalyticsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Analytics</Title>
      <Paragraph>Overview of your exam checking system analytics and performance metrics.</Paragraph>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title='Total Exams' value={45} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='Completed'
              value={38}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title='Pending' value={7} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title='Success Rate' value={84.4} suffix='%' valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title='Quick Actions' style={{ marginBottom: 24 }}>
        <Space size='middle' wrap>
          <Button type='primary' icon={<PlusOutlined />}>
            Create New Exam
          </Button>
          <Button icon={<FileTextOutlined />}>View All Exams</Button>
          <Button icon={<CheckCircleOutlined />}>Review Results</Button>
        </Space>
      </Card>

      {/* Recent Activity */}
      <Card title='Recent Activity'>
        <div style={{ padding: '16px 0' }}>
          <p>📝 Exam "Math Final" was created</p>
          <p>✅ Exam "Science Quiz" was completed by 25 students</p>
          <p>📊 Results for "History Test" are now available</p>
        </div>
      </Card>
    </div>
  )
}

export default AnalyticsPage
