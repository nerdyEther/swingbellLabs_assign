import React, { useState } from 'react';
import { Edit, Trash, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const PatientTable = ({ patients, onSearch, searchTerm, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = patients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(patients.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search patients..."
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Gender</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Address</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map(patient => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {patient.name[0].family}, {patient.name[0].given?.[0]}
                </td>
                <td className="px-6 py-4 capitalize">{patient.gender}</td>
                <td className="px-6 py-4">{patient.telecom?.[0]?.value}</td>
                <td className="px-6 py-4">
                  {patient.address?.[0]?.line?.[0]}, {patient.address?.[0]?.city}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEdit(patient)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button 
                      onClick={() => onDelete(patient.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Trash size={18} className="text-red-600" />
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

export default PatientTable;