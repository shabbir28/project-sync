import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBugById, updateBugStatus } from '../../Services/bugService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Spinner from '../../Components/Common/Spinner';
import Modal from '../../Components/Common/Modal';

const BugDetails = () => {
  const { bugId } = useParams();
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBugDetails();
  }, [bugId]);

  const fetchBugDetails = async () => {
    setLoading(true);
    try {
      console.log('Fetching bug details for ID:', bugId);
      const response = await getBugById(bugId);
      console.log('Bug details response:', response);

      if (response.status === 'SUCCESS') {
        setBug(response.bug);
      } else {
        toast.error(response.message || 'Failed to fetch bug details');
        console.error('Error fetching bug details:', response);
      }
    } catch (error) {
      toast.error('An error occurred while fetching bug details');
      console.error('Bug details fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      console.log('Marking bug as complete:', bugId);
      const response = await updateBugStatus(bugId, 'completed');
      console.log('Update status response:', response);

      if (response.status === 'SUCCESS') {
        toast.success('Bug marked as completed successfully');
        fetchBugDetails(); // Refresh bug data
        setShowModal(false);
      } else {
        toast.error(response.message || 'Failed to update bug status');
        console.error('Error updating bug status:', response);
      }
    } catch (error) {
      toast.error('An error occurred while updating the bug');
      console.error('Update bug error:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Bug Not Found</h2>
        <p className="mt-2 text-gray-600">The bug you're looking for does not exist or you don't have permission to view it.</p>
        <button
          onClick={() => navigate('/developer/bugs')}
          className="mt-4 flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaArrowLeft /> Go Back to Bugs
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/developer/bugs')}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          <FaArrowLeft /> Back to Bugs
        </button>
        
        {bug.status?.toLowerCase() !== 'completed' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <FaCheckCircle /> Mark as Complete
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{bug.bug_name}</h1>
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(bug.priority)}`}>
                {bug.priority?.charAt(0).toUpperCase() + bug.priority?.slice(1) || 'Unknown'}
              </span>
              {getStatusBadge(bug.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Bug Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="font-medium">{bug.project_id?.project_name || 'Unknown Project'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reported By</p>
                  <p className="font-medium">{bug.created_by?.username || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">{bug.developer_id?.username || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(bug.expected_completion_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{formatDate(bug.created_at)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Description</h3>
              <div className="p-4 bg-gray-50 rounded-lg min-h-[200px] whitespace-pre-wrap">
                {bug.bug_description || 'No description provided.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <Modal
          title="Confirm Completion"
          message="Are you sure you want to mark this bug as completed? This action will update the bug status."
          confirmText="Yes, Complete It"
          cancelText="Cancel"
          onConfirm={handleMarkAsComplete}
          onCancel={() => setShowModal(false)}
          confirmButtonClass="bg-green-600 hover:bg-green-700"
          type="success"
          icon={<FaCheckCircle className="h-6 w-6" />}
        />
      )}
    </div>
  );
};

export default BugDetails; 