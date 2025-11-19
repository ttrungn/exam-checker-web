import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import React, { useCallback, useState } from 'react'

import {
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
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

import api from '../../apis/apiClient'
import { createExam, deleteExam, getExamById, getExams, updateExam } from '../../apis/exams'
import { getExamSubjects } from '../../apis/examSubjects'
import { exportAssessments } from '../../apis/submissions'
import type { PaginationResponse } from '../../types/api.dto'
import type { Exam, ExamDetail } from '../../types/exam.dto'
import type { ExamSubject } from '../../types/examSubject.dto'
import type { Semester } from '../../types/semester.dto'

const { Title } = Typography
const { RangePicker } = DatePicker

const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 8,
    total: 0
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedExam, setSelectedExam] = useState<ExamDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [searchCode, setSearchCode] = useState('')
  const [searchStatus, setSearchStatus] = useState<boolean | null>(true)
  const [isExportModalVisible, setIsExportModalVisible] = useState(false)
  const [exportForm] = Form.useForm()
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([])
  const [loadingExamSubjects, setLoadingExamSubjects] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [selectedExamForExport, setSelectedExamForExport] = useState<Exam | null>(null)

  const [messageApi, messageContextHolder] = message.useMessage()
  const [modal, contextHolder] = Modal.useModal()

  const fetchSemesters = useCallback(async () => {
    try {
      const response = await api.get<PaginationResponse<Semester>>('/api/v1/semesters', {
        params: { pageIndex: 1, pageSize: 100, isActive: true }
      })
      if (response.data.success) {
        setSemesters(response.data.data)
      }
    } catch {
      messageApi.error('Lỗi khi tải danh sách học kỳ')
    }
  }, [messageApi])

  const fetchExams = useCallback(
    async (pageIndex = 1, pageSize = 8, code = '', status: boolean | null = null) => {
      setLoading(true)
      try {
        const params: any = {
          pageIndex: pageIndex,
          pageSize: pageSize
        }

        if (code) params.code = code
        if (status !== null) params.isActive = status

        const response = await getExams(params)

        if (response.success) {
          setExams(response.data)
          setPagination({
            pageIndex: response.pageIndex,
            pageSize: response.pageSize,
            total: response.totalCount
          })
        } else {
          messageApi.error(response.message || 'Không thể tải danh sách kỳ thi')
        }
      } catch {
        messageApi.error('Lỗi khi tải danh sách kỳ thi')
      } finally {
        setLoading(false)
      }
    },
    [messageApi]
  )

  React.useEffect(() => {
    fetchSemesters()
    fetchExams(1, 8, '', true)
  }, [fetchSemesters, fetchExams])

  const handleTableChange = (page: number, pageSize: number) => {
    fetchExams(page, pageSize, searchCode, searchStatus)
  }

  const handleSearch = (values: any) => {
    const code = values.code || ''
    const status = values.isActive ?? null
    setSearchCode(code)
    setSearchStatus(status)
    fetchExams(1, 8, code, status)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    setSearchCode('')
    setSearchStatus(true)
    fetchExams(1, 8, '', true)
  }

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true)
    setIsDetailModalVisible(true)
    try {
      const response = await getExamById(id)
      if (response.success) {
        setSelectedExam(response.data)
      } else {
        messageApi.error(response.message || 'Không thể tải thông tin kỳ thi')
      }
    } catch {
      messageApi.error('Lỗi khi tải thông tin kỳ thi')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleEdit = useCallback(
    async (exam: Exam) => {
      setIsEdit(true)
      setEditingId(exam.id)

      // Fetch chi tiết để có đầy đủ thông tin
      try {
        const response = await getExamById(exam.id)
        if (response.success) {
          const detail = response.data
          form.setFieldsValue({
            semesterId: detail.semester.id,
            code: detail.code,
            dateRange: [dayjs(detail.startDate), dayjs(detail.endDate)]
          })
          setIsModalVisible(true)
        } else {
          messageApi.error(response.message || 'Không thể tải thông tin kỳ thi')
        }
      } catch {
        messageApi.error('Lỗi khi tải thông tin kỳ thi')
      }
    },
    [form, messageApi]
  )

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Xóa Kỳ Thi',
      content: 'Bạn có chắc muốn xóa kỳ thi này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteExam(id)
          messageApi.success({
            content: 'Xóa kỳ thi thành công!',
            duration: 3
          })
          setSearchCode('')
          setSearchStatus(true)
          fetchExams(1, 8, '', true)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa kỳ thi. Vui lòng thử lại!'
          messageApi.error({
            content: errorMessage,
            duration: 4
          })
        }
      }
    })
  }

  const handleOpenModal = () => {
    setIsEdit(false)
    setEditingId(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleModalSubmit = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange
      const payload = {
        semesterId: values.semesterId,
        code: values.code,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }

      if (isEdit && editingId) {
        await updateExam(editingId, payload)
        messageApi.success({
          content: 'Cập nhật kỳ thi thành công!',
          duration: 3
        })
      } else {
        await createExam(payload)
        messageApi.success({
          content: 'Tạo kỳ thi mới thành công!',
          duration: 3
        })
      }
      setIsModalVisible(false)
      form.resetFields()
      setSearchCode('')
      setSearchStatus(true)
      fetchExams(1, 8, '', true)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        (isEdit ? 'Không thể cập nhật kỳ thi. Vui lòng thử lại!' : 'Không thể tạo kỳ thi. Vui lòng thử lại!')
      messageApi.error({
        content: errorMessage,
        duration: 4
      })
    }
  }

  const handleOpenExportModal = () => {
    exportForm.resetFields()
    setExamSubjects([])
    setFilteredExams(exams)
    setSelectedExamForExport(null)
    setIsExportModalVisible(true)
  }

  const handleSearchExams = (searchValue: string) => {
    if (!searchValue) {
      setFilteredExams(exams)
      return
    }
    const filtered = exams.filter((exam) => exam.code.toLowerCase().includes(searchValue.toLowerCase()))
    setFilteredExams(filtered)
  }

  const handleSelectExam = async (examCode: string) => {
    const selectedExam = exams.find((e) => e.code === examCode)
    if (!selectedExam) return

    setSelectedExamForExport(selectedExam)
    setLoadingExamSubjects(true)
    try {
      const response = await getExamSubjects({
        examCode: selectedExam.code,
        isActive: true
      })
      if (response.success) {
        setExamSubjects(response.data)
        exportForm.setFieldsValue({ examSubjectId: undefined })
      }
    } catch (error: any) {
      console.error('Error loading exam subjects:', error)
      messageApi.error('Không thể tải danh sách môn thi')
      setExamSubjects([])
    } finally {
      setLoadingExamSubjects(false)
    }
  }

  const handleExportSubmit = async (values: any) => {
    if (!selectedExamForExport) {
      messageApi.error('Vui lòng chọn kỳ thi')
      return
    }

    const selectedExamSubject = examSubjects.find((s) => s.id === values.examSubjectId)
    if (!selectedExamSubject) {
      messageApi.error('Vui lòng chọn môn thi')
      return
    }

    setExportLoading(true)
    try {
      // Truyền examId và subjectId từ examSubject
      const blob = await exportAssessments(selectedExamSubject.examId, selectedExamSubject.subjectId)

      const fileName = `Diem_${selectedExamForExport.code}_${selectedExamSubject.subjectCode}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      messageApi.success('Export điểm thành công!')
      setIsExportModalVisible(false)
      exportForm.resetFields()
      setSelectedExamForExport(null)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể export điểm. Vui lòng thử lại!'
      messageApi.error(errorMessage)
    } finally {
      setExportLoading(false)
    }
  }

  const columns = [
    {
      title: 'Mã Kỳ Thi',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: 'Ngày Bắt Đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Ngày Kết Thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? <Tag color='green'>Hoạt Động</Tag> : <Tag color='red'>Không Hoạt Động</Tag>
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Ngày Cập Nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_: any, record: Exam) => (
        <Space size='middle'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} />
          <Button size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size='small' icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ]

  return (
    <div>
      {contextHolder}
      {messageContextHolder}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <Title level={2}>Quản Lý Kỳ Thi</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleOpenExportModal}>
            Export Điểm
          </Button>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenModal}>
            Thêm Kỳ Thi Mới
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout='vertical' onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Mã Kỳ Thi' name='code'>
                <Input placeholder='Tìm kiếm theo mã...' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Trạng Thái' name='isActive'>
                <Select
                  placeholder='Chọn trạng thái'
                  allowClear
                  options={[
                    { label: 'Hoạt Động', value: true },
                    { label: 'Không Hoạt Động', value: false }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label=' ' style={{ marginBottom: 0 }}>
                <Space>
                  <Button type='primary' htmlType='submit'>
                    Tìm Kiếm
                  </Button>
                  <Button onClick={handleResetSearch}>Đặt Lại</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card loading={loading}>
        <Table
          columns={columns}
          dataSource={exams.map((e) => ({ ...e, key: e.id }))}
          pagination={{
            total: pagination.total,
            pageSize: pagination.pageSize,
            current: pagination.pageIndex,
            showSizeChanger: false,
            showQuickJumper: false,
            pageSizeOptions: ['8', '20', '50']
          }}
          onChange={(pag) => handleTableChange(pag.current || 1, pag.pageSize || 8)}
        />
      </Card>

      <Modal
        title={isEdit ? 'Sửa Kỳ Thi' : 'Thêm Kỳ Thi Mới'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} layout='vertical' onFinish={handleModalSubmit}>
          <Form.Item label='Học Kỳ' name='semesterId' rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}>
            <Select
              placeholder='Chọn học kỳ'
              options={semesters.map((semester) => ({
                label: semester.name,
                value: semester.id
              }))}
            />
          </Form.Item>

          <Form.Item label='Mã Kỳ Thi' name='code' rules={[{ required: true, message: 'Vui lòng nhập mã kỳ thi' }]}>
            <Input placeholder='VD: SPRING25' />
          </Form.Item>

          <Form.Item
            label='Thời Gian Thi'
            name='dateRange'
            rules={[{ required: true, message: 'Vui lòng chọn thời gian thi' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format='DD/MM/YYYY'
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              separator='→'
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleModalCancel}>Hủy</Button>
              <Button type='primary' htmlType='submit'>
                {isEdit ? 'Cập Nhật' : 'Tạo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title='Chi Tiết Kỳ Thi'
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
        ) : selectedExam ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label='Mã Kỳ Thi'>{selectedExam.code}</Descriptions.Item>
            <Descriptions.Item label='Học Kỳ'>{selectedExam.semester.name}</Descriptions.Item>
            <Descriptions.Item label='Ngày Bắt Đầu'>
              {new Date(selectedExam.startDate).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='Ngày Kết Thúc'>
              {new Date(selectedExam.endDate).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='Trạng Thái'>
              {selectedExam.isActive ? <Tag color='green'>Hoạt Động</Tag> : <Tag color='red'>Không Hoạt Động</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label='Ngày Tạo'>
              {new Date(selectedExam.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='Ngày Cập Nhật'>
              {new Date(selectedExam.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='Trạng Thái Học Kỳ'>
              {selectedExam.semester.isActive ? (
                <Tag color='green'>Hoạt Động</Tag>
              ) : (
                <Tag color='red'>Không Hoạt Động</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title='Export Điểm'
        open={isExportModalVisible}
        onCancel={() => {
          setIsExportModalVisible(false)
          exportForm.resetFields()
          setSelectedExamForExport(null)
        }}
        footer={null}
      >
        <Form form={exportForm} layout='vertical' onFinish={handleExportSubmit}>
          <Form.Item label='Kỳ Thi' name='examCode' rules={[{ required: true, message: 'Vui lòng chọn kỳ thi' }]}>
            <AutoComplete
              placeholder='Tìm kiếm kỳ thi theo mã...'
              onSearch={handleSearchExams}
              onSelect={handleSelectExam}
              notFoundContent='Không tìm thấy'
              options={filteredExams.map((exam) => ({
                value: exam.code,
                label: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{exam.code}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(exam.startDate).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(exam.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                )
              }))}
              filterOption={false}
            />
          </Form.Item>

          <Form.Item
            label='Môn Thi'
            name='examSubjectId'
            rules={[{ required: true, message: 'Vui lòng chọn môn thi' }]}
          >
            <Select
              placeholder='Chọn môn thi'
              loading={loadingExamSubjects}
              disabled={examSubjects.length === 0}
              options={examSubjects.map((subject) => ({
                label: `${subject.subjectCode} (${new Date(subject.startDate).toLocaleDateString('vi-VN')} - ${new Date(subject.endDate).toLocaleDateString('vi-VN')})`,
                value: subject.id
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsExportModalVisible(false)
                  exportForm.resetFields()
                }}
              >
                Hủy
              </Button>
              <Button type='primary' htmlType='submit' loading={exportLoading} icon={<DownloadOutlined />}>
                Export
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ExamsPage
