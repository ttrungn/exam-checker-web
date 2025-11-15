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

import {
  createSubmission,
  getSubmissionById,
  getSubmissions,
  type GetSubmissionsParams,
  type Submission
} from '../../apis/submissions'
import { getExaminers, type UserAccount } from '../../apis/users'

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
  const [selectedExaminerEmail, setSelectedExaminerEmail] = useState<string>('')

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
      const response = await getSubmissionById(record.id)
      if (response.success) {
        setSelectedSubmission(response.data)
      } else {
        messageApi.error(response.message || 'Không thể tải chi tiết bài nộp')
      }
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

  const handleOpenUploadModal = async () => {
    uploadForm.resetFields()
    setFileList([])
    setUploadModalVisible(true)
    // Load initial examiners list
    await handleSearchExaminers('')
  }

  const handleCloseUploadModal = () => {
    setUploadModalVisible(false)
    uploadForm.resetFields()
    setFileList([])
    setExaminers([])
    setSelectedExaminerEmail('')
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
      messageApi.error('Vui lòng chọn file ZIP để upload')
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
      const file = fileList[0].originFileObj as File
      await createSubmission({
        examinerId: selectedExaminer.id,
        examSubjectId: values.examSubjectId,
        zipFile: file
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

  const getStatusColor = (status: string | number) => {
    const statusStr = typeof status === 'number' ? status.toString() : status
    switch (statusStr) {
      case '0':
      case 'processing':
        return 'processing'
      case '1':
      case 'validated':
        return 'success'
      case '2':
      case 'violated':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string | number) => {
    const statusStr = typeof status === 'number' ? status.toString() : status
    switch (statusStr) {
      case '0':
      case 'processing':
        return 'Đang xử lý'
      case '1':
      case 'validated':
        return 'Hợp lệ'
      case '2':
      case 'violated':
        return 'Vi phạm'
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
    },
    {
      title: 'Ngày phân công',
      dataIndex: 'assignAt',
      key: 'assignAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'File bài nộp',
      key: 'actions',
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
              <Form.Item label='Examiner' name='examinerName'>
                <Input placeholder='Tìm kiếm theo tên examiner...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Moderator' name='moderatorName'>
                <Input placeholder='Tìm kiếm theo tên moderator...' allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Trạng thái' name='status'>
                <Select
                  placeholder='Chọn trạng thái'
                  allowClear
                  options={[
                    { label: 'Đang xử lý', value: 0 },
                    { label: 'Hợp lệ', value: 1 },
                    { label: 'Vi phạm', value: 2 }
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
        title='Chi tiết bài nộp'
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key='close' onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
        ) : selectedSubmission ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label='Mã kỳ thi'>{selectedSubmission.examCode}</Descriptions.Item>
            <Descriptions.Item label='Mã môn học'>{selectedSubmission.subjectIdCode}</Descriptions.Item>
            <Descriptions.Item label='Examiner'>
              {selectedSubmission.examinerEmail || <Tag color='default'>Chưa phân</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label='Moderator'>
              {selectedSubmission.moderatorEmail || <Tag color='default'>Chưa phân</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label='Trạng thái'>
              <Tag color={getStatusColor(selectedSubmission.status)}>{getStatusText(selectedSubmission.status)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label='Ngày phân công'>
              {new Date(selectedSubmission.assignAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='File bài nộp'>
              {selectedSubmission.fileUrl ? (
                <Button type='link' href={selectedSubmission.fileUrl} target='_blank' rel='noopener noreferrer'>
                  Tải xuống
                </Button>
              ) : (
                'Không có file'
              )}
            </Descriptions.Item>
            <Descriptions.Item label='Trạng thái hoạt động'>
              <Tag color={selectedSubmission.isActive ? 'green' : 'red'}>
                {selectedSubmission.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
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
            label='Exam Subject ID'
            name='examSubjectId'
            rules={[{ required: true, message: 'Vui lòng nhập Exam Subject ID' }]}
          >
            <Input placeholder='Nhập Exam Subject ID...' />
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

          <Form.Item label='File ZIP' required>
            <Upload
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              accept='.zip'
              maxCount={1}
            >
              <Button icon={<PlusOutlined />}>Chọn file ZIP</Button>
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
    </div>
  )
}

export default SubmissionsPage
