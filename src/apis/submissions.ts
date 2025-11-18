import type { GetSubmissionsParams, Submission, SubmissionPaginationResponse } from '../types/submission.dto'
import api from './apiClient'

export interface CreateSubmissionData {
  examinerId: string
  examSubjectId: string
  zipFile: File
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
  formData.append('zipFile', data.zipFile)

  const response = await api.post<{ success: boolean; data: any; message: string }>('/api/v1/submissions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const getUserSubmissions = async (userId: string): Promise<SubmissionPaginationResponse> => {
  const response = await api.get<SubmissionPaginationResponse>(`/api/v1/submissions/user`, {
    params: { userId }
  })
  return response.data
}

export type { GetSubmissionsParams, Submission }
