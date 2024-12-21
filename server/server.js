const express = require('express');
const cors = require('cors');
const app = express();
const client = require('./db/index');

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    resourceType: 'OperationOutcome',
    issue: [{
      severity: 'error',
      code: 'internal',
      details: { text: err.message }
    }]
  });
});

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use('/fhir/Patient', require('./routes/Patients'));
app.use('/auth', require('./routes/Authentication'));
app.use('/fhir/medication-requests', require('./routes/MedicationRequests'));

// Add a test endpoint
app.get('/fhir/test', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`FHIR server running on port ${PORT}`));