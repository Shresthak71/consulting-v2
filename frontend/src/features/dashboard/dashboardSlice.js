import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import dashboardService from "./dashboardService"

const initialState = {
  stats: null,
  trends: null,
  documentStats: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
}

// Get dashboard stats
export const getDashboardStats = createAsyncThunk("dashboard/getStats", async (_, thunkAPI) => {
  try {
    return await dashboardService.getDashboardStats()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get application trends
export const getApplicationTrends = createAsyncThunk("dashboard/getTrends", async (_, thunkAPI) => {
  try {
    return await dashboardService.getApplicationTrends()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get document stats
export const getDocumentStats = createAsyncThunk("dashboard/getDocumentStats", async (_, thunkAPI) => {
  try {
    return await dashboardService.getDocumentStats()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.stats = action.payload
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getApplicationTrends.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getApplicationTrends.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.trends = action.payload
      })
      .addCase(getApplicationTrends.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getDocumentStats.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getDocumentStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.documentStats = action.payload
      })
      .addCase(getDocumentStats.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = dashboardSlice.actions
export default dashboardSlice.reducer
