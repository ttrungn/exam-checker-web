import type { PaginationResponse } from '../types/api.dto'
import type { Semester, SemesterParams } from '../types/semester.dto'
import api from './apiClient'

export interface CreateSemesterData {
  name: string
}

export interface UpdateSemesterData {
  name: string
}

export const getSemesters = async (params?: SemesterParams): Promise<PaginationResponse<Semester>> => {
  const response = await api.get<PaginationResponse<Semester>>('/api/v1/semesters', { params })
  return response.data
}

export const createSemester = async (
  data: CreateSemesterData
): Promise<{ success: boolean; data: any; message: string }> => {
  const response = await api.post<{ success: boolean; data: any; message: string }>('/api/v1/semesters', data)
  return response.data
}

export const updateSemester = async (
  id: string,
  data: UpdateSemesterData
): Promise<{ success: boolean; data: any; message: string }> => {
  const response = await api.put<{ success: boolean; data: any; message: string }>(`/api/v1/semesters/${id}`, data)
  return response.data
}

export const deleteSemester = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/semesters/${id}`)
}

export type { Semester, SemesterParams }
