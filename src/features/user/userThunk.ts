import { createAsyncThunk } from '@reduxjs/toolkit'

import api from '../../apis/apiClient'
import type { UserProfileDto } from '../../models/user.dto'

interface FetchUserProfileResponse {
  success: boolean
  message: string
  data: UserProfileDto
}

export const fetchUserProfile = createAsyncThunk<UserProfileDto>(
  'userProfile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<FetchUserProfileResponse>('/v1/accounts/profile')

      if (res.status !== 200 || !res.data.success) {
        return rejectWithValue(res.data.message || 'Failed to fetch user profile')
      }

      return res.data.data
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch user profile'
      return rejectWithValue(msg)
    }
  }
)
