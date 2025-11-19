import { PercentageOutlined, SearchOutlined } from '@ant-design/icons'
import React, { useCallback, useEffect, useState } from 'react'
import { Card, Col, Form, Input, message, Progress, Row, Space, Table, Tag, Typography, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getDashboardSummary } from '../../apis/dashboard'
import type { DashboardSummary } from '../../types/dashboard.dto'

const { Title } = Typography

const DashboardPage: React.FC = () => {
  const [form] = Form.useForm()
  const [items, setItems] = useState<DashboardSummary[]>([])
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState<{ examCode?: string; subjectCode?: string }>({})

  const fetchData = useCallback(
    async (f = filters) => {
      setLoading(true)
      try {
        const res = await getDashboardSummary({
          examCode: f.examCode,
          subjectCode: f.subjectCode,
          orderBy: 'examCode asc,subjectCode asc',
          top: 100
        })
        if (res.success) {
          setItems(res.data || [])
        } else {
          message.error(res.message || 'Không thể tải dữ liệu tổng quan')
          setItems([])
        }
      } catch (e: any) {
        message.error(e?.response?.data?.message || 'Lỗi khi tải dữ liệu tổng quan')
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  useEffect(() => {
    fetchData()
  }, [])

  const onSearch = (values: any) => {
    const f = {
      examCode: values.examCode || undefined,
      subjectCode: values.subjectCode || undefined
    }
    setFilters(f)
    fetchData(f)
  }

  const columns: ColumnsType<DashboardSummary> = [
    { title: 'Kỳ thi', dataIndex: 'examCode', key: 'examCode' },
    { title: 'Môn học', dataIndex: 'subjectCode', key: 'subjectCode' },
    { title: 'Tổng bài nộp', dataIndex: 'totalSubmissions', key: 'totalSubmissions' },
    { title: 'Đã chấm', dataIndex: 'graded', key: 'graded', render: (v: number) => <Tag color='green'>{v}</Tag> },
    { title: 'Chấm lại', dataIndex: 'reassigned', key: 'reassigned', render: (v: number) => <Tag color='orange'>{v}</Tag> },
    { title: 'Đã duyệt', dataIndex: 'approved', key: 'approved', render: (v: number) => <Tag color='blue'>{v}</Tag> },
    { title: 'Chưa chấm', dataIndex: 'notGraded', key: 'notGraded' },
    { title: 'Vi phạm', dataIndex: 'violated', key: 'violated', render: (v: number) => <Tag color='red'>{v}</Tag> },
    {
      title: 'Tiến độ',
      dataIndex: 'progressPercent',
      key: 'progressPercent',
      render: (v: number) => (
        <Space>
          <Progress percent={Math.round(v)} size='small' />
          <Tag icon={<PercentageOutlined />} color='processing'>
            {Math.round(v)}%
          </Tag>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/** Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout='vertical' onFinish={onSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Mã kỳ thi' name='examCode'>
                <Input placeholder='Lọc theo mã kỳ thi (vd: FALL25)' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Mã môn học' name='subjectCode'>
                <Input placeholder='Lọc theo mã môn học (vd: PRN222)' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label=' '>
                <Space>
                  <Button type='primary' htmlType='submit' icon={<SearchOutlined />}>Tìm kiếm</Button>
                  <Button onClick={() => { form.resetFields(); const f = {}; setFilters(f); fetchData(f as any) }}>Đặt lại</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title={<Title level={4} style={{ margin: 0 }}>Tổng quan theo Exam-Subject</Title>} loading={loading}>
        <Table
          rowKey={(r) => r.examSubjectId}
          columns={columns}
          dataSource={items}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

export default DashboardPage
