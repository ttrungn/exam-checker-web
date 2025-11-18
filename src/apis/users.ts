import api from './apiClient'

export interface PaginatedData<T> {
  pageIndex: number
  pageSize: number
  totalCount: number
  totalCurrentCount: number
  totalPages: number
  indexFrom: number
  items: T[]
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message: string
}

export interface GetAccountsParams {
  pageIndex?: number
  pageSize?: number
  indexFrom?: number
  email?: string
  appRoleIds?: string[]
}

export interface UserAccount {
  id: string
  email: string
  userPrincipalName: string
  displayName: string
  givenName: string
  surname: string
  jobTitle: string
  roles: string[]
}

export type GetAccountsResponse = ApiResponse<PaginatedData<UserAccount>>

export interface AppRole {
  id: string
  displayName: string
  description: string
  value: string
}

export type GetAppRolesResponse = ApiResponse<PaginatedData<AppRole>>

export interface CreateAccountParams {
  email: string
  userPrincipalName: string
  displayName: string
  initialPassword: string
  givenName: string
  surname: string
  jobTitle: string
  employeeHireDate: string
  mobilePhone: string
}

export type CreateAccountResponse = ApiResponse<UserAccount>

export interface AssignRoleParams {
  userId: string
  appRoleId: string
}

export type AssignRoleResponse = ApiResponse<any>

export const getAppRoles = async (): Promise<GetAppRolesResponse> => {
  const response = await api.get<GetAppRolesResponse>('/api/v1/accounts/roles')
  return response.data
}

export const createAccount = async (params: CreateAccountParams): Promise<CreateAccountResponse> => {
  const response = await api.post<CreateAccountResponse>('/api/v1/accounts', params)
  return response.data
}

export const assignRoleToUser = async (params: AssignRoleParams): Promise<AssignRoleResponse> => {
  const { userId, appRoleId } = params
  const response = await api.post<AssignRoleResponse>(`/api/v1/accounts/${userId}/roles/${appRoleId}`)
  return response.data
}

export const getAccounts = async (params: GetAccountsParams = {}): Promise<GetAccountsResponse> => {
  const searchParams = new URLSearchParams()

  if (params.pageIndex !== undefined) {
    searchParams.append('pageIndex', params.pageIndex.toString())
  }
  if (params.pageSize !== undefined) {
    searchParams.append('pageSize', params.pageSize.toString())
  }
  if (params.indexFrom !== undefined) {
    searchParams.append('indexFrom', params.indexFrom.toString())
  }
  if (params.email) {
    searchParams.append('email', params.email)
  }

  if (params.appRoleIds && params.appRoleIds.length > 0) {
    params.appRoleIds.forEach((roleId) => {
      searchParams.append('appRoleIds', roleId)
    })
  }

  const queryString = searchParams.toString()
  const url = queryString ? `/api/v1/accounts?${queryString}` : '/api/v1/accounts'

  const response = await api.get<GetAccountsResponse>(url)
  return response.data
}

export const getExaminers = async (email?: string): Promise<GetAccountsResponse> => {
  const searchParams = new URLSearchParams()

  searchParams.append('pageIndex', '1')
  searchParams.append('pageSize', '50')
  searchParams.append('indexFrom', '1')

  if (email) {
    searchParams.append('email', email)
  }

  const queryString = searchParams.toString()
  const url = `/api/v1/accounts/examiners?${queryString}`

  const response = await api.get<GetAccountsResponse>(url)
  return response.data
}
