import React, { useState } from 'react';
import { Search, Edit, Trash, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import CommentsModal from './CommentsModal';

const ReportTable = ({ reports, searchTerm, onSearch, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  //  pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(reports.length / itemsPerPage);

  const [selectedComment, setSelectedComment] = useState(null);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search reports..."
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Doctor</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">AP Spine</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Left Femur</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentReports.map(report => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {report.subject.display}
                </td>
                <td className="px-6 py-4">
                  {report.performer[0].display}
                </td>
                <td className="px-6 py-4">
                  {report.effectiveDateTime ? 
                    new Date(report.effectiveDateTime).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })
                    : 'No date available'
                  }
                </td>
                <td className="px-6 py-4">
                  {report.contained[0].valueQuantity.value} ({report.contained[0].interpretation.text})
                </td>
                <td className="px-6 py-4">
                  {report.contained[1].valueQuantity.value} ({report.contained[1].interpretation.text})
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(report)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Report"
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this report?')) {
                          onDelete(report.id);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Delete Report"
                    >
                      <Trash size={18} className="text-red-600" />
                    </button>
                    <button
                      onClick={() => setSelectedComment({
                        comment: report.comment,
                        patientName: report.subject.display
                      })}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View Comments"
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
        isOpen={!!selectedComment}
        onClose={() => setSelectedComment(null)}
        comment={selectedComment?.comment}
        patientName={selectedComment?.patientName}
      />
    </div>
  );
};

export default ReportTable;