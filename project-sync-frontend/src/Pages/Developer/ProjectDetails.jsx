import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLink, FiFileText, FiUser, FiCalendar, FiCode } from 'react-icons/fi';
import { toast } from 'react-toastify';
import projectService from '../../Services/projectService';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

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
        navigate('/developer/projects');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Error: ' + error);
      navigate('/developer/projects');
    } finally {
      setLoading(false);
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
          to="/developer/projects"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/developer/projects"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Projects
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{project.project_name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'Completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {project.status}
            </span>
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
    </div>
  );
} 