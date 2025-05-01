import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import bulkService from "./bulkService"

const initialState = {
  importResults: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
}

// Import students
export const importStudents = createAsyncThunk("bulk/importStudents", async (formData, thunkAPI) => {
  try {
    return await bulkService.importStudents(formData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const bulkSlice = createSlice({
  name: "bulk",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
      state.importResults = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importStudents.pending, (state) => {
        state.isLoading = true
      })
      .addCase(importStudents.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.importResults = action.payload
      })
      .addCase(importStudents.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = bulkSlice.actions
export default bulkSlice.reducer
