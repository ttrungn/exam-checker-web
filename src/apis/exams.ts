import type { ApiResponse, PaginationResponse } from '../types/api.dto'
import type { Exam, ExamDetail, ExamParams } from '../types/exam.dto'
import api from './apiClient'

export interface CreateExamData {
  semesterId: string
  code: string
  startDate: string
  endDate: string
}

export interface UpdateExamData {
  semesterId: string
  code: string
  startDate: string
  endDate: string
}

export const getExams = async (params?: ExamParams): Promise<PaginationResponse<Exam>> => {
  const response = await api.get<PaginationResponse<Exam>>('/api/v1/exams', { params })
  return response.data
}

export const getExamById = async (id: string): Promise<ApiResponse<ExamDetail>> => {
  const response = await api.get<ApiResponse<ExamDetail>>(`/api/v1/exams/${id}`)
  return response.data
}

export const createExam = async (data: CreateExamData): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/api/v1/exams', data)
  return response.data
}

export const updateExam = async (id: string, data: UpdateExamData): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/api/v1/exams/${id}`, data)
  return response.data
}

export const deleteExam = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/exams/${id}`)
}

export type { Exam, ExamDetail, ExamParams }
