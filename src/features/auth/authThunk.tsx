import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface LoginPayload {
  email: string
  password: string
}

export const login = createAsyncThunk('auth/login', async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/auth/login', payload)
    // Example backend response: { user: {...}, token: "abc" }
    return response.data
  } catch (error: any) {
    // Reject with message to handle in slice
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})
