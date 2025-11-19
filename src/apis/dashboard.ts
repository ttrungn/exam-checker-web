import api from './apiClient'
import type { DashboardSummary, DashboardSummaryParams } from '../types/dashboard.dto'

// Build OData query string from params
const buildODataQuery = (params: DashboardSummaryParams = {}) => {
  const q: string[] = []

  // $filter
  const filters: string[] = []
  if (params.examCode && params.examCode.trim()) {
    const v = params.examCode.trim().replace(/'/g, "''")
    filters.push(`contains(examCode,'${v}')`)
  }
  if (params.subjectCode && params.subjectCode.trim()) {
    const v = params.subjectCode.trim().replace(/'/g, "''")
    filters.push(`contains(subjectCode,'${v}')`)
  }
  if (filters.length) q.push(`$filter=${filters.join(' and ')}`)

  // $orderby
  if (params.orderBy) q.push(`$orderby=${encodeURIComponent(params.orderBy)}`)

  // $top / $skip
  if (typeof params.top === 'number') q.push(`$top=${params.top}`)
  if (typeof params.skip === 'number') q.push(`$skip=${params.skip}`)

  return q.length ? `?${q.join('&')}` : ''
}

export const getDashboardSummary = async (
  params?: DashboardSummaryParams
): Promise<{ success: boolean; data: DashboardSummary[]; message?: string }> => {
  const query = buildODataQuery(params)
  const res = await api.get<any>(`/api/v1/dashboard/summary${query}`)
  const payload = res.data

  // Shape 1: { success:boolean, data: DashboardSummary[] }
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return {
      success: !!payload.success,
      data: Array.isArray(payload.data) ? payload.data : [],
      message: payload.message
    }
  }

  // Shape 2: raw array
  if (Array.isArray(payload)) {
    return { success: true, data: payload }
  }

  // Shape 3: single summary object
  if (payload && typeof payload === 'object' && 'examSubjectId' in payload) {
    return { success: true, data: [payload] }
  }

  return { success: false, data: [], message: 'Unexpected dashboard summary response shape' }
}
