import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import MedicationRequestTable from './MedicationRequestTable';
import MedicationRequestModal from './MedicationRequestModal';
import { 
  getMedicationRequests, 
  createMedicationRequest, 
  deleteMedicationRequest, 
  updateMedicationRequest 
} from '../../utils/fhirClient';

const MedicationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRequest, setEditingRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMedicationRequests();
      if (data && data.entry) {
        setRequests(data.entry.map(e => e.resource));
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching medication requests:', error);
      setError('Failed to fetch medication requests. Please try again later.');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (requestData) => {
    setIsLoading(true);
    try {
      await createMedicationRequest(requestData);
      await fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating medication request:', error);
      const errorMessage = error.response?.data?.issue?.[0]?.details?.text || 
                          'Error creating medication request';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRequest = async (requestData) => {
    setIsLoading(true);
    try {
      await updateMedicationRequest(editingRequest.id, requestData);
      setEditingRequest(null);
      await fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating medication request:', error);
      alert(error.response?.data?.issue?.[0]?.details?.text || 'Error updating medication request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    setIsLoading(true);
    try {
      await deleteMedicationRequest(id);
      await fetchRequests();
    } catch (error) {
      console.error('Error deleting medication request:', error);
      alert(error.response?.data?.issue?.[0]?.details?.text || 'Error deleting medication request');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (request) => {
    setEditingRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRequest(null);
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (request.medication?.code?.coding?.[0]?.display?.toLowerCase().includes(searchLower)) ||
      (request.subject?.display?.toLowerCase().includes(searchLower)) ||
      (request.status?.toLowerCase().includes(searchLower)) ||
      (request.id?.toLowerCase().includes(searchLower)) ||
      (request.intent?.toLowerCase().includes(searchLower)) ||
      (request.authoredOn?.toLowerCase().includes(searchLower)) ||
      (request.dosageInstruction?.[0]?.text?.toLowerCase().includes(searchLower)) ||
      (request.reason?.[0]?.concept?.coding?.[0]?.display?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Medication Requests</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            disabled={isLoading}
          >
            <Plus size={20} />
            <span>Add Prescription</span>
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
          <MedicationRequestTable 
            requests={filteredRequests}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onEdit={openEditModal}
            onDelete={handleDeleteRequest}
            isLoading={isLoading}
          />
        )}
      </div>

      <MedicationRequestModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingRequest ? handleEditRequest : handleCreateRequest}
        initialData={editingRequest}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MedicationRequests;