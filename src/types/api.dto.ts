export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationResponse<T> {
  pageIndex: number
  pageSize: number
  totalCount: number
  totalCurrentCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: T[]
  success: boolean
  message: string
}
