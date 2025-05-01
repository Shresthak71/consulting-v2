import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import documentService from "./documentService"

const initialState = {
  documents: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
  expiringDocuments: [],
}

// Upload document
export const uploadDocument = createAsyncThunk(
  "document/upload",
  async ({ applicationId, documentId, formData }, thunkAPI) => {
    try {
      return await documentService.uploadDocument(applicationId, documentId, formData)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

// Update document status
export const updateDocumentStatus = createAsyncThunk(
  "document/updateStatus",
  async ({ appDocId, status }, thunkAPI) => {
    try {
      return await documentService.updateDocumentStatus(appDocId, status)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

// Get application documents
export const getApplicationDocuments = createAsyncThunk(
  "document/getApplicationDocuments",
  async (applicationId, thunkAPI) => {
    try {
      return await documentService.getApplicationDocuments(applicationId)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

// Get expiring documents
export const getExpiringDocuments = createAsyncThunk(
  "document/getExpiringDocuments",
  async ({ days, branchId }, thunkAPI) => {
    try {
      let url = `/documents/expiring?days=${days || 30}`
      if (branchId) url += `&branchId=${branchId}`

      return await documentService.getExpiringDocuments(url)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

// Update document expiry date
export const updateExpiryDate = createAsyncThunk(
  "document/updateExpiryDate",
  async ({ appDocId, expiryDate }, thunkAPI) => {
    try {
      return await documentService.updateExpiryDate(appDocId, expiryDate)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

export const documentSlice = createSlice({
  name: "document",
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
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateDocumentStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(updateDocumentStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getApplicationDocuments.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getApplicationDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.documents = action.payload
      })
      .addCase(getApplicationDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getExpiringDocuments.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getExpiringDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.expiringDocuments = action.payload
      })
      .addCase(getExpiringDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateExpiryDate.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateExpiryDate.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(updateExpiryDate.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = documentSlice.actions
export default documentSlice.reducer
