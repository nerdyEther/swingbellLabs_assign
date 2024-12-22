import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const PrescriptionPreview = ({ isOpen, onClose, prescriptionData }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  useEffect(() => {
    if (isOpen && prescriptionData) {
      generatePDF();
    }
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isOpen, prescriptionData]);

  const generatePDF = () => {
    if (!prescriptionData) return;

    const doc = new jsPDF();
    let yPos = 20;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('PRESCRIPTION', 105, yPos, { align: 'center' });
    
    doc.setFillColor(178, 34, 34);
    doc.rect(0, yPos + 10, 210, 2, 'F');
    doc.setFillColor(235, 178, 137);
    doc.rect(0, yPos + 12, 210, 2, 'F');





    //  prescription info
    yPos += 15;
    doc.setFontSize(11);
    
  
    
    if (prescriptionData.authoredOn) {
      doc.text('Date:', 20, yPos + 10);
      doc.text(new Date(prescriptionData.authoredOn).toLocaleDateString(), 70, yPos + 10);
    }

    yPos += 25;

    // patient info
    doc.setFontSize(12);
    doc.text('Patient Information', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 15;

    // patient details
    doc.setFontSize(11);
    if (prescriptionData.subject?.display) {
      doc.text('Patient Name:', 20, yPos);
      doc.text(prescriptionData.subject.display, 80, yPos);
      yPos += 10;
    }

    // Medication details
    yPos += 10;
    doc.setFontSize(12);
    doc.text('Prescribed Medications', 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 15;


    doc.setFontSize(11);
    if (prescriptionData.medication?.code?.coding?.[0]?.display) {
      doc.text('Medication:', 20, yPos);
      doc.text(prescriptionData.medication.code.coding[0].display, 80, yPos);
      yPos += 8;
    }

    if (prescriptionData.dosageInstruction?.[0]) {
      const instruction = prescriptionData.dosageInstruction[0];
      
      if (instruction.text) {
        doc.text('Dosage Instruction:', 20, yPos);
        doc.text(instruction.text, 80, yPos);
        yPos += 8;
      }

      if (instruction.timing?.repeat?.frequency) {
        doc.text('Frequency:', 20, yPos);
        doc.text(`${instruction.timing.repeat.frequency} time(s) per day`, 80, yPos);
        yPos += 8;
      }

      if (instruction.timing?.repeat?.when?.[0]) {
        doc.text('Time:', 20, yPos);
        doc.text(instruction.timing.repeat.when[0], 80, yPos);
        yPos += 8;
      }
    }

    if (prescriptionData.dispenseRequest?.quantity) {
      doc.text('Quantity:', 20, yPos);
      doc.text(`${prescriptionData.dispenseRequest.quantity.value} ${prescriptionData.dispenseRequest.quantity.unit}`, 80, yPos);
      yPos += 8;
    }

    if (prescriptionData.reason?.[0]?.concept?.coding?.[0]?.display) {
      doc.text('Reason:', 20, yPos);
      doc.text(prescriptionData.reason[0].concept.coding[0].display, 80, yPos);
      yPos += 8;
    }


    yPos = 250;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;


    doc.text('Dr. Demo', 20, yPos);
    doc.text('doctor@doctor.com', 20, yPos + 8);
    


   
    const pdfBlob = doc.output('bloburl');
    setPdfBlobUrl(pdfBlob);
  };

  const handleDownload = () => {
    if (prescriptionData) {
      const fileName = `prescription_${prescriptionData.subject?.display?.replace(/\s+/g, '_') || 'unnamed'}.pdf`;
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfBlobUrl;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Prescription Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="h-[calc(90vh-140px)] w-full bg-gray-50">
          {pdfBlobUrl && (
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full border rounded-lg"
              title="Prescription PDF Preview"
            />
          )}
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPreview;