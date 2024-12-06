const pool = require('../db');

const transformToFHIR = (dbReport) => {
  if (!dbReport) return null;
  return {
    resourceType: 'DiagnosticReport',
    id: dbReport.id,
    status: dbReport.status || 'final',
    code: dbReport.code,
    subject: {
      reference: `Patient/${dbReport.patient_id}`,
      display: dbReport.patient_display
    },
    effectiveDateTime: dbReport.effective_date,
    performer: dbReport.performer,
    result: dbReport.result,
    contained: dbReport.contained,
    comment: dbReport.comment
  };
};

const getAllReports = async () => {
    try {
      const query = `
        SELECT 
          dr.*,
          CONCAT(
            p.name->0->>'family', 
            ', ', 
            (p.name->0->'given'->>0)
          ) as patient_display
        FROM diagnostic_reports dr
        JOIN patients p ON dr.patient_id = p.id
        ORDER BY dr.created_at DESC
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Database error in getAllReports:', error);
      throw error;
    }
  };
  

  const createReport = async (reportData) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
    
      const patientId = reportData.subject.reference.split('/')[1];
      
      // Check
      const patientCheck = await client.query(
        'SELECT id FROM patients WHERE id = $1',
        [patientId]
      );
      
      if (patientCheck.rows.length === 0) {
        throw new Error('Patient not found');
      }
  
      //Check
      const duplicateCheck = await client.query(
        'SELECT id FROM diagnostic_reports WHERE patient_id = $1 AND effective_date::date = $2::date',
        [patientId, new Date(reportData.effectiveDateTime)]
      );
  
      if (duplicateCheck.rows.length > 0) {
        throw new Error('A report already exists for this patient on this date');
      }
  
      // Insert 
      const insertQuery = `
        INSERT INTO diagnostic_reports (
          patient_id,
          status,
          code,
          effective_date,
          performer,
          result,
          contained,
          comment
        )
        VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8)
        RETURNING *
      `;
  
      const values = [
        patientId,
        reportData.status || 'final',
        reportData.code ? JSON.stringify(reportData.code) : null,
        new Date(reportData.effectiveDateTime),  // Properly cast date
        reportData.performer ? JSON.stringify(reportData.performer) : null,
        reportData.result ? JSON.stringify(reportData.result) : null,
        reportData.contained ? JSON.stringify(reportData.contained) : null,
        reportData.comment
      ];
  
      const result = await client.query(insertQuery, values);
      
  
      const patientQuery = await client.query(
        "SELECT name->0->>'family' as family, name->0->'given'->>0 as given FROM patients WHERE id = $1",
        [patientId]
      );
  
      await client.query('COMMIT');
  
      const report = result.rows[0];
      if (patientQuery.rows.length > 0) {
        report.patient_display = `${patientQuery.rows[0].family}, ${patientQuery.rows[0].given}`;
      }
  
      return transformToFHIR(report);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  const deleteReport = async (id) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      const checkQuery = 'SELECT id FROM diagnostic_reports WHERE id = $1';
      const checkResult = await client.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Report not found');
      }
  
      const deleteQuery = 'DELETE FROM diagnostic_reports WHERE id = $1 RETURNING *';
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
  
  const updateReport = async (id, reportData) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
   
      const checkQuery = 'SELECT id, patient_id, effective_date FROM diagnostic_reports WHERE id = $1';
      const checkResult = await client.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Report not found');
      }
  

      const originalReport = checkResult.rows[0];
      
      const updateQuery = `
        UPDATE diagnostic_reports
        SET 
          status = $1,
          performer = $2,
          contained = $3,
          comment = $4,
          code = $5,
          result = $6
        WHERE id = $7
        RETURNING *
      `;
  
      const values = [
        reportData.status || 'final',
        JSON.stringify(reportData.performer),
        JSON.stringify(reportData.contained),
        reportData.comment,
        JSON.stringify(reportData.code),
        JSON.stringify(reportData.result),
        id
      ];
  
      const result = await client.query(updateQuery, values);
      
      await client.query('COMMIT');
      
      const patientQuery = await client.query(
        "SELECT name->0->>'family' as family, name->0->'given'->>0 as given FROM patients WHERE id = $1",
        [originalReport.patient_id]
      );
  
      const report = result.rows[0];
      if (patientQuery.rows.length > 0) {
        report.patient_display = `${patientQuery.rows[0].family}, ${patientQuery.rows[0].given}`;
      }
  
      return transformToFHIR(report);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

module.exports = {
  getAllReports,
  createReport,
  deleteReport,
  updateReport,
  transformToFHIR
 
};