export interface DashboardSummary {
  examSubjectId: string
  examId: string
  subjectId: string
  examCode: string
  subjectCode: string
  totalSubmissions: number
  graded: number
  reassigned: number
  approved: number
  notGraded: number
  violated: number
  progressPercent: number
}

export interface DashboardSummaryParams {
  examCode?: string
  subjectCode?: string
  top?: number
  skip?: number
  orderBy?: string // e.g., 'examCode asc,subjectCode asc'
}