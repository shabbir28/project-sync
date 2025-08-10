import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiLink, FiFileText, FiUser, FiCalendar, FiCode, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import projectService from '../../Services/projectService';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching project details for ID:', id);
      const response = await projectService.getProjectById(id);
      console.log('Project details response:', response);
      
      if (response && response.status === 'SUCCESS' && response.project) {
        setProject(response.project);
      } else {
        console.error('Unexpected project details response format:', response);
        toast.error('Error: Failed to fetch project details');
        navigate('/manager/projects');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Error: ' + error);
      navigate('/manager/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === project.status) {
      setShowStatusDropdown(false);
      return;
    }

    try {
      setUpdatingStatus(true);
      
      // Create a simple object with just the status to update
      const updateData = { status: newStatus };
      console.log('Updating project status with:', updateData);
      
      const response = await projectService.updateProject(id, updateData);
      
      if (response && response.status === 'SUCCESS') {
        setProject({...project, status: newStatus});
        toast.success(`Project status updated to ${newStatus}`);
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update project status: ' + (error.message || error));
    } finally {
      setUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      await projectService.deleteProject(id);
      toast.success('Project deleted successfully');
      navigate('/manager/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project: ' + error);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">Project not found.</p>
        <Link
          to="/manager/projects"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link
          to="/manager/projects"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Projects
        </Link>
        <div className="flex space-x-3">
          <Link
            to={`/manager/projects/${id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiEdit2 className="mr-2" /> Edit Project
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FiTrash2 className="mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{project.project_name}</h1>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={updatingStatus}
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                  project.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'Completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {updatingStatus ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <>
                    {project.status}
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {['Active', 'Completed', 'On Hold'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          status === project.status
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Project Details</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FiUser className="mt-0.5 mr-2 text-gray-500" />
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Client</span>
                    <span className="block">{project.client}</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <FiCalendar className="mt-0.5 mr-2 text-gray-500" />
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Deadline</span>
                    <span className="block">{formatDate(project.estimated_time)}</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <FiCode className="mt-0.5 mr-2 text-gray-500" />
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Tech Stack</span>
                    <span className="block">{project.tech_stack}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Team Info</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{project.team?.team_name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{project.team?.team_designation || 'N/A'}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Links</h3>
                <ul className="space-y-2">
                  {project.project_link && (
                    <li>
                      <a
                        href={project.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FiLink className="mr-2" /> Project Link
                      </a>
                    </li>
                  )}
                  {project.documentation_link && (
                    <li>
                      <a
                        href={project.documentation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FiFileText className="mr-2" /> Documentation
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-line">{project.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">Delete Project</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this project? This action cannot be undone and all project
                        data will be permanently removed from our servers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={deleting}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deleting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : "Delete"}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 