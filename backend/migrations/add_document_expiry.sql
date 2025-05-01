-- Add expiration date fields to application_documents table
ALTER TABLE application_documents 
ADD COLUMN expiry_date DATE NULL,
ADD COLUMN expiry_notification_sent BOOLEAN DEFAULT FALSE;

-- Add document type table to track which documents have expiration
CREATE TABLE document_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT,
    has_expiry BOOLEAN DEFAULT FALSE,
    validity_period_months INT DEFAULT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(document_id)
);

-- Insert common document types with expiry
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
FROM documents;
