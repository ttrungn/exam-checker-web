import { EyeOutlined } from '@ant-design/icons'

import React, { useCallback, useEffect, useState } from 'react'

import { Button, Card, Descriptions, message, Modal, Space, Table, Tag, Typography } from 'antd'

import { getSubmissionById, getUserSubmissions, type Submission } from '../../apis/submissions'
import { useAppSelector } from '../../hooks/customReduxHooks'

const { Title } = Typography

const MySubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const { profile } = useAppSelector((state) => state.userProfile)
  const [messageApi, messageContextHolder] = message.useMessage()

  const fetchMySubmissions = useCallback(async () => {
    if (!profile?.id) return

    setLoading(true)
    try {
      const response = await getUserSubmissions(profile.id)

      if (response.success) {
        setSubmissions(response.data.items || [])
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
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Submission) => (
        <Space size='middle'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          {record.fileUrl && (
            <Button size='small' type='link' href={record.fileUrl} target='_blank' rel='noopener noreferrer'>
              Tải xuống
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

      <Card loading={loading}>
        <Table
          columns={columns}
          dataSource={Array.isArray(submissions) ? submissions.map((s) => ({ ...s, key: s.id })) : []}
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
            <Descriptions.Item label='Mã bài thi'>{selectedSubmission.examCode}</Descriptions.Item>
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
    </div>
  )
}

export default MySubmissionsPage
