import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import studentService from "./studentService"

const initialState = {
  students: [],
  student: null,
  studentApplications: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
}

// Get all students
export const getStudents = createAsyncThunk("students/getAll", async (_, thunkAPI) => {
  try {
    return await studentService.getStudents()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get student by ID
export const getStudentById = createAsyncThunk("students/getById", async (id, thunkAPI) => {
  try {
    return await studentService.getStudentById(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Create new student
export const createStudent = createAsyncThunk("students/create", async (studentData, thunkAPI) => {
  try {
    // Get the current user from the state
    const { user } = thunkAPI.getState().auth

    // If registered_by is not provided, use the current user's ID
    if (!studentData.registeredBy) {
      studentData.registeredBy = user.id
    }

    return await studentService.createStudent(studentData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Update student
export const updateStudent = createAsyncThunk("students/update", async ({ id, studentData }, thunkAPI) => {
  try {
    return await studentService.updateStudent(id, studentData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Delete student
export const deleteStudent = createAsyncThunk("students/delete", async (id, thunkAPI) => {
  try {
    return await studentService.deleteStudent(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get student applications
export const getStudentApplications = createAsyncThunk("students/getApplications", async (id, thunkAPI) => {
  try {
    return await studentService.getStudentApplications(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
    clearStudent: (state) => {
      state.student = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudents.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.students = action.payload
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getStudentById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getStudentById.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.student = action.payload
      })
      .addCase(getStudentById.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createStudent.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.students.push(action.payload)
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateStudent.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.student = action.payload
        state.students = state.students.map((student) =>
          student.student_id === action.payload.student_id ? action.payload : student,
        )
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteStudent.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.students = state.students.filter((student) => student.student_id !== action.meta.arg)
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getStudentApplications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getStudentApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.studentApplications = action.payload
      })
      .addCase(getStudentApplications.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearStudent } = studentSlice.actions
export default studentSlice.reducer
