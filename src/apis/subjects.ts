import type { ApiResponse, PaginationResponse } from '../types/api.dto'
import type { Subject, SubjectDetail, SubjectParams } from '../types/subject.dto'
import api from './apiClient'

export interface CreateSubjectData {
  semesterId: string
  name: string
  code: string
}

export interface UpdateSubjectData {
  semesterId: string
  name: string
  code: string
}

export const getSubjects = async (params?: SubjectParams): Promise<PaginationResponse<Subject>> => {
  const response = await api.get<PaginationResponse<Subject>>('/api/v1/subjects', { params })
  return response.data
}

export const getSubjectById = async (id: string): Promise<ApiResponse<SubjectDetail>> => {
  const response = await api.get<ApiResponse<SubjectDetail>>(`/api/v1/subjects/${id}`)
  return response.data
}

export const createSubject = async (data: CreateSubjectData): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/api/v1/subjects', data)
  return response.data
}

export const updateSubject = async (id: string, data: UpdateSubjectData): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/api/v1/subjects/${id}`, data)
  return response.data
}

export const deleteSubject = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/subjects/${id}`)
}

export type { Subject, SubjectDetail, SubjectParams }
