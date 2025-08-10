import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiAlertTriangle, FiBriefcase, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import projectService from '../../Services/projectService';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllProjects();
      
      // Check if the response is an array (direct response from backend)
      if (Array.isArray(response)) {
        setProjects(response);
      } else if (response.responseCode && response.status === 'SUCCESS' && Array.isArray(response.projects)) {
        // Handle case where response is wrapped in a standard format
        setProjects(response.projects);
      } else {
        console.error('Unexpected projects response format:', response);
        setProjects([]);
        toast.error('Error: Unexpected response format when fetching projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error fetching projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteProjectId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteProjectId) return;
    
    try {
      setDeleting(true);
      await projectService.deleteProject(deleteProjectId);
      toast.success('Project deleted successfully');
      setProjects(projects.filter(project => project._id !== deleteProjectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteProjectId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter projects based on selected status
  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter(project => project.status === filterStatus);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          to="/manager/projects/create"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Project
        </Link>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Your Projects</h2>
            <p className="mt-1 text-sm text-gray-500">View and manage all your team projects in one place.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            
            <button
              onClick={fetchProjects}
              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiRefreshCw className="mr-1.5 h-4 w-4 text-gray-500" />
              Refresh
            </button>
          </div>
        </div>
        
        {filteredProjects.length > 0 ? (
          <div className="divide-y divide-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50">
              <div className="col-span-2">Project Name</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Team</div>
              <div className="col-span-2">Tech Stack</div>
              <div className="col-span-1">Deadline</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {filteredProjects.map((project) => (
              <div key={project._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="col-span-2 flex items-center">
                  <div className="p-2 bg-blue-50 rounded-full mr-3">
                    <FiBriefcase className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="font-medium text-gray-900">
                    {project.project_name}
                  </div>
                </div>
                <div className="col-span-2 text-sm text-gray-500 flex items-center">
                  {project.client?.client_name || (typeof project.client === 'string' && project.client.length > 20 ? 'Client ID' : project.client) || 'Unknown Client'}
                </div>
                <div className="col-span-2 text-sm text-gray-500 flex items-center">{project.team?.team_name || 'Not Assigned'}</div>
                <div className="col-span-2 text-sm text-gray-500 flex items-center">{project.tech_stack}</div>
                <div className="col-span-1 text-sm text-gray-500 flex items-center">{formatDate(project.estimated_time)}</div>
                <div className="col-span-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <div className="flex justify-end space-x-2 whitespace-nowrap">
                    <Link
                      to={`/manager/projects/${project._id}`}
                      className="rounded p-1.5 bg-gray-50 text-blue-600 hover:bg-blue-50 border border-gray-200 transition-colors"
                      title="View Project Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/manager/projects/${project._id}/edit`}
                      className="rounded p-1.5 bg-gray-50 text-yellow-600 hover:bg-yellow-50 border border-gray-200 transition-colors"
                      title="Edit Project"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(project._id)}
                      className="rounded p-1.5 bg-gray-50 text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                      title="Delete Project"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="p-3 bg-blue-50 rounded-full inline-flex mx-auto mb-4">
              <FiBriefcase className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Create your first project to start tracking progress and managing tasks.
            </p>
            <div className="mt-6">
              <Link
                to="/manager/projects/create"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create Your First Project
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="bg-white px-6 py-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Delete Project</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this project? This action cannot be undone and all project
                        data will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 