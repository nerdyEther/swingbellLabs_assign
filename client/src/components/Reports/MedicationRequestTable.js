import React, { useState } from 'react';
import { Search, Edit, Trash, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import PrescriptionPreview from './PrescriptionPreview';

const MedicationRequestTable = ({ requests, searchTerm, onSearch, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isPrescriptionPreviewOpen, setIsPrescriptionPreviewOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleGenerateReport = (request) => {
    setSelectedPrescription(request);
    setIsPrescriptionPreviewOpen(true);
  };

 
  const getPageNumbers = () => {
    const delta = 1; 
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <PrescriptionPreview
        isOpen={isPrescriptionPreviewOpen}
        onClose={() => {
          setIsPrescriptionPreviewOpen(false);
          setSelectedPrescription(null);
        }}
        prescriptionData={selectedPrescription}
      />
      
 
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Patient Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
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
                  <div className="flex space-x-4">
                    <button
                      onClick={() => onEdit(request)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit size={18} />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleGenerateReport(request)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                    >
                      <FileText size={18} />
                      <span className="text-sm">View</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this prescription?')) {
                          onDelete(request.id);
                        }
                      }}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash size={18} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

  
      <div className="flex items-center justify-between px-6 py-3 border-t">
       
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          {getPageNumbers().map((pageNumber, index) => (
            <button
              key={index}
              onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
              className={`min-w-[32px] h-8 px-2 rounded-full ${
                pageNumber === currentPage
                  ? 'bg-blue-500 text-white'
                  : typeof pageNumber === 'number'
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'text-gray-400'
              } ${typeof pageNumber !== 'number' ? 'cursor-default' : ''}`}
              disabled={typeof pageNumber !== 'number'}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationRequestTable;