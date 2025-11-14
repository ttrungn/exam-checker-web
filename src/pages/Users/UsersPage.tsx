import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Button,
  Card,
  Col,
  DatePicker,
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
  type AppRole,
  assignRoleToUser,
  createAccount,
  getAccounts,
  type GetAccountsParams,
  getAppRoles,
  type UserAccount
} from '../../apis/users'

const { Title } = Typography

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [appRoles, setAppRoles] = useState<AppRole[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 8,
    total: 0
  })
  const [searchForm] = Form.useForm()
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [searchEmail, setSearchEmail] = useState('')
  const [searchRoles, setSearchRoles] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const [messageApi, messageContextHolder] = message.useMessage()
  const [modal, contextHolder] = Modal.useModal()

  const fetchAppRoles = useCallback(async () => {
    setRolesLoading(true)
    try {
      const response = await getAppRoles()
      if (response.success) {
        setAppRoles(response.data.items)
      } else {
        messageApi.error(response.message || 'Không thể tải danh sách vai trò')
      }
    } catch {
      messageApi.error('Lỗi khi tải danh sách vai trò')
    } finally {
      setRolesLoading(false)
    }
  }, [messageApi])

  const fetchUsers = useCallback(
    async (pageIndex = 1, pageSize = 8, email = '', appRoleIds: string[] = [], indexFrom = 1) => {
      setUsersLoading(true)
      try {
        const params: GetAccountsParams = {
          pageIndex,
          pageSize,
          indexFrom
        }

        if (email) params.email = email
        if (appRoleIds.length > 0) params.appRoleIds = appRoleIds

        const response = await getAccounts(params)

        if (response.success) {
          setUsers(response.data.items)
          setPagination({
            pageIndex: response.data.pageIndex,
            pageSize: response.data.pageSize,
            total: response.data.totalCount
          })
        } else {
          messageApi.error(response.message || 'Không thể tải danh sách người dùng')
        }
      } catch {
        messageApi.error('Lỗi khi tải danh sách người dùng')
      } finally {
        setUsersLoading(false)
      }
    },
    [messageApi]
  )

  useEffect(() => {
    fetchAppRoles()
    fetchUsers(1, 8, '', [], 1)
  }, [fetchAppRoles, fetchUsers])

  const handleTableChange = (page: number, pageSize: number) => {
    fetchUsers(page, pageSize, searchEmail, searchRoles, 1)
  }

  const handleSearch = (values: any) => {
    const email = values.email || ''
    const roles = values.roles || []
    setSearchEmail(email)
    setSearchRoles(roles)
    fetchUsers(1, 8, email, roles, 1)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    setSearchEmail('')
    setSearchRoles([])
    fetchUsers(1, 8, '', [], 1)
  }

  const handleOpenModal = () => {
    createForm.resetFields()
    setIsModalVisible(true)
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    createForm.resetFields()
  }

  const handleModalSubmit = async (values: any) => {
    try {
      await createAccount({
        email: values.email,
        displayName: values.displayName,
        initialPassword: values.initialPassword,
        givenName: values.givenName,
        surname: values.surname,
        jobTitle: values.jobTitle,
        employeeHireDate: values.employeeHireDate?.toISOString(),
        mobilePhone: values.mobilePhone
      })
      messageApi.success({
        content: 'Tạo người dùng mới thành công!',
        duration: 3
      })
      setIsModalVisible(false)
      createForm.resetFields()
      setSearchEmail('')
      setSearchRoles([])
      fetchUsers(1, 8, '', [], 1)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể tạo người dùng. Vui lòng thử lại!'
      messageApi.error({
        content: errorMessage,
        duration: 4
      })
    }
  }

  const handleEdit = useCallback(
    (user: UserAccount) => {
      setEditingUser(user)
      setSelectedRoles([])
      editForm.resetFields()
      setIsEditModalVisible(true)
    },
    [editForm]
  )

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Xóa người dùng',
      content: 'Bạn có chắc muốn xóa người dùng này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        // TODO: Implement delete user API call
        messageApi.info('Chức năng xóa người dùng chưa được triển khai')
      }
    })
  }

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false)
    setEditingUser(null)
    setSelectedRoles([])
    editForm.resetFields()
  }

  const handleEditModalSubmit = async (values: any) => {
    if (!editingUser) return

    try {
      const roleId = values.role

      // Assign role to user
      await assignRoleToUser({
        userId: editingUser.id,
        appRoleId: roleId
      })

      messageApi.success({
        content: 'Phân quyền người dùng thành công!',
        duration: 3
      })

      setIsEditModalVisible(false)
      setEditingUser(null)
      setSelectedRoles([])
      editForm.resetFields()
      fetchUsers(1, 8, searchEmail, searchRoles, 1)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Không thể phân quyền người dùng. Vui lòng thử lại!'
      messageApi.error({
        content: errorMessage,
        duration: 4
      })
    }
  }

  const columns = [
    {
      title: 'Tên hiển thị',
      dataIndex: 'displayName',
      key: 'displayName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Họ',
      dataIndex: 'givenName',
      key: 'givenName',
      render: (text: string) => text || '-'
    },
    {
      title: 'Tên',
      dataIndex: 'surname',
      key: 'surname',
      render: (text: string) => text || '-'
    },
    {
      title: 'Chức danh',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      render: (text: string) => text || '-'
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space wrap>
          {roles.length > 0 ? (
            roles.map((role) => (
              <Tag key={role} color='blue'>
                {role}
              </Tag>
            ))
          ) : (
            <Tag color='default'>Không có vai trò</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: UserAccount) => (
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
        <Title level={2}>Quản lý người dùng</Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenModal}>
          Tạo người dùng mới
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout='vertical' onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Email' name='email'>
                <Input placeholder='Tìm kiếm theo email...' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Vai trò' name='roles'>
                <Select
                  mode='multiple'
                  placeholder='Chọn vai trò'
                  allowClear
                  loading={rolesLoading}
                  options={appRoles.map((role) => ({
                    label: role.displayName,
                    value: role.id
                  }))}
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

      <Card loading={usersLoading}>
        <Table
          columns={columns}
          dataSource={users.map((user) => ({
            ...user,
            key: user.id,
            roles: user.roles.map((role) => role.toUpperCase())
          }))}
          pagination={{
            total: pagination.total,
            pageSize: pagination.pageSize,
            current: pagination.pageIndex,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['8', '16', '32', '64']
          }}
          onChange={(pag) => handleTableChange(pag.current || 1, pag.pageSize || 8)}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal title='Tạo người dùng mới' open={isModalVisible} onCancel={handleModalCancel} footer={null} width={600}>
        <Form form={createForm} layout='vertical' onFinish={handleModalSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label='Email'
                name='email'
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder='user@example.com' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Tên hiển thị'
                name='displayName'
                rules={[
                  { required: true, message: 'Vui lòng nhập tên hiển thị' },
                  { min: 2, message: 'Tên hiển thị phải có ít nhất 2 ký tự' },
                  { max: 50, message: 'Tên hiển thị không được quá 50 ký tự' }
                ]}
              >
                <Input placeholder='Tên hiển thị' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label='Họ'
                name='givenName'
                rules={[
                  { required: true, message: 'Vui lòng nhập họ' },
                  { min: 1, message: 'Họ phải có ít nhất 1 ký tự' },
                  { max: 30, message: 'Họ không được quá 30 ký tự' },
                  {
                    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: 'Họ chỉ được chứa chữ cái và khoảng trắng'
                  }
                ]}
              >
                <Input placeholder='Họ' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Tên'
                name='surname'
                rules={[
                  { required: true, message: 'Vui lòng nhập tên' },
                  { min: 1, message: 'Tên phải có ít nhất 1 ký tự' },
                  { max: 30, message: 'Tên không được quá 30 ký tự' },
                  {
                    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: 'Tên chỉ được chứa chữ cái và khoảng trắng'
                  }
                ]}
              >
                <Input placeholder='Tên' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label='Mật khẩu ban đầu'
                name='initialPassword'
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                    message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
                  }
                ]}
              >
                <Input.Password placeholder='Mật khẩu ban đầu' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Số điện thoại'
                name='mobilePhone'
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại phải có 10-11 chữ số'
                  }
                ]}
              >
                <Input placeholder='Số điện thoại' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label='Chức danh'
                name='jobTitle'
                rules={[
                  { required: true, message: 'Vui lòng nhập chức danh' },
                  { min: 2, message: 'Chức danh phải có ít nhất 2 ký tự' }
                ]}
              >
                <Input placeholder='Chức danh' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label='Ngày tuyển dụng'
                name='employeeHireDate'
                rules={[{ required: true, message: 'Vui lòng chọn ngày tuyển dụng' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder='Chọn ngày' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleModalCancel}>Hủy</Button>
              <Button type='primary' htmlType='submit'>
                Tạo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Cập nhật người dùng - ${editingUser?.displayName || ''}`}
        open={isEditModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        width={600}
      >
        {editingUser && (
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>Email:</strong> {editingUser.email}
            </p>
            <p>
              <strong>Tên hiển thị:</strong> {editingUser.displayName}
            </p>
            <p>
              <strong>Họ tên:</strong> {editingUser.givenName} {editingUser.surname}
            </p>
            <p>
              <strong>Vai trò hiện tại:</strong>{' '}
              {editingUser.roles.length > 0 ? editingUser.roles.join(', ') : 'Chưa có vai trò'}
            </p>
          </div>
        )}

        <Form form={editForm} layout='vertical' onFinish={handleEditModalSubmit}>
          <Form.Item
            label='Phân quyền mới'
            name='role'
            rules={[{ required: true, message: 'Vui lòng chọn một vai trò' }]}
          >
            <Select
              placeholder='Chọn vai trò để phân quyền'
              loading={rolesLoading}
              options={appRoles.map((role) => ({
                label: role.displayName,
                value: role.id
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleEditModalCancel}>Hủy</Button>
              <Button type='primary' htmlType='submit'>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UsersPage
