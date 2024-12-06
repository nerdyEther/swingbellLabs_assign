const db = require('../db');
const pool = require('../db'); 

const transformToFHIR = (dbPatient) => {
  if (!dbPatient) return null;
  return {
    resourceType: 'Patient',
    id: dbPatient.id,
    name: dbPatient.name || [],
    gender: dbPatient.gender,
    telecom: dbPatient.telecom || [],
    address: dbPatient.address || []
  };
};


const getAllPatients = async () => {
  try {
    const query = 'SELECT * FROM patients ORDER BY created_at DESC';
    const { rows } = await db.query(query);
   
    return rows || [];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getPatientById = async (id) => {
  const query = 'SELECT * FROM patients WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const createPatient = async (patientData) => {
  try {
    console.log('Creating patient with data:', patientData); 

    // Validate 
    if (!patientData.name || !Array.isArray(patientData.name)) {
      throw new Error('Invalid name format');
    }

    const query = `
      INSERT INTO patients (
        resource_type,
        name,
        gender,
        telecom,
        address,
        active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      'Patient',
      JSON.stringify(patientData.name),
      patientData.gender,
      JSON.stringify(patientData.telecom || []),
      JSON.stringify(patientData.address || []),
      true
    ];


    const { rows } = await db.query(query, values);
  
    
    return rows[0];
  } catch (error) {

    throw error;
  }
};

const updatePatient = async (id, patientData) => {
  try {
    // Validate 
    if (!patientData.name || !Array.isArray(patientData.name)) {
      throw new Error('Invalid name format');
    }

    const query = `
      UPDATE patients 
      SET 
        name = $1,
        gender = $2,
        telecom = $3,
        address = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      JSON.stringify(patientData.name),
      patientData.gender,
      JSON.stringify(patientData.telecom || []),
      JSON.stringify(patientData.address || []),
      id
    ];

    console.log('Executing update query with values:', values);

    const { rows } = await db.query(query, values);
    
    if (rows.length === 0) {
      throw new Error('Patient not found');
    }
    
    console.log('Updated patient:', rows[0]);
    return rows[0];
  } catch (error) {
    console.error('Database error during update:', error);
    throw error;
  }
};

const deletePatient = async (id) => {
  try {
    const query = `
      DELETE FROM patients 
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      throw new Error('Patient not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Database error during delete:', error);
    throw error;
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  transformToFHIR
};