const fs = require("fs")
const csv = require("fast-csv")
const { parse } = require("date-fns")

// Process CSV file and return array of objects
exports.processCsvFile = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    const data = []

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true, ...options }))
      .on("error", (error) => reject(error))
      .on("data", (row) => data.push(row))
      .on("end", () => {
        // Delete the temporary file
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting temporary file:", err)
        })

        resolve(data)
      })
  })
}

// Generate CSV from data
exports.generateCsv = (data, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const csvData = []

      // Add headers
      if (data.length > 0) {
        csvData.push(Object.keys(data[0]))
      }

      // Add rows
      data.forEach((item) => {
        csvData.push(Object.values(item))
      })

      // Generate CSV string
      const csvString = csvData.map((row) => row.join(",")).join("\n")

      resolve(csvString)
    } catch (error) {
      reject(error)
    }
  })
}

// Format date for CSV
exports.formatDateForCsv = (date) => {
  if (!date) return ""
  return new Date(date).toISOString().split("T")[0]
}

// Parse date from CSV
exports.parseDateFromCsv = (dateString, format = "yyyy-MM-dd") => {
  if (!dateString) return null
  try {
    return parse(dateString, format, new Date())
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error)
    return null
  }
}
