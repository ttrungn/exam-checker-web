import { EyeOutlined, UploadOutlined } from '@ant-design/icons'
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
  Typography,
  Upload
} from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'

import {
  getExamSubjectById,
  getExamSubjects,
  importScoreStructure,
  updateViolationStructure
} from '../../apis/examSubjects'
import type { ExamSubject, ExamSubjectParams, ViolationStructure } from '../../types/examSubject.dto'

const { Title, Text } = Typography

const ExamSubjectsPage: React.FC = () => {
  const [items, setItems] = useState<ExamSubject[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 8, total: 0 })
  const [searchForm] = Form.useForm()
  const [searchParams, setSearchParams] = useState<ExamSubjectParams>({})
  const [messageApi, contextHolder] = message.useMessage()

  // Detail modal & violation form
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [violationSaving, setViolationSaving] = useState(false)
  const [violationForm] = Form.useForm()
  // Removed selectedId state (unused after edit/delete removal)
  const [selectedDetail, setSelectedDetail] = useState<ExamSubject | null>(null)

  // Removed exams & subjects meta (not needed without create/edit)

  // Import modal
  const [importVisible, setImportVisible] = useState(false)
  const [importTargetId, setImportTargetId] = useState<string | null>(null)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [importing, setImporting] = useState(false)

  const fetchItems = useCallback(
    async (page = 1, size = 8, filters: ExamSubjectParams = {}) => {
      setLoading(true)
      try {
        const response = await getExamSubjects({ pageIndex: page, pageSize: size, ...filters })
        if (response.success) {
          setItems(response.data)
          setPagination({
            pageIndex: response.pageIndex,
            pageSize: response.pageSize,
            total: response.totalCount
          })
        } else {
          messageApi.error(response.message || 'Không thể tải danh sách Exam-Subject')
        }
      } catch {
        messageApi.error('Lỗi khi tải danh sách Exam-Subject')
      } finally {
        setLoading(false)
      }
    },
    [messageApi]
  )

  useEffect(() => {
    fetchItems(1, 8, {})
  }, [fetchItems])

  const handleTableChange = (page: number, pageSize: number) => {
    fetchItems(page, pageSize, searchParams)
  }

  const handleSearch = (values: any) => {
    const params: ExamSubjectParams = {}
    if (values.examCode) params.examCode = values.examCode
    if (values.subjectCode) params.subjectCode = values.subjectCode
    if (values.isActive !== undefined && values.isActive !== null) params.isActive = values.isActive
    setSearchParams(params)
    fetchItems(1, 8, params)
  }

  const handleResetSearch = () => {
    searchForm.resetFields()
    setSearchParams({})
    fetchItems(1, 8, {})
  }

  const openDetail = async (id: string) => {
    setDetailVisible(true)
    setDetailLoading(true)
    try {
      const res = await getExamSubjectById(id)
      if (res.success) {
        setSelectedDetail(res.data)
        // Parse violation structure JSON string and populate form
        try {
          const raw = res.data.violationStructure
          let parsed: any = {}
          if (raw) {
            parsed = JSON.parse(raw)
          }
          violationForm.setFieldsValue({
            keywords: (parsed?.KeywordCheck?.Keywords || []).join(', '),
            fileExtensions: (parsed?.KeywordCheck?.FileExtensions || []).join(', '),
            nameFormat: parsed?.NameFormatMismatch?.NameFormat || '',
            compilationError: parsed?.CompilationError ?? parsed?.CompilationCheck ?? false
          })
        } catch {
          violationForm.resetFields()
        }
      } else {
        messageApi.error(res.message || 'Không thể tải chi tiết Exam-Subject')
      }
    } catch {
      messageApi.error('Lỗi khi tải chi tiết Exam-Subject')
    } finally {
      setDetailLoading(false)
    }
  }

  // Removed create/edit logic per request

  // Removed deletion logic per request (read-only mode)

  const openImport = (id: string) => {
    setImportTargetId(id)
    setFileList([])
    setImportVisible(true)
  }

  const submitImport = async () => {
    if (!importTargetId || fileList.length === 0) {
      messageApi.error('Vui lòng chọn file Excel')
      return
    }
    setImporting(true)
    try {
      const excelFile = fileList[0].originFileObj as File
      const res = await importScoreStructure(importTargetId, excelFile)
      if (res.success) {
        messageApi.success('Import tiêu chí chấm điểm thành công!')
        setImportVisible(false)
        setFileList([])
      } else {
        messageApi.error(res.message || 'Import tiêu chí chấm điểm thất bại')
      }
    } catch (e: any) {
      messageApi.error(e?.response?.data?.message || 'Import tiêu chí chấm điểm thất bại')
    } finally {
      setImporting(false)
    }
  }

  const columns = [
    { title: 'Mã Kỳ Thi', dataIndex: 'examCode', key: 'examCode' },
    { title: 'Mã Môn Học', dataIndex: 'subjectCode', key: 'subjectCode' },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => (v ? <Tag color='green'>Hoạt động</Tag> : <Tag color='red'>Không hoạt động</Tag>)
    },
    {
      title: 'Ngày Bắt Đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (d: string) => new Date(d).toLocaleString('vi-VN')
    },
    {
      title: 'Ngày Kết Thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d: string) => new Date(d).toLocaleString('vi-VN')
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_: any, record: ExamSubject) => (
        <Space size='small'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => openDetail(record.id)} />
          <Button size='small' icon={<UploadOutlined />} onClick={() => openImport(record.id)}>
            Import Tiêu chí
          </Button>
          {/* Delete button removed */}
        </Space>
      )
    }
  ]

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Quản Lý Exam-Subject</Title>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout='vertical' onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Mã Kỳ Thi' name='examCode'>
                <Input placeholder='Tìm theo mã kỳ thi...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Mã Môn Học' name='subjectCode'>
                <Input placeholder='Tìm theo mã môn học...' allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label='Trạng Thái' name='isActive'>
                <Select
                  placeholder='Chọn trạng thái'
                  allowClear
                  options={[
                    { label: 'Hoạt động', value: true },
                    { label: 'Không hoạt động', value: false }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label=' '>
                <Space>
                  <Button type='primary' htmlType='submit'>
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
          dataSource={items.map((i) => ({ ...i, key: i.id }))}
          pagination={{
            total: pagination.total,
            pageSize: pagination.pageSize,
            current: pagination.pageIndex,
            showSizeChanger: false,
            showQuickJumper: false
          }}
          onChange={(p) => handleTableChange(p.current || 1, p.pageSize || 8)}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title='Chi Tiết & Cập Nhật Quy Tắc Vi Phạm'
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={780}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
        ) : selectedDetail ? (
          <div>
            <Descriptions bordered column={2} size='small'>
              <Descriptions.Item label='Mã Kỳ Thi'>{selectedDetail.examCode}</Descriptions.Item>
              <Descriptions.Item label='Mã Môn Học'>{selectedDetail.subjectCode}</Descriptions.Item>
              <Descriptions.Item label='Trạng Thái' span={2}>
                {selectedDetail.isActive ? <Tag color='green'>Hoạt động</Tag> : <Tag color='red'>Không hoạt động</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label='Ngày Bắt Đầu'>
                {new Date(selectedDetail.startDate).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label='Ngày Kết thúc'>
                {new Date(selectedDetail.endDate).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label='Tiêu chí chấm (raw)' span={2}>
                <Text type='secondary' style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDetail.scoreStructure || '-'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Typography.Title level={5}>Cập Nhật Quy Tắc Vi Phạm</Typography.Title>
              <Form
                form={violationForm}
                layout='vertical'
                onFinish={async (values) => {
                  const keywords = values.keywords
                    ? values.keywords
                        .split(',')
                        .map((s: string) => s.trim())
                        .filter((s: string) => s.length)
                    : []
                  const fileExtensions = values.fileExtensions
                    ? values.fileExtensions
                        .split(',')
                        .map((s: string) => s.trim())
                        .filter((s: string) => s.length)
                    : []
                  const payload: ViolationStructure = {
                    KeywordCheck:
                        { Keywords: keywords, FileExtensions: fileExtensions },
                    NameFormatMismatch: { NameFormat: values.nameFormat },
                    CompilationCheck: !!values.compilationCheck
                  }
                  setViolationSaving(true)
                  try {
                    await updateViolationStructure(selectedDetail.id, payload)
                    messageApi.success('Cập nhật quy tắc vi phạm thành công!')
                    await openDetail(selectedDetail.id) // refresh data & form
                  } catch (e: any) {
                    messageApi.error(e?.response?.data?.message || 'Cập nhật thất bại')
                  } finally {
                    setViolationSaving(false)
                  }
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label='Từ khóa cấm' name='keywords' tooltip='Phân tách bằng dấu phẩy'>
                      <Input placeholder='ví dụ: while(true), system("rm")' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label='Phần mở rộng file' name='fileExtensions' tooltip='Phân tách bằng dấu phẩy'>
                      <Input placeholder='ví dụ: .exe, .bat' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label='Định dạng tên file' name='nameFormat' tooltip='Regex hoặc pattern mong muốn'>
                      <Input placeholder='ví dụ: ^[A-Z]{2}_[0-9]{3}\\.cpp$' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label='Kiểm tra lỗi biên dịch' name='compilationError'>
                      <Select
                        options={[
                          { label: 'Bật', value: true },
                          { label: 'Tắt', value: false }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button onClick={() => setDetailVisible(false)}>Đóng</Button>
                  <Button type='primary' htmlType='submit' loading={violationSaving}>
                    Cập Nhật Quy Tắc
                  </Button>
                </Space>
                <div style={{ marginTop: 8 }}>
                  <Text type='secondary'>Để trống một trường sẽ bỏ qua quy tắc tương ứng.</Text>
                </div>
              </Form>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Removed create/edit modal */}

      <Modal
        title='Import Tiêu chí chấm điểm'
        open={importVisible}
        onCancel={() => setImportVisible(false)}
        footer={null}
      >
        <Upload
          fileList={fileList}
          onChange={(info) => setFileList(info.fileList.slice(-1))}
          beforeUpload={() => false}
          accept='.xlsx,.xls'
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
        </Upload>

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => setImportVisible(false)}>Hủy</Button>
            <Button type='primary' loading={importing} onClick={submitImport}>
              Import
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  )
}

export default ExamSubjectsPage
