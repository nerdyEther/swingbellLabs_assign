const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { transformToFHIR } = Patient;  

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.getAllPatients();
  

    const response = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: patients.length,
      entry: patients.map(p => ({
        resource: transformToFHIR(p),
        fullUrl: `${req.baseUrl}/${p.id}`
      }))
    };
  
    res.json(response);
  } catch (error) {
  
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: 'Patient not found' }
        }]
      });
    }
    res.json(transformToFHIR(patient));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Received patient data:', req.body);

    // Basic validation
    if (!req.body.name || !req.body.name[0] || !req.body.name[0].family) {
      return res.status(400).json({
        error: 'Name is required with at least a family name'
      });
    }

    

    if (!req.body.gender) {
      return res.status(400).json({
        error: 'Gender is required'
      });
    }

    const patient = await Patient.createPatient({
      name: req.body.name,
      gender: req.body.gender,
      telecom: req.body.telecom || [],
      address: req.body.address || []
    });

    console.log('Created patient:', patient);
    const transformedPatient = transformToFHIR(patient);
    console.log('Transformed patient:', transformedPatient);

    res.status(201).json(transformedPatient);
  } catch (error) {

    if (error.code === '23505') { // Database based validation
      res.status(409).json({ error: 'A patient with this phone number already exists' });
    }
    
    console.error('Error creating patient:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('Updating patient:', req.params.id, 'with data:', req.body);

    // Basic validation
    if (!req.body.name || !req.body.name[0] || !req.body.name[0].family) {
      return res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: 'Name is required with at least a family name' }
        }]
      });
    }

    if (!req.body.gender) {
      return res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: 'Gender is required' }
        }]
      });
    }

    const patient = await Patient.updatePatient(req.params.id, {
      name: req.body.name,
      gender: req.body.gender,
      telecom: req.body.telecom || [],
      address: req.body.address || []
    });

    const transformedPatient = transformToFHIR(patient);
    console.log('Updated patient:', transformedPatient);
    
    res.json(transformedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    
    if (error.message === 'Patient not found') {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: 'Patient not found' }
        }]
      });
    }

    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'internal',
        details: { text: error.message }
      }]
    });
  }
});

//delete patient
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting patient:', req.params.id);
    
    await Patient.deletePatient(req.params.id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting patient:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: 'Patient not found' }
        }]
      });
    }

    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'internal',
        details: { text: error.message }
      }]
    });
  }
});

module.exports = router;