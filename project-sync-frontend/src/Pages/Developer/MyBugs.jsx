import React, { useState, useEffect } from 'react';
import { getAssignedBugs, updateBugStatus } from '../../Services/bugService';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaExclamationTriangle, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Spinner from '../../Components/Common/Spinner';

const MyBugs = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedBugId, setExpandedBugId] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    setLoading(true);
    try {
      console.log('Fetching assigned bugs');
      const response = await getAssignedBugs();
      console.log('Assigned bugs response:', response);
      
      if (response.status === 'SUCCESS') {
        console.log('Setting bugs state with:', response.bugs);
        setBugs(response.bugs || []);
      } else {
        toast.error(response.message || 'Failed to fetch bugs');
        console.error('Error fetching bugs:', response);
      }
    } catch (error) {
      toast.error('An error occurred while fetching bugs');
      console.error('Bug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsComplete = async (bugId) => {
    if (markingComplete) return; // Prevent multiple simultaneous submissions
    
    setMarkingComplete(true);
    try {
      console.log('Marking bug as complete:', bugId);
      const response = await updateBugStatus(bugId, 'completed');
      console.log('Update status response:', response);

      if (response.status === 'SUCCESS') {
        toast.success('Bug marked as completed successfully');
        // Update the bug in the local state
        setBugs(bugs.map(bug => 
          bug._id === bugId ? { ...bug, status: 'completed' } : bug
        ));
      } else {
        toast.error(response.message || 'Failed to update bug status');
        console.error('Error updating bug status:', response);
      }
    } catch (error) {
      toast.error('An error occurred while updating the bug');
      console.error('Update bug error:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const toggleExpandBug = (bugId) => {
    setExpandedBugId(expandedBugId === bugId ? null : bugId);
  };

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = 
      bug.bug_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.bug_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.project_id?.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Assigned Bugs</h1>
        <p className="text-gray-600">View and manage all bugs assigned to you</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="text-gray-400" />
            </span>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search bugs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredBugs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? "No bugs match your current filters. Try adjusting your search or filters."
              : "You don't have any bugs assigned to you yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBugs.map(bug => (
            <div
              key={bug._id}
              className="bg-white rounded-lg shadow overflow-hidden transition"
            >
              {/* Bug Card Header */}
              <div 
                className="p-4 border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
                onClick={() => toggleExpandBug(bug._id)}
              >
                <div>
                  <h3 className="font-medium text-lg text-gray-800">{bug.bug_name}</h3>
                  <div className="mt-1 flex flex-wrap gap-2 items-center text-xs text-gray-600">
                    <span><span className="font-medium">Project: </span>{bug.project_id?.project_name || 'Unknown'}</span>
                    <span>•</span>
                    <span><span className="font-medium">Due: </span>{formatDate(bug.expected_completion_date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-2">
                    {getPriorityBadge(bug.priority)}
                    {getStatusBadge(bug.status)}
                  </div>
                  {expandedBugId === bug._id ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
                </div>
              </div>
              
              {/* Expanded Bug Details */}
              {expandedBugId === bug._id && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <div className="p-3 bg-white border border-gray-200 rounded-md whitespace-pre-wrap text-gray-700">
                      {bug.bug_description || 'No description provided'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Reported By</span>
                      <p className="text-sm">{bug.created_by?.username || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Created On</span>
                      <p className="text-sm">{formatDate(bug.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Due Date</span>
                      <p className="text-sm">{formatDate(bug.expected_completion_date)}</p>
                    </div>
                  </div>
                  
                  {bug.status !== 'completed' && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsComplete(bug._id);
                        }}
                        disabled={markingComplete}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaCheckCircle /> Mark as Complete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBugs; 