const express = require('express');
const router = express.Router();
const DiagnosticReport = require('../models/DiagnosticReport');

router.get('/', async (req, res) => {
  try {
    const reports = await DiagnosticReport.getAllReports();
    const transformedReports = reports.map(report => DiagnosticReport.transformToFHIR(report));
    
    res.json({
      resourceType: 'Bundle',
      type: 'searchset',
      total: transformedReports.length,
      entry: transformedReports.map(r => ({
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

    const report = await DiagnosticReport.createReport(req.body);
    res.status(201).json(report);
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
      const report = await DiagnosticReport.updateReport(req.params.id, req.body);
      res.json(report);
    } catch (error) {
      console.error('Error updating report:', error);
      
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
      await DiagnosticReport.deleteReport(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting report:', error);
      
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