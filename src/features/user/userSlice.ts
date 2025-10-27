import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { UserProfileDto } from '../../models/user.dto'
import { fetchUserProfile } from './userThunk'

export type UserState = {
  profile: UserProfileDto | null
  isLoading: boolean
  error?: string | null
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null
}

const userSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    getUserState(state) {
      return state
    },
    setUserProfile(state, action: PayloadAction<UserProfileDto | null>) {
      state.profile = action.payload
    }
  },
  extraReducers: (b) => {
    b.addCase(fetchUserProfile.pending, (s) => {
      s.isLoading = true
      s.error = null
    })
      .addCase(fetchUserProfile.fulfilled, (s, a) => {
        s.isLoading = false
        s.profile = a.payload
      })
      .addCase(fetchUserProfile.rejected, (s, a) => {
        s.isLoading = false
        s.profile = null
        s.error = (a.payload as string) ?? 'Failed to fetch user profile'
      })
  }
})

export const { getUserState, setUserProfile } = userSlice.actions
export default userSlice.reducer
