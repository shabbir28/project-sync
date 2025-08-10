import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import clientService from '../../Services/clientService';

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClientById(clientId);
      setClient(response.client);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Failed to load client details');
      navigate('/manager/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.deleteClient(clientId);
        toast.success('Client deleted successfully');
        navigate('/manager/clients');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-gray-600">Client not found</p>
        <button
          onClick={() => navigate('/manager/clients')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <button
              onClick={() => navigate('/manager/clients')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="mr-2" /> Back to Clients
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/manager/clients/edit/${clientId}`)}
                className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <FiEdit2 className="mr-2" /> Edit
              </button>
              <button
                onClick={handleDeleteClient}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <FiTrash2 className="mr-2" /> Delete
              </button>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{client.client_name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Team</h2>
                <p className="text-lg text-gray-700">{client.team?.team_name || 'N/A'}</p>
              </div>
              
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Client Type</h2>
                <p className="text-lg text-gray-700">{client.client_type}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Source</h2>
              <p className="text-lg text-gray-700">{client.source}</p>
            </div>
            
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Description</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{client.client_description}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">Added On</h2>
              <p className="text-gray-700">
                {new Date(client.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail; 