export interface Submission {
  id: string
  examSubjectId: string
  examId: string
  examCode: string
  subjectId: string
  subjectIdCode: string
  examinerId: string | null
  examinerEmail: string | null
  moderatorId: string | null
  moderatorEmail: string | null
  assignAt: string
  status: number
  fileUrl: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface GetSubmissionsParams {
  pageIndex?: number
  pageSize?: number
  indexFrom?: number
  examCode?: string
  subjectCode?: string
  status?: number
  examinerName?: string
  moderatorName?: string
}

export interface SubmissionPaginationData {
  pageIndex: number
  pageSize: number
  totalCount: number
  totalCurrentCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  indexFrom: number
  items: Submission[]
}

export interface SubmissionPaginationResponse {
  data: SubmissionPaginationData
  success: boolean
  message: string
}
