import type { PaginationResponse } from '../types/api.dto'
import type { ExamSubject, ExamSubjectParams, ViolationStructure } from '../types/examSubject.dto'
import api from './apiClient'
import type { ApiResponse } from './users'

export interface ImportScoreStructureResponse {
  success: boolean
  data: any
  message: string
}

export const importScoreStructure = async (
  examSubjectId: string,
  file: File
): Promise<ImportScoreStructureResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<ImportScoreStructureResponse>(
    `/api/v1/examsubjects/${examSubjectId}/score-structure/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}

export const getExamSubjects = async (params?: ExamSubjectParams): Promise<PaginationResponse<ExamSubject>> => {
  const response = await api.get<PaginationResponse<ExamSubject>>('/api/v1/examsubjects', { params })
  return response.data
}

// Get by id
export const getExamSubjectById = async (id: string): Promise<ApiResponse<ExamSubject>> => {
  const response = await api.get<ApiResponse<ExamSubject>>(`/api/v1/examsubjects/${id}`)
  return response.data
}


export const updateViolationStructure = async (
  examSubjectId: string,
  rules: ViolationStructure
): Promise<boolean> => {
  await api.put(`/api/v1/examsubjects/${examSubjectId}/violation-structure`, rules)
  return true
}
