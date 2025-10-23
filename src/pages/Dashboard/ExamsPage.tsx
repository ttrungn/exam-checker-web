import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'

import React from 'react'

import { Button, Card, Space, Table, Tag, Typography } from 'antd'

const { Title } = Typography

interface Exam {
  key: string
  id: string
  name: string
  subject: string
  status: 'draft' | 'published' | 'completed'
  students: number
  duration: number
  createdAt: string
}

const ExamsPage: React.FC = () => {
  const mockExams: Exam[] = [
    {
      key: '1',
      id: 'E001',
      name: 'Math Final Exam',
      subject: 'Mathematics',
      status: 'published',
      students: 25,
      duration: 120,
      createdAt: '2024-01-15'
    },
    {
      key: '2',
      id: 'E002',
      name: 'Science Quiz',
      subject: 'Science',
      status: 'completed',
      students: 30,
      duration: 60,
      createdAt: '2024-01-10'
    },
    {
      key: '3',
      id: 'E003',
      name: 'History Test',
      subject: 'History',
      status: 'draft',
      students: 0,
      duration: 90,
      createdAt: '2024-01-20'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'blue'
      case 'completed':
        return 'green'
      case 'draft':
        return 'orange'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: 'Exam ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students'
    },
    {
      title: 'Duration (min)',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size='middle'>
          <Button size='small' icon={<EyeOutlined />} />
          <Button size='small' icon={<EditOutlined />} />
          <Button size='small' icon={<DeleteOutlined />} danger />
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Exams</Title>
        <Button type='primary' icon={<PlusOutlined />}>
          Create New Exam
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={mockExams}
          pagination={{
            total: mockExams.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>
    </div>
  )
}

export default ExamsPage
