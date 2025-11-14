export interface Semester {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface SemesterPaginationResponse {
  pageIndex: number
  pageSize: number
  totalCount: number
  totalCurrentCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: Semester[]
  success: boolean
  message: string
}

export interface SemesterParams {
  name?: string
  isActive?: boolean
  pageIndex?: number
  pageSize?: number
}
