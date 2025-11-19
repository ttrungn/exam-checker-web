import type {
  AssessmentDetailResponse,
  GetSubmissionsParams,
  Submission,
  SubmissionPaginationResponse,
  UserSubmission,
  UserSubmissionPaginationResponse
} from '../types/submission.dto'
import api from './apiClient'

export interface CreateSubmissionData {
  examinerId: string
  examSubjectId: string
  archiveFile: File
}

export const getSubmissions = async (params?: GetSubmissionsParams): Promise<SubmissionPaginationResponse> => {
  const response = await api.get<SubmissionPaginationResponse>('/api/v1/submissions', { params })
  return response.data
}

export const getSubmissionById = async (
  id: string
): Promise<{ success: boolean; data: Submission; message: string }> => {
  const response = await api.get<{ success: boolean; data: Submission; message: string }>(`/api/v1/submissions/${id}`)
  return response.data
}

export const createSubmission = async (
  data: CreateSubmissionData
): Promise<{ success: boolean; data: any; message: string }> => {
  const formData = new FormData()
  formData.append('examinerId', data.examinerId)
  formData.append('examSubjectId', data.examSubjectId)
  formData.append('archiveFile', data.archiveFile)

  const response = await api.post<{ success: boolean; data: any; message: string }>(
    '/api/v1/submissions/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}

export const getUserSubmissions = async (userId: string): Promise<UserSubmissionPaginationResponse> => {
  const response = await api.get<UserSubmissionPaginationResponse>(`/api/v1/submissions/user`, {
    params: { pageIndex: 1, pageSize: 100 }
  })
  return response.data
}

// Assessment APIs
export const getAssessmentById = async (assessmentId: string): Promise<AssessmentDetailResponse> => {
  const response = await api.get<AssessmentDetailResponse>(`/api/v1/assessments/${assessmentId}`)
  return response.data
}

export interface SubmitGradingData {
  scoreDetail: {
    totalScore: number
    sections: {
      key: string
      name: string
      order: number
      criteria: {
        key: string
        name: string
        maxScore: number
        order: number
      }[]
    }[]
  }
  comment?: string
}

export const submitGrading = async (
  assessmentId: string,
  data: SubmitGradingData
): Promise<{ success: boolean; data: any; message: string }> => {
  const response = await api.put<{ success: boolean; data: any; message: string }>(
    `/api/v1/assessments/${assessmentId}/grade`,
    data
  )
  return response.data
}

export const completeAssessment = async (
  assessmentId: string
): Promise<{ success: boolean; data: any; message: string }> => {
  const response = await api.put<{ success: boolean; data: any; message: string }>(
    `/api/v1/assessments/${assessmentId}/complete`
  )
  return response.data
}

export const updateSubmissionToModeratorViolated = async (submissionId: string): Promise<void> => {
  await api.put(`/api/v1/submissions/${submissionId}/to-moderator-violated`)
}

export const updateSubmissionToModeratorValidated = async (submissionId: string): Promise<void> => {
  await api.put(`/api/v1/submissions/${submissionId}/to-moderator-validated`)
}

export type { GetSubmissionsParams, Submission, UserSubmission }
