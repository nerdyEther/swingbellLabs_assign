import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

const PatientSearch = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('https://swingbelllabsassign-production.up.railway.app/fhir/Patient');
        const data = await response.json();
        if (data && data.entry) {
          setPatients(data.entry.map(e => e.resource));
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient => {
      const fullName = `${patient.name[0].family}, ${patient.name[0].given[0]}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
    setFilteredPatients(filtered);
  }, [search, patients]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (patient) => {
    onSelect(patient);
    setSearch(`${patient.name[0].family}, ${patient.name[0].given[0]}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border rounded"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </div>
      
      {showDropdown && filteredPatients.length > 0 && (
  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
    {filteredPatients.map(patient => (
      <div
        key={patient.id}
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        onClick={() => handleSelect(patient)}
      >
        {patient.name[0].family}, {patient.name[0].given[0]}
      </div>
    ))}
  </div>
)}
    </div>
  );
};

export default PatientSearch;