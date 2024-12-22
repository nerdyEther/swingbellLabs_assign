const express = require('express');
const router = express.Router();
const MedicationRequest = require('../models/MedicationRequest');




router.use((req, res, next) => {
  console.log(`[DEBUG] Medication Request Route Hit: ${req.method} ${req.path}`);
  console.log('[DEBUG] Request Headers:', req.headers);
  next();
});


router.get('/', async (req, res) => {
  try {
    const requests = await MedicationRequest.getAllRequests();
    const transformedRequests = requests.map(request => MedicationRequest.transformToFHIR(request));
    
    res.json({
      resourceType: 'Bundle',
      type: 'searchset',
      total: transformedRequests.length,
      entry: transformedRequests.map(r => ({
        resource: r,
        fullUrl: `${req.baseUrl}/${r.id}`
      }))
    });
  } catch (error) {
    console.error('Route error in GET /:', error);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'internal',
        details: { text: 'Internal server error' }
      }]
    });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.subject?.reference) {
      return res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: 'Patient reference is required' }
        }]
      });
    }

    if (!req.body.medication) {
      return res.status(400).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'invalid',
          details: { text: 'Medication information is required' }
        }]
      });
    }

    const request = await MedicationRequest.createRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    console.error('Route error in POST /:', error);

    if (error.message.includes('Patient not found')) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: error.message }
        }]
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'duplicate',
          details: { text: error.message }
        }]
      });
    }

    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'internal',
        details: { text: 'Internal server error' }
      }]
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const request = await MedicationRequest.updateRequest(req.params.id, req.body);
    res.json(request);
  } catch (error) {
    console.error('Error updating medication request:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: error.message }
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

router.delete('/:id', async (req, res) => {
  try {
    await MedicationRequest.deleteRequest(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting medication request:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          details: { text: error.message }
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