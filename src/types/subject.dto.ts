export interface Subject {
  id: string
  name: string
  code?: string
  semesterId?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  semester?: Semester
}

export interface SubjectDetail {
  id: string
  name: string
  code: string
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

export interface SubjectParams {
  name?: string
  code?: string
  isActive?: boolean
  pageIndex?: number
  pageSize?: number
}
