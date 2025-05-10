import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import documentService from "./documentService"

const initialState = {
  documents: [],
  documentTypes: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  uploadProgress: 0,
}

// Upload document
export const uploadDocument = createAsyncThunk("documents/upload", async (formData, thunkAPI) => {
  try {
    return await documentService.uploadDocument(formData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get application documents
export const getApplicationDocuments = createAsyncThunk(
  "documents/getByApplication",
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

// Update document status
export const updateDocumentStatus = createAsyncThunk(
  "documents/updateStatus",
  async ({ documentId, status }, thunkAPI) => {
    try {
      return await documentService.updateDocumentStatus(documentId, status)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

// Delete document
export const deleteDocument = createAsyncThunk("documents/delete", async (documentId, thunkAPI) => {
  try {
    return await documentService.deleteDocument(documentId)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get document types
export const getDocumentTypes = createAsyncThunk("documents/getTypes", async (_, thunkAPI) => {
  try {
    return await documentService.getDocumentTypes()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Create document type
export const createDocumentType = createAsyncThunk("documents/createType", async (documentData, thunkAPI) => {
  try {
    return await documentService.createDocumentType(documentData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Update document type
export const updateDocumentType = createAsyncThunk(
  "documents/updateType",
  async ({ documentId, documentData }, thunkAPI) => {
    try {
      return await documentService.updateDocumentType(documentId, documentData)
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
      state.uploadProgress = 0
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true
        state.uploadProgress = 0
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.uploadProgress = 100
        // Update the document in the documents array if it exists
        const index = state.documents.findIndex(
          (doc) => doc.application_id === action.payload.applicationId && doc.document_id === action.payload.documentId,
        )
        if (index !== -1) {
          state.documents[index] = {
            ...state.documents[index],
            file_path: action.payload.filePath,
            status: "pending",
            uploaded_at: new Date().toISOString(),
          }
        } else {
          state.documents.push({
            application_id: action.payload.applicationId,
            document_id: action.payload.documentId,
            file_path: action.payload.filePath,
            status: "pending",
            uploaded_at: new Date().toISOString(),
          })
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
        state.uploadProgress = 0
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
      .addCase(updateDocumentStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Update the document status in the documents array
        state.documents = state.documents.map((doc) =>
          doc.app_doc_id === action.meta.arg.documentId ? { ...doc, status: action.meta.arg.status } : doc,
        )
      })
      .addCase(updateDocumentStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.documents = state.documents.filter((doc) => doc.app_doc_id !== action.meta.arg)
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getDocumentTypes.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getDocumentTypes.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.documentTypes = action.payload
      })
      .addCase(getDocumentTypes.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createDocumentType.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createDocumentType.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.documentTypes.push(action.payload)
      })
      .addCase(createDocumentType.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateDocumentType.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateDocumentType.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.documentTypes = state.documentTypes.map((type) =>
          type.document_id === action.payload.document_id ? action.payload : type,
        )
      })
      .addCase(updateDocumentType.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, setUploadProgress } = documentSlice.actions
export default documentSlice.reducer
