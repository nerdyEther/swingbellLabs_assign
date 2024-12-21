CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50) DEFAULT 'Patient',
  active BOOLEAN DEFAULT true,
  identifier JSONB,
  name JSONB,
  gender VARCHAR(10),
  birth_date DATE,
  telecom JSONB,
  address JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE patients ADD CONSTRAINT unique_identifier UNIQUE (id);

CREATE TABLE diagnostic_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    resource_type VARCHAR(50) DEFAULT 'DiagnosticReport',
    status VARCHAR(20) DEFAULT 'final',
    code JSONB,
    effective_date DATE NOT NULL,
    performer JSONB,
    result JSONB,
    contained JSONB,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT unique_patient_date UNIQUE (patient_id, effective_date)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS diagnostic_reports;

CREATE TABLE medication_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    resource_type VARCHAR(50) DEFAULT 'MedicationRequest',
    status VARCHAR(20) DEFAULT 'active',
    intent VARCHAR(20) DEFAULT 'order',
    medication JSONB NOT NULL,
    authored_on DATE NOT NULL,
    dosage_instruction JSONB,
    reason JSONB,
    dispense_request JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT unique_patient_medication_date UNIQUE (patient_id, authored_on)
);