import React, { useState, useEffect } from 'react';
import PatientSearch from './PatientSearch';

const MedicationRequestModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    status: 'active',
    intent: 'order',
    medicationCode: '',
    medicationDisplay: '',
    authoredOn: new Date().toISOString().split('T')[0],
    dosageText: '',
    frequency: '1',
    period: '1',
    periodUnit: 'd',
    when: 'MORN',
    routeCode: '26643006',
    routeDisplay: 'Oral Route',
    doseValue: '1',
    doseUnit: 'TAB',
    quantity: '30',
    reasonCode: '',
    reasonDisplay: ''
  });

  const [errors, setErrors] = useState({});
  const isEditMode = !!initialData;

  // Predefined medication options
  const medications = [
    { code: '430127000', display: 'Oral Form Oxycodone' },
    { code: '318272009', display: 'Oral Form Paracetamol' },
    { code: '374350002', display: 'Oral Form Ibuprofen' }
  ];

  // Predefined reason options
  const reasons = [
    { code: '297217002', display: 'Rib Pain' },
    { code: '161891005', display: 'Back Pain' },
    { code: '57676002', display: 'Joint Pain' }
  ];

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        patientId: initialData.subject.reference.split('/')[1],
        patientName: initialData.subject.display,
        status: initialData.status || 'active',
        intent: initialData.intent || 'order',
        medicationCode: initialData.medication?.code?.coding?.[0]?.code || '',
        medicationDisplay: initialData.medication?.code?.coding?.[0]?.display || '',
        authoredOn: initialData.authoredOn,
        dosageText: initialData.dosageInstruction?.[0]?.text || '',
        frequency: initialData.dosageInstruction?.[0]?.timing?.repeat?.frequency || '1',
        period: initialData.dosageInstruction?.[0]?.timing?.repeat?.period || '1',
        periodUnit: initialData.dosageInstruction?.[0]?.timing?.repeat?.periodUnit || 'd',
        when: initialData.dosageInstruction?.[0]?.timing?.repeat?.when?.[0] || 'MORN',
        routeCode: initialData.dosageInstruction?.[0]?.route?.coding?.[0]?.code || '26643006',
        routeDisplay: initialData.dosageInstruction?.[0]?.route?.coding?.[0]?.display || 'Oral Route',
        doseValue: initialData.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value || '1',
        doseUnit: initialData.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.code || 'TAB',
        quantity: initialData.dispenseRequest?.quantity?.value || '30',
        reasonCode: initialData.reason?.[0]?.concept?.coding?.[0]?.code || '',
        reasonDisplay: initialData.reason?.[0]?.concept?.coding?.[0]?.display || ''
      });
    }
  }, [initialData, isEditMode]);

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'patientId':
        if (!value) error = 'Patient is required';
        break;
      case 'medicationCode':
        if (!value) error = 'Medication is required';
        break;
      case 'doseValue':
        if (!value || value <= 0) error = 'Dose must be greater than 0';
        break;
      case 'quantity':
        if (!value || value <= 0) error = 'Quantity must be greater than 0';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);

    // Handle medication selection
    if (name === 'medicationCode') {
      const selectedMed = medications.find(med => med.code === value);
      if (selectedMed) {
        setFormData(prev => ({
          ...prev,
          medicationCode: selectedMed.code,
          medicationDisplay: selectedMed.display
        }));
      }
    }

    // Handle reason selection
    if (name === 'reasonCode') {
      const selectedReason = reasons.find(reason => reason.code === value);
      if (selectedReason) {
        setFormData(prev => ({
          ...prev,
          reasonCode: selectedReason.code,
          reasonDisplay: selectedReason.display
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate all fields
    for (const field in formData) {
      const error = validateField(field, formData[field]);
      if (error) isValid = false;
    }

    if (isValid) {
      const request = {
        resourceType: "MedicationRequest",
        status: formData.status,
        intent: formData.intent,
        medication: {
          code: {
            coding: [{
              system: "http://snomed.info/sct",
              code: formData.medicationCode,
              display: formData.medicationDisplay
            }]
          }
        },
        subject: {
          reference: `Patient/${formData.patientId}`,
          display: formData.patientName
        },
        authoredOn: formData.authoredOn,
        dosageInstruction: [{
          text: formData.dosageText,
          timing: {
            repeat: {
              frequency: parseInt(formData.frequency),
              period: parseInt(formData.period),
              periodUnit: formData.periodUnit,
              when: [formData.when]
            }
          },
          route: {
            coding: [{
              system: "http://snomed.info/sct",
              code: formData.routeCode,
              display: formData.routeDisplay
            }]
          },
          doseAndRate: [{
            doseQuantity: {
              value: parseInt(formData.doseValue),
              unit: "Tablet",
              system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
              code: formData.doseUnit
            }
          }]
        }],
        reason: [{
          concept: {
            coding: [{
              system: "http://snomed.info/sct",
              code: formData.reasonCode,
              display: formData.reasonDisplay
            }]
          }
        }],
        dispenseRequest: {
          quantity: {
            value: parseInt(formData.quantity),
            unit: "Tablet",
            system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
            code: "TAB"
          }
        }
      };

      if (isEditMode) {
        request.id = initialData.id;
      }

      onSubmit(request);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Prescription' : 'Create Prescription'}
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
              <label className="block text-sm font-medium mb-1">Medication</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={formData.medicationCode}
                onChange={handleChange}
                name="medicationCode"
              >
                <option value="">Select Medication</option>
                {medications.map(med => (
                  <option key={med.code} value={med.code}>
                    {med.display}
                  </option>
                ))}
              </select>
              {errors.medicationCode && (
                <div className="text-red-500 text-sm mt-1">{errors.medicationCode}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={formData.status}
                onChange={handleChange}
                name="status"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="stopped">Stopped</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prescription Date</label>
              <input
                type="date"
                required
                className="w-full p-2 border rounded"
                value={formData.authoredOn}
                onChange={handleChange}
                name="authoredOn"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dosage Instructions</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.dosageText}
              onChange={handleChange}
              name="dosageText"
              placeholder="e.g., Take one tablet daily in the morning"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-2 border rounded"
                value={formData.frequency}
                onChange={handleChange}
                name="frequency"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period</label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-2 border rounded"
                value={formData.period}
                onChange={handleChange}
                name="period"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">When</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={formData.when}
                onChange={handleChange}
                name="when"
              >
                <option value="MORN">Morning</option>
                <option value="NOON">Noon</option>
                <option value="EVE">Evening</option>
                <option value="NIGHT">Night</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dose Amount</label>
              <input
                type="number"
                required
                min="0.5"
                step="0.5"
                className="w-full p-2 border rounded"
                value={formData.doseValue}
                onChange={handleChange}
                name="doseValue"
              />
              {errors.doseValue && (
                <div className="text-red-500 text-sm mt-1">{errors.doseValue}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity to Dispense</label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-2 border rounded"
                value={formData.quantity}
                onChange={handleChange}
                name="quantity"
              />
              {errors.quantity && (
                <div className="text-red-500 text-sm mt-1">{errors.quantity}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <select
              required
              className="w-full p-2 border rounded"
              value={formData.reasonCode}
              onChange={handleChange}
              name="reasonCode"
            >
              <option value="">Select Reason</option>
              {reasons.map(reason => (
                <option key={reason.code} value={reason.code}>
                  {reason.display}
                </option>
              ))}
            </select>
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
              {isEditMode ? 'Update Prescription' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicationRequestModal;