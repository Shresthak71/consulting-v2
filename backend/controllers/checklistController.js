const pool = require("../config/db")

// @desc    Get all checklists
// @route   GET /api/checklists
// @access  Private
exports.getChecklists = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        c.*, 
        co.name as country_name,
        u.full_name as created_by_name
       FROM checklists c
       JOIN countries co ON c.country_id = co.country_id
       JOIN users u ON c.created_by = u.user_id`,
    )

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get checklist by ID
// @route   GET /api/checklists/:id
// @access  Private
exports.getChecklistById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        c.*, 
        co.name as country_name,
        u.full_name as created_by_name
       FROM checklists c
       JOIN countries co ON c.country_id = co.country_id
       JOIN users u ON c.created_by = u.user_id
       WHERE c.checklist_id = ?`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "Checklist not found" })
    }

    // Get checklist items
    const [items] = await pool.query(
      `SELECT 
        ci.*, 
        d.document_name,
        d.description
       FROM checklist_items ci
       JOIN documents d ON ci.document_id = d.document_id
       WHERE ci.checklist_id = ?`,
      [req.params.id],
    )

    const checklist = rows[0]
    checklist.items = items

    res.json(checklist)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Create a checklist
// @route   POST /api/checklists
// @access  Private/Admin
exports.createChecklist = async (req, res) => {
  try {
    const { countryId, checklistName, items } = req.body

    if (!countryId || !checklistName || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    // Start transaction
    await pool.query("START TRANSACTION")

    // Create checklist
    const [result] = await pool.query(
      "INSERT INTO checklists (country_id, checklist_name, created_by) VALUES (?, ?, ?)",
      [countryId, checklistName, req.user.user_id],
    )

    const checklistId = result.insertId

    // Add checklist items
    for (const item of items) {
      await pool.query("INSERT INTO checklist_items (checklist_id, document_id, required) VALUES (?, ?, ?)", [
        checklistId,
        item.documentId,
        item.required || true,
      ])
    }

    // Commit transaction
    await pool.query("COMMIT")

    // Get the created checklist with items
    const [checklist] = await pool.query(
      `SELECT 
        c.*, 
        co.name as country_name,
        u.full_name as created_by_name
       FROM checklists c
       JOIN countries co ON c.country_id = co.country_id
       JOIN users u ON c.created_by = u.user_id
       WHERE c.checklist_id = ?`,
      [checklistId],
    )

    const [createdItems] = await pool.query(
      `SELECT 
        ci.*, 
        d.document_name,
        d.description
       FROM checklist_items ci
       JOIN documents d ON ci.document_id = d.document_id
       WHERE ci.checklist_id = ?`,
      [checklistId],
    )

    const response = checklist[0]
    response.items = createdItems

    res.status(201).json(response)
  } catch (error) {
    // Rollback transaction on error
    await pool.query("ROLLBACK")
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update a checklist
// @route   PUT /api/checklists/:id
// @access  Private/Admin
exports.updateChecklist = async (req, res) => {
  try {
    const { checklistName, items } = req.body

    if (!checklistName || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    // Check if checklist exists
    const [checklistRows] = await pool.query("SELECT * FROM checklists WHERE checklist_id = ?", [req.params.id])

    if (checklistRows.length === 0) {
      return res.status(404).json({ message: "Checklist not found" })
    }

    // Start transaction
    await pool.query("START TRANSACTION")

    // Update checklist name
    await pool.query("UPDATE checklists SET checklist_name = ? WHERE checklist_id = ?", [checklistName, req.params.id])

    // Delete existing items
    await pool.query("DELETE FROM checklist_items WHERE checklist_id = ?", [req.params.id])

    // Add new checklist items
    for (const item of items) {
      await pool.query("INSERT INTO checklist_items (checklist_id, document_id, required) VALUES (?, ?, ?)", [
        req.params.id,
        item.documentId,
        item.required || true,
      ])
    }

    // Commit transaction
    await pool.query("COMMIT")

    // Get the updated checklist with items
    const [checklist] = await pool.query(
      `SELECT 
        c.*, 
        co.name as country_name,
        u.full_name as created_by_name
       FROM checklists c
       JOIN countries co ON c.country_id = co.country_id
       JOIN users u ON c.created_by = u.user_id
       WHERE c.checklist_id = ?`,
      [req.params.id],
    )

    const [updatedItems] = await pool.query(
      `SELECT 
        ci.*, 
        d.document_name,
        d.description
       FROM checklist_items ci
       JOIN documents d ON ci.document_id = d.document_id
       WHERE ci.checklist_id = ?`,
      [req.params.id],
    )

    const response = checklist[0]
    response.items = updatedItems

    res.json(response)
  } catch (error) {
    // Rollback transaction on error
    await pool.query("ROLLBACK")
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete a checklist
// @route   DELETE /api/checklists/:id
// @access  Private/Admin
exports.deleteChecklist = async (req, res) => {
  try {
    // Start transaction
    await pool.query("START TRANSACTION")

    // Delete checklist items
    await pool.query("DELETE FROM checklist_items WHERE checklist_id = ?", [req.params.id])

    // Delete checklist
    const [result] = await pool.query("DELETE FROM checklists WHERE checklist_id = ?", [req.params.id])

    // Commit transaction
    await pool.query("COMMIT")

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Checklist not found" })
    }

    res.json({ message: "Checklist removed" })
  } catch (error) {
    // Rollback transaction on error
    await pool.query("ROLLBACK")
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get checklist by country
// @route   GET /api/checklists/country/:id
// @access  Private
exports.getChecklistByCountry = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        c.*, 
        co.name as country_name,
        u.full_name as created_by_name
       FROM checklists c
       JOIN countries co ON c.country_id = co.country_id
       JOIN users u ON c.created_by = u.user_id
       WHERE c.country_id = ?`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "No checklists found for this country" })
    }

    // Get checklist items for each checklist
    const checklists = await Promise.all(
      rows.map(async (checklist) => {
        const [items] = await pool.query(
          `SELECT 
          ci.*, 
          d.document_name,
          d.description
         FROM checklist_items ci
         JOIN documents d ON ci.document_id = d.document_id
         WHERE ci.checklist_id = ?`,
          [checklist.checklist_id],
        )

        return {
          ...checklist,
          items,
        }
      }),
    )

    res.json(checklists)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
