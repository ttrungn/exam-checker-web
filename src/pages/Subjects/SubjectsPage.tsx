import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'

import React, { useCallback, useState } from 'react'

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

import { getSemesters } from '../../apis/semesters'
import { createSubject, deleteSubject, getSubjectById, getSubjects, updateSubject } from '../../apis/subjects'
import type { Semester } from '../../types/semester.dto'
import type { Subject, SubjectDetail } from '../../types/subject.dto'

const { Title } = Typography

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 8,
    total: 0
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<SubjectDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [searchName, setSearchName] = useState('')
  const [searchCode, setSearchCode] = useState('')
  const [searchStatus, setSearchStatus] = useState<boolean | null>(true)

  const [messageApi, messageContextHolder] = message.useMessage()
  const [modal, contextHolder] = Modal.useModal()

  const fetchSemesters = useCallback(async () => {
    try {
      const response = await getSemesters({
        pageIndex: 1,
        pageSize: 100,
        isActive: true
      })
      if (response.success) {
        setSemesters(response.data)
      }
    } catch {
      messageApi.error('Lỗi khi tải danh sách học kỳ')
    }
  }, [messageApi])

  const fetchSubjects = useCallback(
    async (pageIndex = 1, pageSize = 8, name = '', code = '', status: boolean | null = null) => {
      setLoading(true)
      try {
        const params: any = {
          pageIndex: pageIndex,
          pageSize: pageSize
        }

        if (name) params.name = name
        if (code) params.code = code
        if (status !== null) params.isActive = status

        const response = await getSubjects(params)

        if (response.success) {
          setSubjects(response.data)
          setPagination({
            pageIndex: response.pageIndex,
            pageSize: response.pageSize,
            total: response.totalCount
          })
        } else {
          messageApi.error(response.message || 'Không thể tải danh sách môn học')
        }
      } catch {
        messageApi.error('Lỗi khi tải danh sách môn học')
      } finally {
        setLoading(false)
      }
    },
    [messageApi]
  )

  React.useEffect(() => {
    fetchSemesters()
    fetchSubjects(1, 8, '', '', true)
  }, [fetchSemesters, fetchSubjects])

  const handleTableChange = (page: number, pageSize: number) => {
    fetchSubjects(page, pageSize, searchName, searchCode, searchStatus)
  }

  const handleSearch = (values: any) => {
    const name = values.name || ''
    const code = values.code || ''
    const status = values.isActive ?? null
    setSearchName(name)
    setSearchCode(code)
    setSearchStatus(status)
    fetchSubjects(1, 8, name, code, status)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    setSearchName('')
    setSearchCode('')
    setSearchStatus(true)
    fetchSubjects(1, 8, '', '', true)
  }

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true)
    setIsDetailModalVisible(true)
    try {
      const response = await getSubjectById(id)
      if (response.success) {
        setSelectedSubject(response.data)
      } else {
        messageApi.error(response.message || 'Không thể tải thông tin môn học')
      }
    } catch {
      messageApi.error('Lỗi khi tải thông tin môn học')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleEdit = useCallback(
    async (subject: Subject) => {
      setIsEdit(true)
      setEditingId(subject.id)

      // Fetch chi tiết để có đầy đủ thông tin
      try {
        const response = await getSubjectById(subject.id)
        if (response.success) {
          const detail = response.data
          form.setFieldsValue({
            name: detail.name,
            code: detail.code,
            semesterId: detail.semester.id
          })
          setIsModalVisible(true)
        } else {
          messageApi.error(response.message || 'Không thể tải thông tin môn học')
        }
      } catch {
        messageApi.error('Lỗi khi tải thông tin môn học')
      }
    },
    [form, messageApi]
  )

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Xóa Môn Học',
      content: 'Bạn có chắc muốn xóa môn học này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteSubject(id)
          messageApi.success({
            content: 'Xóa môn học thành công!',
            duration: 3
          })
          setSearchName('')
          setSearchCode('')
          setSearchStatus(true)
          fetchSubjects(1, 8, '', '', true)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa môn học. Vui lòng thử lại!'
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
      if (isEdit && editingId) {
        await updateSubject(editingId, {
          semesterId: values.semesterId,
          name: values.name,
          code: values.code
        })
        messageApi.success({
          content: 'Cập nhật môn học thành công!',
          duration: 3
        })
      } else {
        await createSubject({
          semesterId: values.semesterId,
          name: values.name,
          code: values.code
        })
        messageApi.success({
          content: 'Tạo môn học mới thành công!',
          duration: 3
        })
      }
      setIsModalVisible(false)
      form.resetFields()
      setSearchName('')
      setSearchCode('')
      setSearchStatus(true)
      fetchSubjects(1, 8, '', '', true)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        (isEdit ? 'Không thể cập nhật môn học. Vui lòng thử lại!' : 'Không thể tạo môn học. Vui lòng thử lại!')
      messageApi.error({
        content: errorMessage,
        duration: 4
      })
    }
  }

  const columns = [
    {
      title: 'Tên Môn Học',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Mã Môn Học',
      dataIndex: 'code',
      key: 'code'
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
      render: (_: any, record: Subject) => (
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
        <Title level={2}>Quản Lý Môn Học</Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenModal}>
          Thêm Môn Học Mới
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout='vertical' onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Tên Môn Học' name='name'>
                <Input placeholder='Tìm kiếm theo tên...' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Mã Môn Học' name='code'>
                <Input placeholder='Tìm kiếm theo mã...' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
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
            <Col xs={24} sm={12} md={6}>
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
          dataSource={subjects.map((s) => ({ ...s, key: s.id }))}
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
        title={isEdit ? 'Sửa Môn Học' : 'Thêm Môn Học Mới'}
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

          <Form.Item label='Tên Môn Học' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}>
            <Input placeholder='VD: Lập trình Web' />
          </Form.Item>

          <Form.Item label='Mã Môn Học' name='code' rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}>
            <Input placeholder='VD: PRN232' />
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
        title='Chi Tiết Môn Học'
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
        ) : selectedSubject ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label='Tên Môn Học'>{selectedSubject.name}</Descriptions.Item>
            <Descriptions.Item label='Mã Môn Học'>{selectedSubject.code}</Descriptions.Item>
            <Descriptions.Item label='Học Kỳ'>{selectedSubject.semester.name}</Descriptions.Item>
            <Descriptions.Item label='Trạng Thái'>
              {selectedSubject.isActive ? <Tag color='green'>Hoạt Động</Tag> : <Tag color='red'>Không Hoạt Động</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label='Ngày Tạo'>
              {new Date(selectedSubject.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='Ngày Cập Nhật'>
              {new Date(selectedSubject.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label='Trạng Thái Học Kỳ'>
              {selectedSubject.semester.isActive ? (
                <Tag color='green'>Hoạt Động</Tag>
              ) : (
                <Tag color='red'>Không Hoạt Động</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  )
}

export default SubjectsPage
