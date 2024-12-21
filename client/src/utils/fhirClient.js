import axios from 'axios';

const BASE_URL = 'https://swingbelllabsassign-production.up.railway.app/fhir';

const fhirClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const createPatient = async (patientData) => {
  try {
    const sanitizedPatient = {
      resourceType: 'Patient',
      name: [{
        use: 'official',
        family: patientData.name[0].family,
        given: patientData.name[0].given
      }],
      gender: patientData.gender,
    
      ...(patientData.telecom?.[0]?.value && {
        telecom: [{
          system: 'phone',
          value: patientData.telecom[0].value,
          use: 'home'
        }]
      }),
      ...(patientData.address?.[0]?.line?.[0] && {
        address: [{
          use: 'home',
          type: 'both',
          line: [patientData.address[0].line[0]],
          city: patientData.address[0].city || '',
          state: patientData.address[0].state || '',
          postalCode: patientData.address[0].postalCode || ''
        }]
      })
    };

    console.log('Sanitized patient data:', sanitizedPatient);

    const response = await fhirClient.post('/Patient', sanitizedPatient);
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getPatients = async () => {
  try {
    const response = await fhirClient.get('/Patient');
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const deletePatient = async (id) => {
  try {
    await fhirClient.delete(`/Patient/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

export const updatePatient = async (id, patientData) => {
  try {
    const sanitizedPatient = {
      resourceType: 'Patient',
      id: id,
      name: [{
        use: 'official',
        family: patientData.name[0].family,
        given: patientData.name[0].given
      }],
      gender: patientData.gender,
   
      ...(patientData.telecom?.[0]?.value && {
        telecom: [{
          system: 'phone',
          value: patientData.telecom[0].value,
          use: 'home'
        }]
      }),
      ...(patientData.address?.[0]?.line?.[0] && {
        address: [{
          use: 'home',
          type: 'both',
          line: [patientData.address[0].line[0]],
          city: patientData.address[0].city || '',
          state: patientData.address[0].state || '',
          postalCode: patientData.address[0].postalCode || ''
        }]
      })
    };

    console.log('Updating patient with data:', sanitizedPatient);
    
    const response = await fhirClient.put(`/Patient/${id}`, sanitizedPatient);
    return response.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Get all medication requests
export const getMedicationRequests = async () => {
  try {
    const response = await fhirClient.get('/medication-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching medication requests:', error);
    throw error;
  }
};

// Create a new medication request
export const createMedicationRequest = async (requestData) => {
  try {
    // Ensure the request data follows FHIR MedicationRequest structure
    const sanitizedRequest = {
      resourceType: 'MedicationRequest',
      status: requestData.status || 'active',
      intent: requestData.intent || 'order',
      medication: requestData.medication,
      subject: requestData.subject,
      authoredOn: requestData.authoredOn || new Date().toISOString().split('T')[0],
      dosageInstruction: requestData.dosageInstruction || [],
      reason: requestData.reason || [],
      dispenseRequest: requestData.dispenseRequest
    };

    console.log('Creating medication request with data:', sanitizedRequest);
    const response = await fhirClient.post('/medication-requests', sanitizedRequest);
    return response.data;
  } catch (error) {
    console.error('Error creating medication request:', error);
    throw error;
  }
};

// Get a single medication request
export const getMedicationRequest = async (id) => {
  try {
    const response = await fhirClient.get(`/medication-requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medication request:', error);
    throw error;
  }
};

// Update medication request
export const updateMedicationRequest = async (id, requestData) => {
  try {
    const sanitizedRequest = {
      resourceType: 'MedicationRequest',
      id: id,
      status: requestData.status || 'active',
      intent: requestData.intent || 'order',
      medication: requestData.medication,
      subject: requestData.subject,
      authoredOn: requestData.authoredOn,
      dosageInstruction: requestData.dosageInstruction || [],
      reason: requestData.reason || [],
      dispenseRequest: requestData.dispenseRequest
    };

    console.log('Updating medication request with data:', sanitizedRequest);
    const response = await fhirClient.put(`/medication-requests/${id}`, sanitizedRequest);
    return response.data;
  } catch (error) {
    console.error('Error updating medication request:', error);
    throw error;
  }
};

// Delete medication request
export const deleteMedicationRequest = async (id) => {
  try {
    await fhirClient.delete(`/medication-requests/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting medication request:', error);
    throw error;
  }
};