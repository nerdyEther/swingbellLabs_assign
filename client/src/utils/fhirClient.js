
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
    // all required fields are present
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

  // Get all reports
export const getReports = async () => {
    try {
      const response = await fhirClient.get('/DiagnosticReport');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  };
  
  // Create a new report
  export const createReport = async (reportData) => {
    try {
      const response = await fhirClient.post('/DiagnosticReport', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  };
  
  // Get a single report
  export const getReport = async (id) => {
    try {
      const response = await fhirClient.get(`/DiagnosticReport/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  };

  // Update report
export const updateReport = async (id, reportData) => {
    try {
      const response = await fhirClient.put(`/DiagnosticReport/${id}`, {
        ...reportData,
        id
      });
      return response.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  };
  
  // Delete report
  export const deleteReport = async (id) => {
    try {
      await fhirClient.delete(`/DiagnosticReport/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  };