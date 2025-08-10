import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiPlus, FiFilter, FiRefreshCw, FiUserCheck, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import clientService from '../../Services/clientService';

const ClientsList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [deleteClientId, setDeleteClientId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAllClients();
      setClients(response.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (clientId) => {
    setDeleteClientId(clientId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteClientId) return;
    
    try {
      await clientService.deleteClient(deleteClientId);
      toast.success('Client deleted successfully');
      // Update clients list
      setClients(clients.filter(client => client._id !== deleteClientId));
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    } finally {
      setShowDeleteModal(false);
      setDeleteClientId(null);
    }
  };

  // Filter clients based on selected type
  const filteredClients = clients.filter(client => {
    return filterType === 'all' || client.client_type === filterType;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Link
          to="/manager/clients/create"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Client
        </Link>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Your Clients</h2>
            <p className="mt-1 text-sm text-gray-500">View and manage client information for your projects.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="Local">Local</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            
            <button
              onClick={fetchClients}
              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiRefreshCw className="mr-1.5 h-4 w-4 text-gray-500" />
              Refresh
            </button>
          </div>
        </div>
        
        {filteredClients.length > 0 ? (
          <div className="divide-y divide-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50">
              <div className="col-span-3">Client Name</div>
              <div className="col-span-3">Team</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {filteredClients.map((client) => (
              <div key={client._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="col-span-3 flex items-center">
                  <div className="p-2 bg-purple-50 rounded-full mr-3">
                    <FiUserCheck className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="font-medium text-gray-900">
                    {client.client_name}
                  </div>
                </div>
                <div className="col-span-3 text-sm text-gray-500">{client.team?.team_name || 'Not Assigned'}</div>
                <div className="col-span-2 text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    client.client_type === 'Freelance' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {client.client_type}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-500">{client.source}</div>
                <div className="col-span-2 text-right">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/manager/clients/${client._id}`}
                      className="rounded p-1.5 bg-gray-50 text-blue-600 hover:bg-blue-50 border border-gray-200 transition-colors"
                      title="View Client Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/manager/clients/edit/${client._id}`}
                      className="rounded p-1.5 bg-gray-50 text-yellow-600 hover:bg-yellow-50 border border-gray-200 transition-colors"
                      title="Edit Client"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(client._id)}
                      className="rounded p-1.5 bg-gray-50 text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                      title="Delete Client"
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
            <div className="p-3 bg-purple-50 rounded-full inline-flex mx-auto mb-4">
              <FiUserCheck className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Add your first client to start managing client relationships and projects. Clients help you organize your projects more efficiently.
            </p>
            <div className="mt-6">
              <Link
                to="/manager/clients/create"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Your First Client
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
                    <h3 className="text-lg font-medium text-gray-900">Delete Client</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this client? This action cannot be undone and all related data will be permanently removed.
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
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList; 