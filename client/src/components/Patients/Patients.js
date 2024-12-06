import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { createPatient, getPatients, deletePatient, updatePatient } from '../../utils/fhirClient';
import PatientTable from './PatientTable';
import PatientModal from './PatientModal';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPatients();
      if (data && data.entry) {
       
        const sortedPatients = data.entry
          .map(e => e.resource)
          .sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });
        setPatients(sortedPatients);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients. Please try again later.');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = async (patientData) => {
    setIsLoading(true);
    try {
      const response = await createPatient(patientData);
      await fetchPatients();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating patient:', error);
      const errorMessage = error.response?.data?.error || 'Error creating patient';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPatient = async (patientData) => {
    setIsLoading(true);
    try {
      await updatePatient(editingPatient.id, patientData);
      setEditingPatient(null);
      await fetchPatients();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      const errorMessage = error.response?.data?.error || 'Error updating patient';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setIsLoading(true);
      try {
        await deletePatient(id);
        await fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        const errorMessage = error.response?.data?.error || 'Error deleting patient';
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (patient.name?.[0]?.family?.toLowerCase().includes(searchLower)) ||
      (patient.name?.[0]?.given?.[0]?.toLowerCase().includes(searchLower)) ||
      (patient.identifier?.[0]?.value?.toLowerCase().includes(searchLower)) ||
      (patient.gender?.toLowerCase().includes(searchLower)) ||
      (patient.birthDate?.toLowerCase().includes(searchLower)) ||
      (patient.id?.toLowerCase().includes(searchLower))
    );
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Patients</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            disabled={isLoading}
          >
            <Plus size={20} />
            <span>Add Patient</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <PatientTable 
            patients={filteredPatients}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onEdit={openEditModal}
            onDelete={handleDeletePatient}
            isLoading={isLoading}
          />
        )}
      </div>

      <PatientModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingPatient ? handleEditPatient : handleCreatePatient}
        initialData={editingPatient}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Patients;