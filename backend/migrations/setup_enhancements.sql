-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    entity_id INT NULL,
    entity_type VARCHAR(50) NULL,
    branch_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- Create audit_logs table for tracking operations
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    details JSON NULL,
    branch_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- Add expiration date fields to application_documents table if not already added
ALTER TABLE application_documents 
ADD COLUMN IF NOT EXISTS expiry_date DATE NULL,
ADD COLUMN IF NOT EXISTS expiry_notification_sent BOOLEAN DEFAULT FALSE;

-- Create document_types table if not exists
CREATE TABLE IF NOT EXISTS document_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT,
    has_expiry BOOLEAN DEFAULT FALSE,
    validity_period_months INT DEFAULT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(document_id)
);

-- Insert common document types with expiry if table is empty
INSERT INTO document_types (document_id, has_expiry, validity_period_months)
SELECT document_id, 
       CASE 
           WHEN document_name LIKE '%passport%' THEN TRUE
           WHEN document_name LIKE '%medical%' THEN TRUE
           WHEN document_name LIKE '%police%' THEN TRUE
           WHEN document_name LIKE '%ielts%' THEN TRUE
           WHEN document_name LIKE '%toefl%' THEN TRUE
           ELSE FALSE
       END as has_expiry,
       CASE 
           WHEN document_name LIKE '%passport%' THEN 120 -- 10 years
           WHEN document_name LIKE '%medical%' THEN 6
           WHEN document_name LIKE '%police%' THEN 6
           WHEN document_name LIKE '%ielts%' THEN 24
           WHEN document_name LIKE '%toefl%' THEN 24
           ELSE NULL
       END as validity_period_months
FROM documents
WHERE NOT EXISTS (SELECT 1 FROM document_types WHERE document_types.document_id = documents.document_id);
