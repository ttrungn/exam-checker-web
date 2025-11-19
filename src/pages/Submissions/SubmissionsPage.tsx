import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

import React, { useCallback, useEffect, useState } from 'react'

import {
  AutoComplete,
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
  Typography,
  Upload
} from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'

import { getExamSubjects, importScoreStructure } from '../../apis/examSubjects'
import {
  approveAssessment,
  assignSubmission,
  createSubmission,
  getSubmissionById,
  getSubmissions,
  type GetSubmissionsParams,
  type Submission
} from '../../apis/submissions'
import { getExaminers, type UserAccount } from '../../apis/users'
import type { ExamSubject } from '../../types/examSubject.dto'
import { AssessmentStatus, GradeStatus, SubmissionStatus } from '../../types/submission.dto'

const { Title } = Typography

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    total: 0
  })
  const [searchForm] = Form.useForm()
  const [searchParams, setSearchParams] = useState<GetSubmissionsParams>({})
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [uploadForm] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [examiners, setExaminers] = useState<UserAccount[]>([])
  const [examinerSearchLoading, setExaminerSearchLoading] = useState(false)
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([])
  const [examSubjectLoading, setExamSubjectLoading] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [assignForm] = Form.useForm()
  const [assigning, setAssigning] = useState(false)
  const [assignExaminers, setAssignExaminers] = useState<UserAccount[]>([])
  const [assignExaminerSearchLoading, setAssignExaminerSearchLoading] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)

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
    fetchSubmissions(1, 10, {})
  }, [fetchSubmissions])

  const handleTableChange = (page: number, pageSize: number) => {
    fetchSubmissions(page, pageSize, searchParams)
  }

  const handleSearch = (values: any) => {
    const params: GetSubmissionsParams = {}

    if (values.examCode) params.examCode = values.examCode
    if (values.subjectCode) params.subjectCode = values.subjectCode
    if (values.status !== undefined && values.status !== null) params.status = values.status
    if (values.examinerName) params.examinerName = values.examinerName
    if (values.moderatorName) params.moderatorName = values.moderatorName
    if (values.submissionName) params.submissionName = values.submissionName
    if (values.gradeStatus !== undefined && values.gradeStatus !== null) params.gradeStatus = values.gradeStatus

    setSearchParams(params)
    fetchSubmissions(1, 10, params)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    setSearchParams({})
    fetchSubmissions(1, 10, {})
  }

  const handleViewDetail = async (record: Submission) => {
    setDetailLoading(true)
    setDetailModalVisible(true)
    try {
      // Fetch full submission details with assessments
      const response = await getSubmissionById(record.id)
      if (response.success) {
        setSelectedSubmission(response.data)
      } else {
        messageApi.error(response.message || 'Không thể tải chi tiết bài nộp')
        setSelectedSubmission(record) // Fallback to record from list
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi tải chi tiết bài nộp'
      messageApi.error(errorMessage)
      setSelectedSubmission(record) // Fallback to record from list
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedSubmission(null)
  }

  const handleOpenUploadModal = async () => {
    uploadForm.resetFields()
    setFileList([])
    setUploadModalVisible(true)
    // Load initial examiners list
    await handleSearchExaminers('')
    // Load exam subjects list
    await loadExamSubjects()
  }

  const handleCloseUploadModal = () => {
    setUploadModalVisible(false)
    uploadForm.resetFields()
    setFileList([])
    setExaminers([])
  }

  const handleSearchExaminers = async (searchValue: string) => {
    setExaminerSearchLoading(true)
    try {
      const response = await getExaminers(searchValue)
      if (response.success) {
        setExaminers(response.data.items)
      }
    } catch (error) {
      console.error('Error fetching examiners:', error)
    } finally {
      setExaminerSearchLoading(false)
    }
  }

  const handleUploadSubmit = async (values: any) => {
    if (fileList.length === 0) {
      messageApi.error('Vui lòng chọn file nén (.zip hoặc .rar) để upload')
      return
    }

    // Tìm examiner ID từ email được chọn
    const selectedExaminer = examiners.find((e) => e.email === values.examinerId)
    if (!selectedExaminer) {
      messageApi.error('Không tìm thấy examiner. Vui lòng chọn lại!')
      return
    }

    setUploading(true)
    try {
      // Upload archive file và tạo submission
      const file = fileList[0].originFileObj as File
      await createSubmission({
        examinerId: selectedExaminer.id,
        examSubjectId: values.examSubjectId,
        archiveFile: file
      })

      messageApi.success('Upload file và phân công examiner thành công!')

      handleCloseUploadModal()
      fetchSubmissions(1, 10, searchParams)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi upload file. Vui lòng thử lại!'
      messageApi.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList]
    // Chỉ giữ file mới nhất
    newFileList = newFileList.slice(-1)
    setFileList(newFileList)
  }

  const loadExamSubjects = async () => {
    setExamSubjectLoading(true)
    try {
      const res = await getExamSubjects({ pageIndex: 1, pageSize: 200 })
      if (res.success) {
        setExamSubjects(res.data)
      }
    } catch {
      // silent
    } finally {
      setExamSubjectLoading(false)
    }
  }

  const handleOpenAssignModal = async () => {
    assignForm.resetFields()
    setAssignExaminers([])
    setAssignModalVisible(true)
    // Load initial examiners list
    await handleSearchAssignExaminers('')
  }

  const handleCloseAssignModal = () => {
    setAssignModalVisible(false)
    assignForm.resetFields()
    setAssignExaminers([])
  }

  const handleSearchAssignExaminers = async (searchValue: string) => {
    setAssignExaminerSearchLoading(true)
    try {
      const response = await getExaminers(searchValue)
      if (response.success) {
        setAssignExaminers(response.data.items)
      }
    } catch (error) {
      console.error('Error fetching examiners:', error)
    } finally {
      setAssignExaminerSearchLoading(false)
    }
  }

  const handleAssignSubmit = async (values: any) => {
    if (!selectedSubmission) {
      messageApi.error('Không tìm thấy bài nộp được chọn')
      return
    }

    // Tìm examiner ID từ email được chọn
    const selectedExaminer = assignExaminers.find((e) => e.email === values.examinerId)
    if (!selectedExaminer) {
      messageApi.error('Không tìm thấy examiner. Vui lòng chọn lại!')
      return
    }

    setAssigning(true)
    try {
      await assignSubmission({
        submissionId: selectedSubmission.id,
        examinerId: selectedExaminer.id
      })

      messageApi.success('Phân công examiner thành công!')
      handleCloseAssignModal()
      handleCloseDetailModal()
      fetchSubmissions(pagination.pageIndex, pagination.pageSize, searchParams)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi phân công examiner. Vui lòng thử lại!'
      messageApi.error(errorMessage)
    } finally {
      setAssigning(false)
    }
  }

  const handleApproveAssessment = async (assessmentId: string) => {
    if (!selectedSubmission) {
      messageApi.error('Không tìm thấy bài nộp được chọn')
      return
    }

    setApproving(assessmentId)
    try {
      await approveAssessment({
        submissionId: selectedSubmission.id,
        assessmentId: assessmentId
      })

      messageApi.success('Duyệt bài chấm thành công!')
      handleCloseDetailModal()
      fetchSubmissions(pagination.pageIndex, pagination.pageSize, searchParams)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi duyệt bài chấm. Vui lòng thử lại!'
      messageApi.error(errorMessage)
    } finally {
      setApproving(null)
    }
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

  const getGradeStatusColor = (status: number) => {
    switch (status) {
      case GradeStatus.NotGraded:
        return 'default'
      case GradeStatus.Graded:
        return 'success'
      case GradeStatus.ReAssigned:
        return 'warning'
      case GradeStatus.Approved:
        return 'blue'
      default:
        return 'default'
    }
  }

  const getGradeStatusText = (status: number) => {
    switch (status) {
      case GradeStatus.NotGraded:
        return 'Chưa chấm'
      case GradeStatus.Graded:
        return 'Đã chấm xong'
      case GradeStatus.ReAssigned:
        return 'Được phân công chấm lại'
      case GradeStatus.Approved:
        return 'Đã duyệt điểm'
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
      title: 'Trạng thái bài nộp',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
    },
    {
      title: 'Trạng thái chấm bài',
      key: 'gradeStatus',
      dataIndex: 'gradeStatus',
      render: (gradeStatus: number) => (
        <Tag color={getGradeStatusColor(gradeStatus)}>{getGradeStatusText(gradeStatus)}</Tag>
      )
    },
    // {
    //   title: 'Ngày phân công',
    //   dataIndex: 'assignAt',
    //   key: 'assignAt',
    //   render: (date: string) => new Date(date).toLocaleString('vi-VN')
    // },
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
        <Space size='middle'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
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
        <Title level={2}>Quản lý bài nộp</Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenUploadModal}>
          Upload & Phân công
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout='vertical' onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Mã kỳ thi' name='examCode'>
                <Input placeholder='Tìm kiếm theo mã kỳ thi...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Mã môn học' name='subjectCode'>
                <Input placeholder='Tìm kiếm theo mã môn học...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Tên bài nộp' name='submissionName'>
                <Input placeholder='Tìm kiếm theo tên bài nộp...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Trạng thái chấm bài' name='gradeStatus'>
                <Select
                  placeholder='Chọn trạng thái chấm bài'
                  allowClear
                  options={[
                    { label: 'Chưa chấm', value: GradeStatus.NotGraded },
                    { label: 'Đã chấm xong', value: GradeStatus.Graded },
                    { label: 'Được phân công chấm lại', value: GradeStatus.ReAssigned },
                    { label: 'Đã duyệt điểm', value: GradeStatus.Approved }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
          <Button key='assign' type='primary' onClick={handleOpenAssignModal}>
            Chọn người chấm khác
          </Button>,
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
              <Descriptions bordered column={3} size='small'>
                <Descriptions.Item label='Mã kỳ thi' span={1}>
                  <Typography.Text strong>{selectedSubmission.examCode}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Mã môn học' span={1}>
                  <Typography.Text strong>{selectedSubmission.subjectIdCode}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Moderator' span={1}>
                  {selectedSubmission.moderatorEmail || <Tag color='default'>Chưa tham gia</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label='Tên bài nộp' span={1}>
                  <Typography.Text strong>
                    {selectedSubmission.assessments && selectedSubmission.assessments.length > 0
                      ? selectedSubmission.assessments[0].submissionName
                      : '-'}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái bài nộp' span={1}>
                  <Tag color={getStatusColor(selectedSubmission.status)}>
                    {getStatusText(selectedSubmission.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái chấm bài' span={1}>
                  <Tag color={getGradeStatusColor(selectedSubmission.gradeStatus)}>
                    {getGradeStatusText(selectedSubmission.gradeStatus)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label='Ngày phân công' span={2}>
                  {new Date(selectedSubmission.assignAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label='File bài nộp' span={1}>
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
                    <Descriptions bordered column={3} size='small'>
                      <Descriptions.Item label='Examiner chấm' span={3}>
                        {assessment.examinerEmail || <Tag color='default'>Chưa phân</Tag>}
                      </Descriptions.Item>
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
                      <Descriptions.Item label='Ngày chấm' span={1}>
                        {assessment.gradedAt ? (
                          new Date(assessment.gradedAt).toLocaleString('vi-VN')
                        ) : (
                          <Typography.Text type='secondary'>Chưa chấm</Typography.Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label='Thao tác' span={3}>
                        <Button
                          type='primary'
                          size='small'
                          disabled={assessment.status !== AssessmentStatus.Complete}
                          loading={approving === assessment.id}
                          onClick={() => handleApproveAssessment(assessment.id)}
                        >
                          Chọn bài chấm này
                        </Button>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ))}
              </Card>
            )}
          </>
        ) : null}
      </Modal>

      <Modal
        title='Upload File & Phân công Examiner'
        open={uploadModalVisible}
        onCancel={handleCloseUploadModal}
        footer={null}
        width={600}
      >
        <Form form={uploadForm} layout='vertical' onFinish={handleUploadSubmit}>
          <Form.Item
            label='Exam Subject'
            name='examSubjectId'
            rules={[{ required: true, message: 'Vui lòng chọn Exam Subject' }]}
          >
            <Select
              placeholder='Chọn Exam-Subject (ExamCode - SubjectCode)'
              loading={examSubjectLoading}
              showSearch
              optionFilterProp='label'
              options={examSubjects.map((es) => ({
                label: `${es.examCode} - ${es.subjectCode}`,
                value: es.id
              }))}
              notFoundContent={examSubjectLoading ? 'Đang tải...' : 'Không có dữ liệu'}
            />
          </Form.Item>

          <Form.Item label='Examiner' name='examinerId' rules={[{ required: true, message: 'Vui lòng chọn Examiner' }]}>
            <AutoComplete
              placeholder='Tìm kiếm examiner theo email...'
              onSearch={handleSearchExaminers}
              notFoundContent={examinerSearchLoading ? 'Đang tải...' : 'Không tìm thấy'}
              options={examiners.map((examiner) => ({
                value: examiner.email,
                label: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{examiner.displayName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{examiner.email}</div>
                  </div>
                )
              }))}
              filterOption={false}
            />
          </Form.Item>

          <Form.Item label='File nén (ZIP/RAR)' required>
            <Upload
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              accept='.zip,.rar'
              maxCount={1}
            >
              <Button icon={<PlusOutlined />}>Chọn file nén</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseUploadModal}>Hủy</Button>
              <Button type='primary' htmlType='submit' loading={uploading}>
                Upload
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title='Chọn người chấm khác'
        open={assignModalVisible}
        onCancel={handleCloseAssignModal}
        footer={null}
        width={500}
      >
        <Form form={assignForm} layout='vertical' onFinish={handleAssignSubmit}>
          <Form.Item
            label='Examiner mới'
            name='examinerId'
            rules={[{ required: true, message: 'Vui lòng chọn Examiner' }]}
          >
            <AutoComplete
              placeholder='Tìm kiếm examiner theo email...'
              onSearch={handleSearchAssignExaminers}
              notFoundContent={assignExaminerSearchLoading ? 'Đang tải...' : 'Không tìm thấy'}
              options={assignExaminers.map((examiner) => ({
                value: examiner.email,
                label: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{examiner.displayName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{examiner.email}</div>
                  </div>
                )
              }))}
              filterOption={false}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseAssignModal}>Hủy</Button>
              <Button type='primary' htmlType='submit' loading={assigning}>
                Phân công
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SubmissionsPage
