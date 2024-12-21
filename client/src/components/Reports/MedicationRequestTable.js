import React, { useState } from 'react';
import { Search, Edit, Trash, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import CommentsModal from './CommentsModal';

const MedicationRequestTable = ({ requests, searchTerm, onSearch, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedDosage, setSelectedDosage] = useState(null);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const getMedicationDisplay = (medication) => {
    return medication?.code?.coding?.[0]?.display || 'No medication specified';
  };

  const getReasonDisplay = (reason) => {
    if (!reason || reason.length === 0) return 'No reason specified';
    return reason[0]?.concept?.coding?.[0]?.display || 'No reason specified';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search prescriptions..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Patient</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Medication</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Reason</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRequests.map(request => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {request.subject.display}
                </td>
                <td className="px-6 py-4">
                  {getMedicationDisplay(request.medication)}
                </td>
                <td className="px-6 py-4">
                  {request.authoredOn ? 
                    new Date(request.authoredOn).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })
                    : 'No date available'
                  }
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    request.status === 'active' ? 'bg-green-100 text-green-800' :
                    request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'stopped' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getReasonDisplay(request.reason)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(request)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Prescription"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this prescription?')) {
                          onDelete(request.id);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Delete Prescription"
                    >
                      <Trash size={18} className="text-red-600" />
                    </button>
                    <button
                      onClick={() => setSelectedDosage({
                        instructions: request.dosageInstruction,
                        patientName: request.subject.display,
                        medication: getMedicationDisplay(request.medication)
                      })}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View Dosage Instructions"
                    >
                      <MessageCircle size={18} className="text-green-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center p-4">
        <div className="btn-group">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-l-md bg-white text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => currentPage - 2 + i + 1)
            .filter(page => page > 0 && page <= totalPages)
            .map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-4 py-2 border ${
                  pageNumber === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-r-md bg-white text-gray-600 hover:bg-gray-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <CommentsModal
        isOpen={!!selectedDosage}
        onClose={() => setSelectedDosage(null)}
        title={`Dosage Instructions for ${selectedDosage?.medication}`}
        comment={selectedDosage?.instructions?.[0]?.text || 'No dosage instructions available'}
        patientName={selectedDosage?.patientName}
      />
    </div>
  );
};

export default MedicationRequestTable;