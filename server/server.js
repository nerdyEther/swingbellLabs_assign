const express = require('express');
const cors = require('cors');
const app = express();
const client = require('./db/index');





app.use(cors());
app.use(express.json());

app.use('/fhir/Patient', require('./routes/Patients'));
app.use('/auth', require('./routes/Authentication'));
app.use('/fhir/medication-requests', require('./routes/MedicationRequests'));



const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`FHIR server running on port ${PORT}`));