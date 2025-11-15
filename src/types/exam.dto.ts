export interface Exam {
  id: string
  code: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface ExamDetail {
  id: string
  code: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  semester: Semester
}

interface Semester {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface ExamParams {
  code?: string
  isActive?: boolean
  pageIndex?: number
  pageSize?: number
}
