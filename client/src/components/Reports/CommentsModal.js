const CommentsModal = ({ isOpen, onClose, comment, patientName }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">Comments for {patientName}</h2>
          <div className="bg-gray-50 p-4 rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto">
            {comment || 'No comments available.'}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default CommentsModal;