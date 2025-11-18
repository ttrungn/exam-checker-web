export interface ExamSubjectParams {
  examCode?: string
  subjectCode?: string
  isActive?: boolean
  pageIndex?: number
  pageSize?: number
}

export interface ExamSubject {
  id: string
  examId: string
  subjectId: string
  examCode: string
  subjectCode: string
  scoreStructure: string
  violationStructure: string
  startDate: string
  endDate: string
  isActive: boolean
}



export interface ViolationStructure {
  KeywordCheck: {
    Keywords: string[]
    FileExtensions: string[]
  }
  NameFormatMismatch: {
    NameFormat: string
  }
  CompilationCheck: boolean
}