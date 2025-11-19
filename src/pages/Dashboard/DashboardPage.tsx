import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  TrophyOutlined,
  WarningOutlined
} from '@ant-design/icons'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Divider, Form, Input, message, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'
import { getDashboardSummary } from '../../apis/dashboard'
import type { DashboardSummary } from '../../types/dashboard.dto'

const { Title, Text } = Typography

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
    []
  )

  useEffect(() => {
    fetchData(filters)
  }, [fetchData])

  const onSearch = (values: any) => {
    const f = {
      examCode: values.examCode || undefined,
      subjectCode: values.subjectCode || undefined
    }
    setFilters(f)
    fetchData(f)
  }

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = items.reduce((acc, item) => acc + item.totalSubmissions, 0)
    const graded = items.reduce((acc, item) => acc + item.graded, 0)
    const approved = items.reduce((acc, item) => acc + item.approved, 0)
    const notGraded = items.reduce((acc, item) => acc + item.notGraded, 0)
    const violated = items.reduce((acc, item) => acc + item.violated, 0)
    const reassigned = items.reduce((acc, item) => acc + item.reassigned, 0)
    const avgProgress = items.length > 0 ? items.reduce((acc, item) => acc + item.progressPercent, 0) / items.length : 0

    return { total, graded, approved, notGraded, violated, reassigned, avgProgress }
  }, [items])

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

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title='Tổng bài nộp'
              value={summary.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title='Đã duyệt'
              value={summary.approved}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title='Đang chờ chấm'
              value={summary.notGraded}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title='Tiến độ trung bình'
              value={summary.avgProgress}
              precision={1}
              suffix='%'
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: summary.avgProgress >= 80 ? '#52c41a' : summary.avgProgress >= 50 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Exam-Subject Cards */}
      <Title level={4}>Chi tiết theo Exam-Subject</Title>
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={i}>
              <Card loading />
            </Col>
          ))}
        </Row>
      ) : items.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
            <Text type='secondary'>Không có dữ liệu. Vui lòng thử tìm kiếm với các tiêu chí khác.</Text>
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((item) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={item.examSubjectId}>
              <Card
                title={
                  <Space direction='vertical' size={0}>
                    <Text strong style={{ fontSize: 16 }}>
                      {item.examCode}
                    </Text>
                    <Tag color='blue'>{item.subjectCode}</Tag>
                  </Space>
                }
                extra={
                  <Progress
                    type='circle'
                    percent={Math.round(item.progressPercent)}
                    width={50}
                    strokeColor={
                      item.progressPercent >= 80 ? '#52c41a' : item.progressPercent >= 50 ? '#faad14' : '#ff4d4f'
                    }
                  />
                }
                hoverable
              >
                <Space direction='vertical' size='small' style={{ width: '100%' }}>
                  <Row justify='space-between'>
                    <Text type='secondary'>Tổng bài nộp:</Text>
                    <Text strong>{item.totalSubmissions}</Text>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row justify='space-between'>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>Đã chấm:</Text>
                    </Space>
                    <Tag color='green'>{item.graded}</Tag>
                  </Row>
                  <Row justify='space-between'>
                    <Space>
                      <TrophyOutlined style={{ color: '#1890ff' }} />
                      <Text>Đã duyệt:</Text>
                    </Space>
                    <Tag color='blue'>{item.approved}</Tag>
                  </Row>
                  <Row justify='space-between'>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <Text>Chưa chấm:</Text>
                    </Space>
                    <Tag color='orange'>{item.notGraded}</Tag>
                  </Row>
                  <Row justify='space-between'>
                    <Space>
                      <ReloadOutlined style={{ color: '#722ed1' }} />
                      <Text>Chấm lại:</Text>
                    </Space>
                    <Tag color='purple'>{item.reassigned}</Tag>
                  </Row>
                  <Row justify='space-between'>
                    <Space>
                      <WarningOutlined style={{ color: '#ff4d4f' }} />
                      <Text>Vi phạm:</Text>
                    </Space>
                    <Tag color='red'>{item.violated}</Tag>
                  </Row>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default DashboardPage
