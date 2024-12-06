import React, { useState, useEffect } from 'react';

const PatientModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    familyName: '',
    givenName: '',
    gender: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState({
    familyName: '',
    givenName: '',
    gender: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });


  useEffect(() => {
    if (initialData) {

      setFormData({
        familyName: initialData.name?.[0]?.family || '',
        givenName: initialData.name?.[0]?.given?.[0] || '',
        gender: initialData.gender || '',
        phone: initialData.telecom?.[0]?.value || '',
        street: initialData.address?.[0]?.line?.[0] || '',
        city: initialData.address?.[0]?.city || '',
        state: initialData.address?.[0]?.state || '',
        postalCode: initialData.address?.[0]?.postalCode || ''
      });
    } else {
      // Reset  when creating a new patient
      setFormData({
        familyName: '',
        givenName: '',
        gender: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: ''
      });
    }
  }, [initialData, isOpen]);

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'familyName':
        if (!value.trim()) {
          error = 'Family name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Family name must contain only alphabetic characters';
        }
        break;
      case 'givenName':
        if (!value.trim()) {
          error = 'Given name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Given name must contain only alphabetic characters';
        }
        break;
      case 'gender':
        if (!value) {
          error = 'Gender is required';
        } else if (!['male', 'female', 'other'].includes(value)) {
          error = 'Invalid gender value';
        }
        break;
      case 'phone':
        if (value && !/^\+?\d{1,2}?[-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/.test(value)) {
          error = 'Invalid phone number format';
        }
        break;
      case 'street':
        if (!value.trim()) {
          error = 'Street is required';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        }
        break;
      case 'state':
        if (!value.trim()) {
          error = 'State is required';
        }
        break;
      case 'postalCode':
        if (!value.trim()) {
          error = 'Postal code is required';
        }
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

    // Validate all fields
    for (const field in formData) {
      const error = validateField(field, formData[field]);
      if (error) {
        isValid = false;
      }
    }

    if (isValid) {
      // Format data in FHIR structure
      const fhirPatient = {
        resourceType: 'Patient',
        name: [{
          use: 'official',
          family: formData.familyName,
          given: [formData.givenName]
        }],
        gender: formData.gender,
        telecom: formData.phone ? [{
          system: 'phone',
          value: formData.phone,
          use: 'home'
        }] : [],
        address: [{
          use: 'home',
          type: 'both',
          line: [formData.street],
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode
        }]
      };

      console.log('Submitting FHIR formatted patient:', fhirPatient);
      onSubmit(fhirPatient);
      onClose();
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Patient' : 'Add New Patient'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Family Name</label>
              <input
                type="text"
                required
                className={`w-full p-2 border rounded ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={formData.familyName}
                onChange={handleChange}
                name="familyName"
                disabled={!!initialData}
                readOnly={!!initialData}
              />
              {errors.familyName && (
                <div className="text-red-500 text-sm mt-1">{errors.familyName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Given Name</label>
              <input
                type="text"
                required
                className={`w-full p-2 border rounded ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={formData.givenName}
                onChange={handleChange}
                name="givenName"
                disabled={!!initialData}
                readOnly={!!initialData}
              />
              {errors.givenName && (
                <div className="text-red-500 text-sm mt-1">{errors.givenName}</div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              required
              className="w-full p-2 border rounded"
              value={formData.gender}
              onChange={handleChange}
              name="gender"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <div className="text-red-500 text-sm mt-1">{errors.gender}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              className={`w-full p-2 border rounded ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              name="phone"
              placeholder="Include country code (eg. +911234567899)"
              disabled={!!initialData}
              readOnly={!!initialData}
            />
            {errors.phone && (
              <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              placeholder="Street"
              value={formData.street}
              onChange={handleChange}
              name="street"
            />
            {errors.street && (
              <div className="text-red-500 text-sm mt-1">{errors.street}</div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                className="p-2 border rounded"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                name="city"
              />
              {errors.city && (
                <div className="text-red-500 text-sm mt-1">{errors.city}</div>
              )}
              <input
                type="text"
                className="p-2 border rounded"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                name="state"
              />
              {errors.state && (
                <div className="text-red-500 text-sm mt-1">{errors.state}</div>
              )}
              <input
                type="text"
                className="p-2 border rounded"
                placeholder="ZIP"
                value={formData.postalCode}
                onChange={handleChange}
                name="postalCode"
              />
              {errors.postalCode && (
                <div className="text-red-500 text-sm mt-1">{errors.postalCode}</div>
              )}
            </div>
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
              {initialData ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;