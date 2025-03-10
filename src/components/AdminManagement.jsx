import React, { useState, useEffect } from 'react';
import { Loader, Edit, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../Auth';
import { API_BASE_URL } from '../config';

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', is_superuser: false });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage] = useState(5);

  useEffect(() => {
    if (user && user.is_superuser) {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const tokenData = localStorage.getItem('auth_token');
      if (!tokenData) {
        throw new Error('No authentication token found');
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(`${API_BASE_URL}/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      setError('Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'is_superuser') {
      setNewAdmin(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setNewAdmin(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'is_superuser') {
      setEditingAdmin(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setEditingAdmin(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const tokenData = localStorage.getItem('auth_token');
      if (!tokenData) {
        throw new Error('No authentication token found');
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create admin');
      }
      await fetchAdmins();
      setNewAdmin({ username: '', email: '', password: '', is_superuser: false });
      setSuccess('Admin created successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdmin = async (admin) => {
    setEditingAdmin(admin);
  };

  const handleUpdateAdmin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const tokenData = localStorage.getItem('auth_token');
      if (!tokenData) {
        throw new Error('No authentication token found');
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(`${API_BASE_URL}/users/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingAdmin),
      });
      if (!response.ok) {
        throw new Error('Failed to update admin');
      }
      await fetchAdmins();
      setEditingAdmin(null);
      setSuccess('Admin updated successfully');
    } catch (error) {
      setError('Failed to update admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    setAdminToDelete(admin);
    setShowConfirmModal(true);
  };

  const confirmDeleteAdmin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const tokenData = localStorage.getItem('auth_token');
      if (!tokenData) {
        throw new Error('No authentication token found');
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(`${API_BASE_URL}/users/${adminToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }
      await fetchAdmins();
      setSuccess('Admin deleted successfully');
    } catch (error) {
      setError('Failed to delete admin');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      setAdminToDelete(null);
    }
  };

  // Get current admins
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Management</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      
      {user && user.is_superuser ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Create New Admin</h2>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <input
              type="text"
              name="username"
              value={newAdmin.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={newAdmin.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              name="password"
              value={newAdmin.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
            />
            <select
              name="is_superuser"
              value={newAdmin.is_superuser}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="false">Admin</option>
              <option value="true">Super Admin</option>
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Create Admin'}
            </button>
          </form>
        </div>
      ) : (
        <p>You do not have permission to manage admins.</p>
      )}
      
      {user && user.is_superuser && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Existing Admins</h2>
          {isLoading ? (
            <Loader className="animate-spin mx-auto" />
          ) : (
            <ul className="space-y-2">
              {currentAdmins.map(admin => (
                <li key={admin.id} className="border p-2 rounded flex justify-between items-center">
                  {editingAdmin && editingAdmin.id === admin.id ? (
                    <>
                      <input
                        type="text"
                        name="username"
                        value={editingAdmin.username}
                        onChange={handleEditInputChange}
                        className="p-1 border rounded"
                      />
                      <input
                        type="email"
                        name="email"
                        value={editingAdmin.email}
                        onChange={handleEditInputChange}
                        className="p-1 border rounded"
                      />
                      <select
                        name="is_superuser"
                        value={editingAdmin.is_superuser}
                        onChange={handleEditInputChange}
                        className="p-1 border rounded"
                      >
                        <option value="false">Admin</option>
                        <option value="true">Super Admin</option>
                      </select>
                      <div>
                        <button onClick={handleUpdateAdmin} className="text-green-500 mr-2"><Check /></button>
                        <button onClick={() => setEditingAdmin(null)} className="text-red-500"><X /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{admin.username} - {admin.email} ({admin.is_superuser ? 'Super Admin' : 'Admin'})</span>
                      <div>
                        <button onClick={() => handleEditAdmin(admin)} className="text-blue-500 mr-2"><Edit /></button>
                        <button onClick={() => handleDeleteAdmin(admin)} className="text-red-500"><Trash2 /></button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-center">
            {Array.from({ length: Math.ceil(admins.length / adminsPerPage) }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <p>Are you sure you want to delete this admin?</p>
            <div className="mt-4 flex justify-end">
              <button onClick={confirmDeleteAdmin} className="bg-red-500 text-white px-4 py-2 rounded mr-2">Yes</button>
              <button onClick={() => setShowConfirmModal(false)} className="bg-gray-300 px-4 py-2 rounded">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
