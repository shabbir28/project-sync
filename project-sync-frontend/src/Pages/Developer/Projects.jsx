import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiClipboard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import projectService from '../../Services/projectService';

export default function DeveloperProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching developer projects...');
      const response = await projectService.getAllProjects();
      console.log('Developer projects response:', response);
      
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
      console.error('Error fetching developer projects:', error);
      toast.error('Error fetching projects: ' + error);
      setProjects([]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">You don't have any projects assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{project.project_name}</h2>
                <p className="text-gray-600 text-sm mb-4">Team: {project.team?.team_name || 'N/A'}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">
                    Client: {project.client}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p>Tech Stack: {project.tech_stack}</p>
                  <p>Deadline: {formatDate(project.estimated_time)}</p>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex justify-between pt-4 border-t">
                  <Link
                    to={`/developer/projects/${project._id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FiEye className="mr-1" /> View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 