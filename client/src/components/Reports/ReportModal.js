import React, { useState, useEffect } from 'react';
import { getPatients } from '../../utils/fhirClient';
import PatientSearch from './PatientSearch';

const ReportModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctorName: '',
    date: new Date().toISOString().split('T')[0],
    spineScore: '',
    spineInterpretation: '',
    femurScore: '',
    femurInterpretation: '', 
    comments: ''
  });
  const [errors, setErrors] = useState({
    patientId: '',
    doctorName: '',
    spineScore: '',
    spineInterpretation: '',
    femurScore: '',
    femurInterpretation: '',
    comments: ''
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        patientId: initialData.subject.reference.split('/')[1],
        patientName: initialData.subject.display,
        doctorName: initialData.performer[0].display,
        spineScore: initialData.contained[0].valueQuantity.value,
        spineInterpretation: initialData.contained[0].interpretation.text,
        femurScore: initialData.contained[1].valueQuantity.value,
        femurInterpretation: initialData.contained[1].interpretation.text,
        comments: initialData.comment || ''
      });
    } else if (!isOpen) {
      setFormData({
        patientId: '',
        patientName: '',
        doctorName: '',
        date: new Date().toISOString().split('T')[0],
        spineScore: '',
        spineInterpretation: '',
        femurScore: '',
        femurInterpretation: '',
        comments: ''
      });
    }
  }, [initialData, isOpen, isEditMode]);

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'patientId':
        if (!value) {
          error = 'Patient is required';
        }
        break;
      case 'doctorName':
        const doctorNameRegex = /^[a-zA-Z\s]+$/;
        if (!doctorNameRegex.test(value.trim())) {
          error = 'Doctor name must contain only alphabetic characters';
        }
        break;
      case 'spineScore':
        if (!value || isNaN(parseFloat(value))) {
          error = 'Spine score must be a number';
        }
        break;
      case 'spineInterpretation':
        if (!value) {
          error = 'Spine interpretation is required';
        }
        break;
      case 'femurScore':
        if (!value || isNaN(parseFloat(value))) {
          error = 'Femur score must be a number';
        }
        break;
      case 'femurInterpretation':
        if (!value) {
          error = 'Femur interpretation is required';
        }
        break;
      case 'comments':
     
        break;
      default:
        break;
    }
    setErrors({ ...errors, [field]: error });
    return error;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;

    
    for (const field in formData) {
      const error = validateField(field, formData[field]);
      if (error) {
        isValid = false;
      }
    }

    if (isValid) {
      const report = {
        resourceType: "DiagnosticReport",
        status: "final",
        code: {
          coding: [{
            system: "http://loinc.org",
            code: "38269-7",
            display: "DXA BONE DENSITOMETRY"
          }],
          text: "DXA Bone Densitometry"
        },
        subject: {
          reference: `Patient/${formData.patientId}`,
          display: formData.patientName
        },
        effectiveDateTime: isEditMode ? initialData.effectiveDateTime : formData.date,
        performer: [{
          display: formData.doctorName
        }],
        result: [
          {
            reference: "Observation/bmd-001",
            display: "AP Spine"
          },
          {
            reference: "Observation/bmd-002",
            display: "Left Femur"
          }
        ],
        contained: [
          {
            resourceType: "Observation",
            id: "bmd-001",
            code: { text: "AP Spine" },
            valueQuantity: {
              value: parseFloat(formData.spineScore),
              unit: "T-score"
            },
            interpretation: { text: formData.spineInterpretation }
          },
          {
            resourceType: "Observation",
            id: "bmd-002",
            code: { text: "Left Femur" },
            valueQuantity: {
              value: parseFloat(formData.femurScore),
              unit: "T-score"
            },
            interpretation: { text: formData.femurInterpretation }
          }
        ],
        comment: formData.comments
      };

      if (isEditMode) {
        report.id = initialData.id;
      }

      onSubmit(report);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Diagnostic Report' : 'Create Diagnostic Report'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient</label>
              {isEditMode ? (
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-100"
                  value={formData.patientName}
                  disabled
                />
              ) : (
                <PatientSearch 
                  onSelect={(patient) => setFormData({
                    ...formData,
                    patientId: patient.id,
                    patientName: `${patient.name[0].family}, ${patient.name[0].given[0]}`
                  })}
                />
              )}
              {errors.patientId && (
                <div className="text-red-500 text-sm mt-1">{errors.patientId}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Doctor Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.doctorName}
                onChange={handleChange}
                name="doctorName"
              />
              {errors.doctorName && (
                <div className="text-red-500 text-sm mt-1">{errors.doctorName}</div>
              )}
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full p-2 border rounded"
                value={formData.date}
                onChange={handleChange}
                name="date"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">AP Spine T-Score</label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full p-2 border rounded"
                value={formData.spineScore}
                onChange={handleChange}
                name="spineScore"
              />
              {errors.spineScore && (
                <div className="text-red-500 text-sm mt-1">{errors.spineScore}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Spine Interpretation</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={formData.spineInterpretation}
                onChange={handleChange}
                name="spineInterpretation"
              >
                <option value="">Select Interpretation</option>
                <option value="Normal">Normal</option>
                <option value="Osteopenia">Osteopenia</option>
                <option value="Osteoporosis">Osteoporosis</option>
              </select>
              {errors.spineInterpretation && (
                <div className="text-red-500 text-sm mt-1">{errors.spineInterpretation}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Left Femur T-Score</label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full p-2 border rounded"
                value={formData.femurScore}
                onChange={handleChange}
                name="femurScore"
              />
              {errors.femurScore && (
                <div className="text-red-500 text-sm mt-1">{errors.femurScore}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Femur Interpretation</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={formData.femurInterpretation}
                onChange={handleChange}
                name="femurInterpretation"
              >
                <option value="">Select Interpretation</option>
                <option value="Normal">Normal</option>
                <option value="Osteopenia">Osteopenia</option>
                <option value="Osteoporosis">Osteoporosis</option>
              </select>
              {errors.femurInterpretation && (
                <div className="text-red-500 text-sm mt-1">{errors.femurInterpretation}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comments</label>
            <textarea
              className="w-full p-2 border rounded"
              rows="3"
              value={formData.comments}
              onChange={handleChange}
              name="comments"
            />
            {errors.comments && (
              <div className="text-red-500 text-sm mt-1">{errors.comments}</div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditMode ? 'Update Report' : 'Save Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;