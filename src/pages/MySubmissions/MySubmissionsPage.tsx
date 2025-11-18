import { EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'

import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd'

import { getUserSubmissions, type UserSubmission } from '../../apis/submissions'
import { Roles } from '../../constants/auth'
import { useAppSelector } from '../../hooks/customReduxHooks'
import { AssessmentStatus, SubmissionStatus } from '../../types/submission.dto'

const { Title } = Typography

const MySubmissionsPage: React.FC = () => {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<UserSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<UserSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [searchForm] = Form.useForm()

  const { profile } = useAppSelector((state) => state.userProfile)
  const [messageApi, messageContextHolder] = message.useMessage()

  // Check if user has Examiner role
  const isExaminer = profile?.roles?.some((role) => role.value === Roles.EXAMINER) || false

  const fetchMySubmissions = useCallback(async () => {
    if (!profile?.id) return

    setLoading(true)
    try {
      const response = await getUserSubmissions(profile.id)

      if (response.success) {
        const items = response.data.items || []
        setSubmissions(items)
        setFilteredSubmissions(items)
      } else {
        messageApi.error(response.message || 'Không thể tải danh sách bài nộp')
      }
    } catch (error: any) {
      console.error('Error fetching my submissions:', error)
      const errorMessage = error?.response?.data?.message || 'Lỗi khi tải danh sách bài nộp'
      messageApi.error(errorMessage)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }, [profile?.id, messageApi])

  useEffect(() => {
    fetchMySubmissions()
  }, [fetchMySubmissions])

  const handleViewDetail = async (record: UserSubmission) => {
    setDetailModalVisible(true)
    setSelectedSubmission(record)
  }

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedSubmission(null)
  }

  const handleSearch = (values: any) => {
    let filtered = [...submissions]

    if (values.examCode) {
      filtered = filtered.filter((s) => s.examCode.toLowerCase().includes(values.examCode.toLowerCase()))
    }

    if (values.subjectCode) {
      filtered = filtered.filter((s) => s.subjectIdCode.toLowerCase().includes(values.subjectCode.toLowerCase()))
    }

    if (values.submissionName) {
      filtered = filtered.filter((s) => s.submissionName?.toLowerCase().includes(values.submissionName.toLowerCase()))
    }

    if (values.status !== undefined && values.status !== null) {
      filtered = filtered.filter((s) => s.status === values.status)
    }

    if (values.assessmentStatus !== undefined && values.assessmentStatus !== null) {
      filtered = filtered.filter((s) => s.assessmentStatus === values.assessmentStatus)
    }

    setFilteredSubmissions(filtered)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    setFilteredSubmissions(submissions)
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case SubmissionStatus.Processing:
        return 'processing'
      case SubmissionStatus.Validated:
        return 'success'
      case SubmissionStatus.Violated:
        return 'error'
      case SubmissionStatus.Complained:
        return 'warning'
      case SubmissionStatus.ModeratorValidated:
        return 'success'
      case SubmissionStatus.ModeratorViolated:
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case SubmissionStatus.Processing:
        return 'Đang xử lý'
      case SubmissionStatus.Validated:
        return 'Đã xác thực'
      case SubmissionStatus.Violated:
        return 'Vi phạm'
      case SubmissionStatus.Complained:
        return 'Đã khiếu nại'
      case SubmissionStatus.ModeratorValidated:
        return 'Moderator xác thực'
      case SubmissionStatus.ModeratorViolated:
        return 'Moderator từ chối'
      default:
        return `Trạng thái ${status}`
    }
  }

  const columns = [
    {
      title: 'Mã bài thi',
      dataIndex: 'examCode',
      key: 'examCode'
    },
    {
      title: 'Mã môn học',
      dataIndex: 'subjectIdCode',
      key: 'subjectIdCode'
    },
    {
      title: 'Tên bài nộp',
      dataIndex: 'submissionName',
      key: 'submissionName',
      render: (name: string) => name || '-'
    },
    {
      title: 'Trạng thái bài nộp',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
    },
    {
      title: 'Trạng thái chấm bài',
      key: 'assessmentStatus',
      render: (_: any, record: UserSubmission) => (
        <Tag
          color={
            record.assessmentStatus === AssessmentStatus.Pending
              ? 'default'
              : record.assessmentStatus === AssessmentStatus.InReview
                ? 'processing'
                : record.assessmentStatus === AssessmentStatus.Complete
                  ? 'success'
                  : 'error'
          }
        >
          {record.assessmentStatus === AssessmentStatus.Pending
            ? 'Chưa chấm'
            : record.assessmentStatus === AssessmentStatus.InReview
              ? 'Đang chấm'
              : record.assessmentStatus === AssessmentStatus.Complete
                ? 'Đã chấm'
                : 'Đã hủy'}
        </Tag>
      )
    },
    {
      title: 'Ngày phân công',
      dataIndex: 'assignAt',
      key: 'assignAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'File bài nộp',
      key: 'fileDownload',
      render: (_: any, record: UserSubmission) => (
        <Space size='middle'>
          {record.fileUrl && (
            <Button size='small' type='link' href={record.fileUrl} target='_blank' rel='noopener noreferrer'>
              Tải xuống
            </Button>
          )}
        </Space>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: UserSubmission) => (
        <Space size='middle'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          {isExaminer && record.assessmentId && (
            <Button
              size='small'
              type='primary'
              icon={<EditOutlined />}
              onClick={() => navigate(`/grading/${record.assessmentId}`)}
            >
              Chấm điểm
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      {messageContextHolder}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <Title level={2}>Các bài cần chấm điểm</Title>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout='vertical' onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Mã kỳ thi' name='examCode'>
                <Input placeholder='Tìm kiếm theo mã kỳ thi...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Mã môn học' name='subjectCode'>
                <Input placeholder='Tìm kiếm theo mã môn học...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Tên bài nộp' name='submissionName'>
                <Input placeholder='Tìm kiếm theo tên bài nộp...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Trạng thái bài nộp' name='status'>
                <Select
                  placeholder='Chọn trạng thái'
                  allowClear
                  options={[
                    { label: 'Đang xử lý', value: SubmissionStatus.Processing },
                    { label: 'Đã xác thực', value: SubmissionStatus.Validated },
                    { label: 'Vi phạm', value: SubmissionStatus.Violated },
                    { label: 'Đã khiếu nại', value: SubmissionStatus.Complained },
                    { label: 'Moderator xác thực', value: SubmissionStatus.ModeratorValidated },
                    { label: 'Moderator từ chối', value: SubmissionStatus.ModeratorViolated }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Trạng thái chấm bài' name='assessmentStatus'>
                <Select
                  placeholder='Chọn trạng thái chấm bài'
                  allowClear
                  options={[
                    { label: 'Chưa chấm', value: AssessmentStatus.Pending },
                    { label: 'Đang chấm', value: AssessmentStatus.InReview },
                    { label: 'Đã chấm', value: AssessmentStatus.Complete },
                    { label: 'Đã hủy', value: AssessmentStatus.Cancelled }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={18}>
              <Form.Item label=' '>
                <Space>
                  <Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
                    Tìm kiếm
                  </Button>
                  <Button onClick={handleResetSearch}>Đặt lại</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card loading={loading}>
        <Table
          columns={columns}
          dataSource={Array.isArray(filteredSubmissions) ? filteredSubmissions.map((s) => ({ ...s, key: s.id })) : []}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#1890ff' }}>
            <EyeOutlined style={{ marginRight: 8 }} />
            Chi tiết bài nộp
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          isExaminer && selectedSubmission?.assessmentId && (
            <Button
              key='grade'
              type='primary'
              icon={<EditOutlined />}
              onClick={() => {
                handleCloseDetailModal()
                navigate(`/grading/${selectedSubmission.assessmentId}`)
              }}
            >
              Chấm điểm
            </Button>
          ),
          <Button key='close' onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={900}
      >
        {selectedSubmission ? (
          <>
            <Card
              title={<span style={{ fontSize: '15px', fontWeight: 500 }}>Thông tin bài nộp</span>}
              style={{ marginBottom: 16 }}
              size='small'
            >
              <Descriptions bordered column={2} size='small'>
                <Descriptions.Item label='Mã bài thi' span={1}>
                  <Typography.Text strong>{selectedSubmission.examCode}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Mã môn học' span={1}>
                  <Typography.Text strong>{selectedSubmission.subjectIdCode}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Tên bài nộp' span={2}>
                  <Typography.Text strong>{selectedSubmission.submissionName || '-'}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái bài nộp' span={1}>
                  <Tag color={getStatusColor(selectedSubmission.status)}>
                    {getStatusText(selectedSubmission.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Ngày phân công' span={1}>
                  {new Date(selectedSubmission.assignAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label='File bài nộp' span={2}>
                  {selectedSubmission.fileUrl ? (
                    <Button type='link' href={selectedSubmission.fileUrl} target='_blank' rel='noopener noreferrer'>
                      Tải xuống file
                    </Button>
                  ) : (
                    <Typography.Text type='secondary'>Không có file</Typography.Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedSubmission.assessmentId && (
              <Card title={<span style={{ fontSize: '15px', fontWeight: 500 }}>Thông tin đánh giá</span>} size='small'>
                <Descriptions bordered column={2} size='small'>
                  <Descriptions.Item label='Trạng thái chấm bài' span={1}>
                    <Tag
                      color={
                        selectedSubmission.assessmentStatus === AssessmentStatus.Pending
                          ? 'default'
                          : selectedSubmission.assessmentStatus === AssessmentStatus.InReview
                            ? 'processing'
                            : selectedSubmission.assessmentStatus === AssessmentStatus.Complete
                              ? 'success'
                              : 'error'
                      }
                    >
                      {selectedSubmission.assessmentStatus === AssessmentStatus.Pending
                        ? 'Chưa chấm'
                        : selectedSubmission.assessmentStatus === AssessmentStatus.InReview
                          ? 'Đang chấm'
                          : selectedSubmission.assessmentStatus === AssessmentStatus.Complete
                            ? 'Đã chấm'
                            : 'Đã hủy'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Điểm số' span={1}>
                    {selectedSubmission.myScore !== null ? (
                      <Typography.Text
                        strong
                        style={{ fontSize: '16px', color: selectedSubmission.myScore === 0 ? '#ff4d4f' : '#52c41a' }}
                      >
                        {selectedSubmission.myScore}
                      </Typography.Text>
                    ) : (
                      <Typography.Text type='secondary'>Chưa chấm</Typography.Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </>
        ) : null}
      </Modal>
    </div>
  )
}

export default MySubmissionsPage
