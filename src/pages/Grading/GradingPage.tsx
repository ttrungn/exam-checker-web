import { SaveOutlined } from '@ant-design/icons'

import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography
} from 'antd'

import { getAssessmentById, submitGrading } from '../../apis/submissions'
import type { AssessmentDetail, ScoreDetail } from '../../types/submission.dto'

const { Title, Text } = Typography
const { TextArea } = Input

const GradingPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null)
  const [totalScore, setTotalScore] = useState(0)

  const [messageApi, messageContextHolder] = message.useMessage()

  const fetchAssessment = useCallback(async () => {
    if (!assessmentId) return

    setLoading(true)
    try {
      const response = await getAssessmentById(assessmentId)

      if (response.success) {
        setAssessment(response.data)

        // Initialize form with existing scores if available
        if (response.data.scoreDetail && response.data.scoreDetail.sections) {
          // Convert scoreDetail structure to form values format
          const formValues: any = {}

          response.data.scoreDetail.sections.forEach((section) => {
            section.criteria?.forEach((criterion) => {
              formValues[criterion.key] = criterion.score || 0
            })
          })

          // Add comment if exists
          if (response.data.comment) {
            formValues.comment = response.data.comment
          }

          form.setFieldsValue(formValues)
          calculateTotalScore(formValues)
        }
      } else {
        messageApi.error(response.message || 'Không thể tải thông tin chấm điểm')
      }
    } catch (error: any) {
      console.error('Error fetching assessment:', error)
      const errorMessage = error?.response?.data?.message || 'Lỗi khi tải thông tin chấm điểm'
      messageApi.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [assessmentId, messageApi, form])

  useEffect(() => {
    fetchAssessment()
  }, [fetchAssessment])

  const calculateTotalScore = (values: ScoreDetail) => {
    // Filter out non-numeric values (like 'comment')
    const total = Object.entries(values).reduce((sum, [key, value]) => {
      // Skip comment field and non-numeric values
      if (key === 'comment' || typeof value !== 'number') return sum
      return sum + (value || 0)
    }, 0)
    setTotalScore(Number(total.toFixed(2)))
  }

  const handleValuesChange = (_: any, allValues: ScoreDetail) => {
    calculateTotalScore(allValues)
  }

  const handleSubmit = async (values: ScoreDetail) => {
    if (!assessmentId || !assessment) return

    try {
      setSubmitting(true)

      // Build scoreDetail with sections structure matching backend
      const sectionsWithScores = assessment.scoreStructure.sections.map((section) => {
        // Calculate section total score from criteria scores
        const criteriaWithScores = section.criteria.map((criterion) => {
          const score = values[criterion.key]
          return {
            key: criterion.key,
            name: criterion.name,
            maxScore: criterion.maxScore,
            order: criterion.order,
            score: typeof score === 'number' ? score : 0 // Get score from form values
          }
        })

        const sectionTotalScore = criteriaWithScores.reduce((sum, c) => sum + c.score, 0)

        return {
          key: section.key,
          name: section.name,
          order: section.order,
          score: sectionTotalScore, // Total score for this section
          criteria: criteriaWithScores
        }
      })

      const gradingData = {
        scoreDetail: {
          totalScore: totalScore,
          sections: sectionsWithScores
        },
        comment: values.comment ? String(values.comment) : ''
      }

      console.log('Sending grading data:', JSON.stringify(gradingData, null, 2))

      const gradeResponse = await submitGrading(assessmentId, gradingData)

      if (gradeResponse.success) {
        messageApi.success('Chấm điểm và hoàn thành thành công!')
        setTimeout(() => {
          navigate('/my-submissions')
        }, 1500)
      } else {
        messageApi.error(gradeResponse.message || 'Không thể lưu điểm')
      }
    } catch (error: any) {
      console.error('Error submitting grading:', error)
      const errorMessage = error?.response?.data?.message || 'Lỗi khi lưu điểm. Vui lòng thử lại!'
      messageApi.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color='default'>Chưa chấm</Tag>
      case 1:
        return <Tag color='processing'>Đang chấm</Tag>
      case 2:
        return <Tag color='success'>Đã chấm</Tag>
      case 3:
        return <Tag color='error'>Đã hủy</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size='large' />
        <div style={{ marginTop: 16 }}>Đang tải...</div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Title level={4}>Không tìm thấy thông tin chấm điểm</Title>
        <Button type='primary' onClick={() => navigate('/my-submissions')}>
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div>
      {messageContextHolder}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Chấm bài</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title='Thông tin bài nộp'>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label='Tên bài nộp' span={2}>
                {assessment.submissionName ? (
                  <Text strong style={{ fontSize: 16 }}>
                    {assessment.submissionName}
                  </Text>
                ) : (
                  <Text type='secondary'>Chưa có tên</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label='Trạng thái'>{getStatusTag(assessment.status)}</Descriptions.Item>
              <Descriptions.Item label='Điểm hiện tại'>
                {assessment.score !== null ? (
                  <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                    {assessment.score} / {assessment.scoreStructure.maxScore}
                  </Text>
                ) : (
                  <Text type='secondary'>Chưa chấm</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label='Nhận xét'>
                {assessment.comment || <Text type='secondary'>Chưa có nhận xét</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title='Chấm điểm chi tiết' style={{ marginTop: 16 }}>
            <Form
              form={form}
              layout='vertical'
              onFinish={handleSubmit}
              onValuesChange={handleValuesChange}
              autoComplete='off'
            >
              {assessment.scoreStructure.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.key}>
                    <Divider orientation='left'>
                      <Text strong style={{ fontSize: 16 }}>
                        {section.order}. {section.name}
                      </Text>
                    </Divider>
                    <Row gutter={16}>
                      {section.criteria
                        .sort((a, b) => a.order - b.order)
                        .map((criterion) => (
                          <Col xs={24} sm={12} md={8} key={criterion.key}>
                            <Form.Item
                              label={
                                <Space direction='vertical' size={0}>
                                  <Text>{criterion.name}</Text>
                                  <Text type='secondary' style={{ fontSize: 12 }}>
                                    Tối đa: {criterion.maxScore} điểm
                                  </Text>
                                </Space>
                              }
                              name={criterion.key}
                              rules={[
                                {
                                  type: 'number',
                                  min: 0,
                                  max: criterion.maxScore,
                                  message: `Điểm phải từ 0 đến ${criterion.maxScore}`
                                }
                              ]}
                              initialValue={0}
                            >
                              <InputNumber
                                min={0}
                                max={criterion.maxScore}
                                step={0.25}
                                style={{ width: '100%' }}
                                placeholder='Nhập điểm'
                              />
                            </Form.Item>
                          </Col>
                        ))}
                    </Row>
                  </div>
                ))}

              <Divider />

              <Form.Item label='Nhận xét chung' name='comment'>
                <TextArea rows={4} placeholder='Nhập nhận xét về bài làm của sinh viên...' />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type='primary' htmlType='submit' icon={<SaveOutlined />} loading={submitting} size='large'>
                    Lưu điểm
                  </Button>
                  <Button size='large' onClick={() => navigate('/my-submissions')}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Statistic
              title='Tổng điểm hiện tại'
              value={totalScore}
              suffix={`/ ${assessment.scoreStructure.maxScore}`}
              precision={2}
              valueStyle={{ color: totalScore >= assessment.scoreStructure.maxScore * 0.5 ? '#3f8600' : '#cf1322' }}
            />
          </Card>

          <Card title='Hướng dẫn chấm điểm' style={{ marginTop: 16 }}>
            <Space direction='vertical' size='small' style={{ width: '100%' }}>
              <Text>• Nhập điểm cho từng tiêu chí</Text>
              <Text>• Điểm có thể là số thập phân (bội số của 0.25)</Text>
              <Text>• Tổng điểm sẽ tự động cập nhật</Text>
              <Text>• Điểm tối đa cho mỗi tiêu chí được hiển thị bên dưới tên</Text>
              <Text>• Bấm &quot;Lưu điểm&quot; để hoàn tất chấm bài</Text>
            </Space>
          </Card>

          <Card title='Cấu trúc điểm' style={{ marginTop: 16 }}>
            <Space direction='vertical' size='small' style={{ width: '100%' }}>
              {assessment.scoreStructure.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => {
                  const sectionMaxScore = section.criteria.reduce((sum, c) => sum + c.maxScore, 0)
                  return (
                    <div key={section.key}>
                      <Text strong>
                        {section.order}. {section.name}
                      </Text>
                      <br />
                      <Text type='secondary' style={{ fontSize: 12 }}>
                        {section.criteria.length} tiêu chí - {sectionMaxScore} điểm
                      </Text>
                    </div>
                  )
                })}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default GradingPage
