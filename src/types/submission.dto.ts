export enum SubmissionStatus {
  Processing = 0,
  Validated = 1,
  Violated = 2,
  Complained = 3,
  ModeratorValidated = 4,
  ModeratorViolated = 5
}

export enum AssessmentStatus {
  Pending = 0, // chưa chấm
  InReview = 1, // đang chấm
  Complete = 2, // đã chấm
  Cancelled = 3 // bị hủy
}

export interface Assessment {
  id: string
  submissionName: string
  examinerId?: string
  examinerEmail?: string | null
  status: number
  score: number | null
  gradedAt: string | null
}

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
  assessments: Assessment[]
}

// For getUserSubmissions API - has different structure
export interface UserSubmission {
  id: string
  examSubjectId: string
  examId: string
  examCode: string
  subjectId: string
  subjectIdCode: string
  assignAt: string
  status: number
  fileUrl: string
  assessmentId: string
  submissionName: string
  assessmentStatus: number
  myScore: number | null
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
  submissionName?: string
  assessmentStatus?: number
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

export interface UserSubmissionPaginationData {
  pageIndex: number
  pageSize: number
  totalCount: number
  totalCurrentCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  indexFrom: number
  items: UserSubmission[]
}

export interface UserSubmissionPaginationResponse {
  data: UserSubmissionPaginationData
  success: boolean
  message: string
}

// Grading types
export interface ScoreCriteria {
  key: string
  name: string
  maxScore: number
  order: number
}

export interface ScoreSection {
  key: string
  name: string
  order: number
  criteria: ScoreCriteria[]
}

export interface ScoreStructure {
  maxScore: number
  sections: ScoreSection[]
}

export interface ScoreDetail {
  [key: string]: number | string
}

export interface ScoreCriteriaWithScore extends ScoreCriteria {
  score: number
}

export interface ScoreSectionWithScore {
  key: string
  name: string
  order: number
  score: number
  criteria: ScoreCriteriaWithScore[]
}

export interface ScoreDetailResponse {
  totalScore: number
  sections: ScoreSectionWithScore[]
}

export interface AssessmentDetail {
  id: string
  submissionId: string
  submissionName?: string
  status: number
  score: number | null
  comment: string | null
  scoreStructure: ScoreStructure
  scoreDetail: ScoreDetailResponse | null
}

export interface AssessmentDetailResponse {
  data: AssessmentDetail
  success: boolean
  message: string
}
