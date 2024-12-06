import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ReportTable from './ReportTable';
import ReportModal from './ReportModal';
import { getReports, createReport, deleteReport, updateReport } from '../../utils/fhirClient';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReports();
      if (data && data.entry) {
        setReports(data.entry.map(e => e.resource));
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again later.');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (reportData) => {
    setIsLoading(true);
    try {
      await createReport(reportData);
      await fetchReports();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating report:', error);
      const errorMessage = error.response?.data?.issue?.[0]?.details?.text || 
                          'Error creating report';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReport = async (reportData) => {
    setIsLoading(true);
    try {
      await updateReport(editingReport.id, reportData);
      setEditingReport(null);
      await fetchReports();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating report:', error);
      alert(error.response?.data?.issue?.[0]?.details?.text || 'Error updating report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    setIsLoading(true);
    try {
      await deleteReport(id);
      await fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(error.response?.data?.issue?.[0]?.details?.text || 'Error deleting report');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
  };


  const filteredReports = reports.filter(report => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (report.code?.text?.toLowerCase().includes(searchLower)) ||
      (report.code?.coding?.[0]?.display?.toLowerCase().includes(searchLower)) ||
      (report.subject?.display?.toLowerCase().includes(searchLower)) ||
      (report.performer?.[0]?.display?.toLowerCase().includes(searchLower)) ||
      (report.status?.toLowerCase().includes(searchLower)) ||
      (report.id?.toLowerCase().includes(searchLower)) ||
      (report.category?.[0]?.coding?.[0]?.display?.toLowerCase().includes(searchLower)) ||
      (report.effectiveDateTime?.toLowerCase().includes(searchLower)) ||
      (report.conclusion?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Diagnostic Reports</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            disabled={isLoading}
          >
            <Plus size={20} />
            <span>Add Report</span>
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
          <ReportTable 
            reports={filteredReports}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onEdit={openEditModal}
            onDelete={handleDeleteReport}
            isLoading={isLoading}
          />
        )}
      </div>

      <ReportModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingReport ? handleEditReport : handleCreateReport}
        initialData={editingReport}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Reports;