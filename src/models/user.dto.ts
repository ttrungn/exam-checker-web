import type { Role } from '../constants/auth'

export interface ObjectIdentityDto {
  signInType?: string | null
  issuer?: string | null
  issuerAssignedId?: string | null
}
export interface AuthorizationInfoDto {
  certificateUserIds: string[]
}
export interface ManagerDto {
  id?: string | null
  displayName?: string | null
  email?: string | null
}
export interface AppRoleDto {
  id: string
  value: Role
  displayName: string
}

export interface UserProfileDto {
  id?: string | null
  identities: ObjectIdentityDto[]
  givenName?: string | null
  surname?: string | null
  userType?: string | null
  authorizationInfo: AuthorizationInfoDto | null
  jobTitle?: string | null
  companyName?: string | null
  department?: string | null
  employeeId?: string | null
  employeeType?: string | null
  employeeHireDate?: string | null
  officeLocation?: string | null
  manager: ManagerDto | null
  streetAddress?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  businessPhones: string[]
  mobilePhone?: string | null
  email?: string | null
  otherEmails: string[]
  faxNumber?: string | null
  ageGroup?: string | null
  consentProvidedForMinor?: string | null
  usageLocation?: string | null
  roles: AppRoleDto[]
}
