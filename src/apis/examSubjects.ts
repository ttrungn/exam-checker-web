import api from './apiClient'

export interface ImportScoreStructureResponse {
  success: boolean
  data: any
  message: string
}

export const importScoreStructure = async (
  examSubjectId: string,
  file: File
): Promise<ImportScoreStructureResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<ImportScoreStructureResponse>(
    `/api/v1/examsubjects/${examSubjectId}/score-structure/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}
