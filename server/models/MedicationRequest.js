const pool = require('../db');

const transformToFHIR = (dbRequest) => {
  if (!dbRequest) return null;
  return {
    resourceType: 'MedicationRequest',
    id: dbRequest.id,
    status: dbRequest.status || 'active',
    intent: dbRequest.intent || 'order',
    medication: dbRequest.medication,
    subject: {
      reference: `Patient/${dbRequest.patient_id}`,
      display: dbRequest.patient_display
    },
    authoredOn: dbRequest.authored_on,
    dosageInstruction: dbRequest.dosage_instruction,
    reason: dbRequest.reason,
    dispenseRequest: dbRequest.dispense_request
  };
};

const getAllRequests = async () => {
  try {
    const query = `
      SELECT 
        mr.*,
        CONCAT(
          p.name->0->>'family', 
          ', ', 
          (p.name->0->'given'->>0)
        ) as patient_display
      FROM medication_requests mr
      JOIN patients p ON mr.patient_id = p.id
      ORDER BY mr.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Database error in getAllRequests:', error);
    throw error;
  }
};

const createRequest = async (requestData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const patientId = requestData.subject.reference.split('/')[1];
    
    // Check if patient exists
    const patientCheck = await client.query(
      'SELECT id FROM patients WHERE id = $1',
      [patientId]
    );
    
    if (patientCheck.rows.length === 0) {
      throw new Error('Patient not found');
    }

    // Check for duplicate
    const duplicateCheck = await client.query(
      'SELECT id FROM medication_requests WHERE patient_id = $1 AND authored_on::date = $2::date',
      [patientId, new Date(requestData.authoredOn)]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error('A medication request already exists for this patient on this date');
    }

    // Insert request
    const insertQuery = `
      INSERT INTO medication_requests (
        patient_id,
        status,
        intent,
        medication,
        authored_on,
        dosage_instruction,
        reason,
        dispense_request
      )
      VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      patientId,
      requestData.status || 'active',
      requestData.intent || 'order',
      JSON.stringify(requestData.medication),
      new Date(requestData.authoredOn),
      JSON.stringify(requestData.dosageInstruction),
      JSON.stringify(requestData.reason),
      JSON.stringify(requestData.dispenseRequest)
    ];

    const result = await client.query(insertQuery, values);
    
    const patientQuery = await client.query(
      "SELECT name->0->>'family' as family, name->0->'given'->>0 as given FROM patients WHERE id = $1",
      [patientId]
    );

    await client.query('COMMIT');

    const request = result.rows[0];
    if (patientQuery.rows.length > 0) {
      request.patient_display = `${patientQuery.rows[0].family}, ${patientQuery.rows[0].given}`;
    }

    return transformToFHIR(request);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateRequest = async (id, requestData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkQuery = 'SELECT id, patient_id FROM medication_requests WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('Medication request not found');
    }

    const originalRequest = checkResult.rows[0];
    
    const updateQuery = `
      UPDATE medication_requests
      SET 
        status = $1,
        intent = $2,
        medication = $3,
        dosage_instruction = $4,
        reason = $5,
        dispense_request = $6
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      requestData.status || 'active',
      requestData.intent || 'order',
      JSON.stringify(requestData.medication),
      JSON.stringify(requestData.dosageInstruction),
      JSON.stringify(requestData.reason),
      JSON.stringify(requestData.dispenseRequest),
      id
    ];

    const result = await client.query(updateQuery, values);
    
    await client.query('COMMIT');
    
    const patientQuery = await client.query(
      "SELECT name->0->>'family' as family, name->0->'given'->>0 as given FROM patients WHERE id = $1",
      [originalRequest.patient_id]
    );

    const request = result.rows[0];
    if (patientQuery.rows.length > 0) {
      request.patient_display = `${patientQuery.rows[0].family}, ${patientQuery.rows[0].given}`;
    }

    return transformToFHIR(request);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteRequest = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkQuery = 'SELECT id FROM medication_requests WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('Medication request not found');
    }

    const deleteQuery = 'DELETE FROM medication_requests WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllRequests,
  createRequest,
  updateRequest,
  deleteRequest,
  transformToFHIR
};