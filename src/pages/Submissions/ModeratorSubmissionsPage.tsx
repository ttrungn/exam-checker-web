import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { useMsal } from '@azure/msal-react'

import React, { useCallback, useEffect, useState } from 'react'

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

import {
  getSubmissions,
  type GetSubmissionsParams,
  type Submission,
  updateSubmissionToModeratorValidated,
  updateSubmissionToModeratorViolated
} from '../../apis/submissions'
import { AssessmentStatus, SubmissionStatus } from '../../types/submission.dto'

const { Title } = Typography

const ModeratorSubmissionsPage: React.FC = () => {
  const { instance } = useMsal()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    total: 0
  })
  const [searchForm] = Form.useForm()
  const account = instance.getActiveAccount()
  const userPrincipalName = account?.username || ''
  const [searchParams, setSearchParams] = useState<GetSubmissionsParams>({
    status: SubmissionStatus.Violated,
    moderatorName: userPrincipalName
  })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [submissionToUpdate, setSubmissionToUpdate] = useState<Submission | null>(null)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [pendingAction, setPendingAction] = useState<'validated' | 'violated' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [messageApi, messageContextHolder] = message.useMessage()

  const fetchSubmissions = useCallback(
    async (pageIndex = 1, pageSize = 10, params: GetSubmissionsParams = {}) => {
      setLoading(true)
      try {
        const requestParams: GetSubmissionsParams = {
          pageIndex,
          pageSize,
          indexFrom: 1,
          ...params
        }

        const response = await getSubmissions(requestParams)

        if (response.success) {
          setSubmissions(response.data.items || [])
          setPagination({
            pageIndex: response.data.pageIndex,
            pageSize: response.data.pageSize,
            total: response.data.totalCount
          })
        } else {
          messageApi.error(response.message || 'Không thể tải danh sách bài nộp')
        }
      } catch (error: any) {
        console.error('Error fetching submissions:', error)
        const errorMessage = error?.response?.data?.message || 'Lỗi khi tải danh sách bài nộp'
        messageApi.error(errorMessage)
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    },
    [messageApi]
  )

  useEffect(() => {
    // Default to Violated status for moderator with current user as moderator
    fetchSubmissions(1, 10, { status: SubmissionStatus.Violated, moderatorName: userPrincipalName })
    searchForm.setFieldsValue({ status: SubmissionStatus.Violated, moderatorName: userPrincipalName })
  }, [fetchSubmissions, searchForm, userPrincipalName])

  const handleTableChange = (page: number, pageSize: number) => {
    fetchSubmissions(page, pageSize, searchParams)
  }

  const handleSearch = (values: any) => {
    const params: GetSubmissionsParams = {
      moderatorName: userPrincipalName // Always filter by current moderator
    }

    if (values.examCode) params.examCode = values.examCode
    if (values.subjectCode) params.subjectCode = values.subjectCode
    if (values.status !== undefined && values.status !== null) params.status = values.status
    if (values.examinerName) params.examinerName = values.examinerName
    if (values.submissionName) params.submissionName = values.submissionName
    if (values.assessmentStatus !== undefined && values.assessmentStatus !== null)
      params.assessmentStatus = values.assessmentStatus

    setSearchParams(params)
    fetchSubmissions(1, 10, params)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    // Reset to default Violated status for moderator with current user as moderator
    searchForm.setFieldsValue({ status: SubmissionStatus.Violated })
    setSearchParams({ status: SubmissionStatus.Violated, moderatorName: userPrincipalName })
    fetchSubmissions(1, 10, { status: SubmissionStatus.Violated, moderatorName: userPrincipalName })
  }

  const handleViewDetail = async (record: Submission) => {
    setDetailLoading(true)
    setDetailModalVisible(true)
    try {
      // Use the record directly as it already has assessments from the list API
      setSelectedSubmission(record)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi tải chi tiết bài nộp'
      messageApi.error(errorMessage)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedSubmission(null)
  }

  const handleOpenUpdateModal = (record: Submission) => {
    console.log('Opening update modal for:', record.id)
    setSubmissionToUpdate(record)
    setUpdateModalVisible(true)
  }

  const handleCloseUpdateModal = () => {
    setUpdateModalVisible(false)
    setSubmissionToUpdate(null)
  }

  const handleModeratorAction = (action: 'validated' | 'violated') => {
    console.log('handleModeratorAction called with:', action)
    if (!submissionToUpdate) {
      console.log('No submission to update')
      return
    }

    setPendingAction(action)
    setConfirmModalVisible(true)
  }

  const handleConfirmAction = async () => {
    if (!submissionToUpdate || !pendingAction) return

    setIsProcessing(true)
    const isValidated = pendingAction === 'validated'

    try {
      console.log('Calling API for:', pendingAction, submissionToUpdate.id)
      if (isValidated) {
        await updateSubmissionToModeratorValidated(submissionToUpdate.id)
        console.log('Validated successfully (204)')
        messageApi.success('Đã cập nhật trạng thái: Xác thực không vi phạm')
      } else {
        await updateSubmissionToModeratorViolated(submissionToUpdate.id)
        console.log('Violated successfully (204)')
        messageApi.success('Đã cập nhật trạng thái: Xác thực vi phạm')
      }
      setConfirmModalVisible(false)
      handleCloseUpdateModal()
      fetchSubmissions(pagination.pageIndex, pagination.pageSize, searchParams)
    } catch (error: any) {
      console.error('Error updating submission:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi khi cập nhật trạng thái'
      messageApi.error(errorMessage)
    } finally {
      setIsProcessing(false)
      setPendingAction(null)
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
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
      case SubmissionStatus.Violated:
        return 'Vi phạm'
      case SubmissionStatus.Complained:
        return 'Đã khiếu nại'
      case SubmissionStatus.ModeratorValidated:
        return 'Xác thực không vi phạm'
      case SubmissionStatus.ModeratorViolated:
        return 'Xác thực vi phạm'
      default:
        return `Trạng thái ${status}`
    }
  }

  const columns = [
    {
      title: 'Mã kỳ thi',
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
      key: 'submissionName',
      render: (_: any, record: Submission) => {
        if (record.assessments && record.assessments.length > 0) {
          return record.assessments[0].submissionName || '-'
        }
        return '-'
      }
    },
    {
      title: 'Examiner',
      dataIndex: 'examinerEmail',
      key: 'examinerEmail',
      render: (email: string | null) => email || <Tag color='default'>Chưa phân</Tag>
    },
    {
      title: 'Moderator',
      dataIndex: 'moderatorEmail',
      key: 'moderatorEmail',
      render: (email: string | null) => email || <Tag color='default'>Chưa phân</Tag>
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
      render: (_: any, record: Submission) => {
        if (!record.assessments || record.assessments.length === 0) {
          return <Tag color='default'>Chưa có</Tag>
        }
        const assessment = record.assessments[0]
        return (
          <Tag
            color={
              assessment.status === AssessmentStatus.Pending
                ? 'default'
                : assessment.status === AssessmentStatus.InReview
                  ? 'processing'
                  : assessment.status === AssessmentStatus.Complete
                    ? 'success'
                    : 'error'
            }
          >
            {assessment.status === AssessmentStatus.Pending
              ? 'Chưa chấm'
              : assessment.status === AssessmentStatus.InReview
                ? 'Đang chấm'
                : assessment.status === AssessmentStatus.Complete
                  ? 'Đã chấm'
                  : 'Đã hủy'}
          </Tag>
        )
      }
    },
    {
      title: 'File bài nộp',
      key: 'fileDownload',
      render: (_: any, record: Submission) => (
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
      render: (_: any, record: Submission) => (
        <Space size='small'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          <Button size='small' type='primary' onClick={() => handleOpenUpdateModal(record)}>
            Cập nhật
          </Button>
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
        <Title level={2}>Quản lý bài nộp (Moderator)</Title>
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
              <Form.Item label='Examiner' name='examinerName'>
                <Input placeholder='Tìm kiếm theo tên examiner...' allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Trạng thái bài nộp' name='status'>
                <Select
                  placeholder='Chọn trạng thái'
                  options={[
                    { label: 'Vi phạm', value: SubmissionStatus.Violated },
                    { label: 'Đã khiếu nại', value: SubmissionStatus.Complained },
                    { label: 'Xác thực không vi phạm', value: SubmissionStatus.ModeratorValidated },
                    { label: 'Xác thực vi phạm', value: SubmissionStatus.ModeratorViolated }
                  ]}
                />
              </Form.Item>
            </Col>
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
            <Col xs={24} sm={12} md={6}>
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
          dataSource={Array.isArray(submissions) ? submissions.map((s) => ({ ...s, key: s.id })) : []}
          pagination={{
            total: pagination.total,
            pageSize: pagination.pageSize,
            current: pagination.pageIndex,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={(pag) => handleTableChange(pag.current || 1, pag.pageSize || 10)}
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
          <Button key='close' onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={900}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Typography.Text type='secondary'>Đang tải...</Typography.Text>
          </div>
        ) : selectedSubmission ? (
          <>
            <Card
              title={<span style={{ fontSize: '15px', fontWeight: 500 }}>Thông tin bài nộp</span>}
              style={{ marginBottom: 16 }}
              size='small'
            >
              <Descriptions bordered column={2} size='small'>
                <Descriptions.Item label='Mã kỳ thi' span={1}>
                  <Typography.Text strong>{selectedSubmission.examCode}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Mã môn học' span={1}>
                  <Typography.Text strong>{selectedSubmission.subjectIdCode}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Tên bài nộp' span={2}>
                  <Typography.Text strong>
                    {selectedSubmission.assessments && selectedSubmission.assessments.length > 0
                      ? selectedSubmission.assessments[0].submissionName
                      : '-'}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Examiner' span={1}>
                  {selectedSubmission.examinerEmail || <Tag color='default'>Chưa phân</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label='Moderator' span={1}>
                  {selectedSubmission.moderatorEmail || <Tag color='default'>Chưa phân</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái bài nộp' span={1}>
                  <Tag color={getStatusColor(selectedSubmission.status)}>
                    {getStatusText(selectedSubmission.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái hoạt động' span={1}>
                  <Tag color={selectedSubmission.isActive ? 'green' : 'red'}>
                    {selectedSubmission.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Ngày phân công' span={2}>
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

            {selectedSubmission.assessments && selectedSubmission.assessments.length > 0 && (
              <Card title={<span style={{ fontSize: '15px', fontWeight: 500 }}>Thông tin đánh giá</span>} size='small'>
                {selectedSubmission.assessments.map((assessment, index) => (
                  <div
                    key={assessment.id}
                    style={{ marginBottom: index < selectedSubmission.assessments.length - 1 ? 16 : 0 }}
                  >
                    <Descriptions bordered column={2} size='small'>
                      <Descriptions.Item label='Trạng thái chấm bài' span={1}>
                        <Tag
                          color={
                            assessment.status === AssessmentStatus.Pending
                              ? 'default'
                              : assessment.status === AssessmentStatus.InReview
                                ? 'processing'
                                : assessment.status === AssessmentStatus.Complete
                                  ? 'success'
                                  : 'error'
                          }
                        >
                          {assessment.status === AssessmentStatus.Pending
                            ? 'Chưa chấm'
                            : assessment.status === AssessmentStatus.InReview
                              ? 'Đang chấm'
                              : assessment.status === AssessmentStatus.Complete
                                ? 'Đã chấm'
                                : 'Đã hủy'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label='Điểm số' span={1}>
                        {assessment.score !== null ? (
                          <Typography.Text
                            strong
                            style={{ fontSize: '16px', color: assessment.score === 0 ? '#ff4d4f' : '#52c41a' }}
                          >
                            {assessment.score}
                          </Typography.Text>
                        ) : (
                          <Typography.Text type='secondary'>Chưa chấm</Typography.Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label='Ngày chấm' span={2}>
                        {assessment.gradedAt ? (
                          new Date(assessment.gradedAt).toLocaleString('vi-VN')
                        ) : (
                          <Typography.Text type='secondary'>Chưa chấm</Typography.Text>
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ))}
              </Card>
            )}
          </>
        ) : null}
      </Modal>

      {/* Update Modal */}
      <Modal
        title='Cập nhật trạng thái bài nộp'
        open={updateModalVisible}
        onCancel={handleCloseUpdateModal}
        footer={null}
        width={500}
      >
        {submissionToUpdate && (
          <div>
            <Typography.Paragraph>
              <strong>Bài nộp:</strong> {submissionToUpdate.assessments?.[0]?.submissionName || submissionToUpdate.id}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Mã kỳ thi:</strong> {submissionToUpdate.examCode}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Mã môn học:</strong> {submissionToUpdate.subjectIdCode}
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginTop: 24, marginBottom: 16 }}>
              Chọn trạng thái cập nhật:
            </Typography.Paragraph>
            <Space direction='vertical' style={{ width: '100%' }} size='middle'>
              <Button
                type='primary'
                icon={<CheckOutlined />}
                size='large'
                block
                onClick={() => {
                  console.log('Button clicked: validated')
                  handleModeratorAction('validated')
                }}
              >
                Xác thực không vi phạm
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size='large'
                block
                onClick={() => {
                  console.log('Button clicked: violated')
                  handleModeratorAction('violated')
                }}
              >
                Xác thực vi phạm
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        title={pendingAction === 'validated' ? 'Xác nhận xác thực không vi phạm' : 'Xác nhận xác thực vi phạm'}
        open={confirmModalVisible}
        onOk={handleConfirmAction}
        onCancel={() => {
          setConfirmModalVisible(false)
          setPendingAction(null)
        }}
        confirmLoading={isProcessing}
        okText='Xác nhận'
        cancelText='Hủy'
        okType={pendingAction === 'validated' ? 'primary' : 'danger'}
      >
        {submissionToUpdate && (
          <Typography.Paragraph>
            {pendingAction === 'validated'
              ? `Bạn có chắc chắn muốn xác thực bài nộp "${submissionToUpdate.assessments?.[0]?.submissionName || submissionToUpdate.id}" là không vi phạm?`
              : `Bạn có chắc chắn muốn xác thực bài nộp "${submissionToUpdate.assessments?.[0]?.submissionName || submissionToUpdate.id}" là vi phạm?`}
          </Typography.Paragraph>
        )}
      </Modal>
    </div>
  )
}

export default ModeratorSubmissionsPage
