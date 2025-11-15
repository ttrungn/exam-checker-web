import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import React, { useCallback, useState } from 'react'

import { Button, Card, Col, Form, Input, message, Modal, Row, Select, Space, Table, Tag, Typography } from 'antd'

import api from '../../apis/apiClient'
import type { Semester, SemesterPaginationResponse } from '../../types/semester.dto'

const { Title } = Typography

const SemestersPage: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 8,
    total: 0
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [searchName, setSearchName] = useState('')
  const [searchStatus, setSearchStatus] = useState<boolean | null>(true)

  const [messageApi, messageContextHolder] = message.useMessage()
  const [modal, contextHolder] = Modal.useModal()

  const fetchSemesters = useCallback(
    async (pageIndex = 1, pageSize = 8, name = '', status: boolean | null = null) => {
      setLoading(true)
      try {
        const params: any = {
          pageIndex: pageIndex,
          pageSize: pageSize
        }

        if (name) params.name = name
        if (status !== null) params.isActive = status

        const response = await api.get<SemesterPaginationResponse>('/api/v1/semesters', { params })

        if (response.data.success) {
          setSemesters(response.data.data)
          setPagination({
            pageIndex: response.data.pageIndex,
            pageSize: response.data.pageSize,
            total: response.data.totalCount
          })
        } else {
          messageApi.error(response.data.message || 'Không thể tải danh sách học kỳ')
        }
      } catch {
        messageApi.error('Lỗi khi tải danh sách học kỳ')
      } finally {
        setLoading(false)
      }
    },
    [messageApi]
  )

  React.useEffect(() => {
    fetchSemesters(1, 8, '', true)
  }, [fetchSemesters])

  const handleTableChange = (page: number, pageSize: number) => {
    fetchSemesters(page, pageSize, searchName, searchStatus)
  }

  const handleSearch = (values: any) => {
    const name = values.name || ''
    const status = values.isActive ?? null
    setSearchName(name)
    setSearchStatus(status)
    fetchSemesters(1, 8, name, status)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    setSearchName('')
    setSearchStatus(true)
    fetchSemesters(1, 8, '', true)
  }

  const handleEdit = useCallback(
    (semester: Semester) => {
      setIsEdit(true)
      setEditingId(semester.id)
      form.setFieldsValue({
        name: semester.name
      })
      setIsModalVisible(true)
    },
    [form]
  )

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Xóa Học Kỳ',
      content: 'Bạn có chắc muốn xóa học kỳ này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/api/v1/semesters/${id}`)
          messageApi.success({
            content: 'Xóa học kỳ thành công!',
            duration: 3
          })
          setSearchName('')
          setSearchStatus(true)
          fetchSemesters(1, 8, '', true)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa học kỳ. Vui lòng thử lại!'
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
        await api.put(`/api/v1/semesters/${editingId}`, {
          name: values.name
        })
        messageApi.success({
          content: 'Cập nhật học kỳ thành công!',
          duration: 3
        })
      } else {
        await api.post('/api/v1/semesters', {
          name: values.name
        })
        messageApi.success({
          content: 'Tạo học kỳ mới thành công!',
          duration: 3
        })
      }
      setIsModalVisible(false)
      form.resetFields()
      setSearchName('')
      setSearchStatus(true)
      fetchSemesters(1, 8, '', true)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        (isEdit ? 'Không thể cập nhật học kỳ. Vui lòng thử lại!' : 'Không thể tạo học kỳ. Vui lòng thử lại!')
      messageApi.error({
        content: errorMessage,
        duration: 4
      })
    }
  }

  const columns = [
    {
      title: 'Tên Học Kỳ',
      dataIndex: 'name',
      key: 'name'
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
      render: (_: any, record: Semester) => (
        <Space size='middle'>
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
        <Title level={2}>Quản Lý Học Kỳ</Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenModal}>
          Thêm Học Kỳ Mới
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout='vertical' onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Tên Học Kỳ' name='name'>
                <Input placeholder='Tìm kiếm theo tên...' />
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
          dataSource={semesters.map((s) => ({ ...s, key: s.id }))}
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
        title={isEdit ? 'Sửa Học Kỳ' : 'Thêm Học Kỳ Mới'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} layout='vertical' onFinish={handleModalSubmit}>
          <Form.Item label='Tên Học Kỳ' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên học kỳ' }]}>
            <Input placeholder='VD: Kỳ 1' />
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
    </div>
  )
}

export default SemestersPage
