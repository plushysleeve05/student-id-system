import React, { useState, useEffect } from "react";
import { Loader, Edit, Trash2, Check, X } from "lucide-react";
import { useAuth } from "../Auth";
import { API_BASE_URL } from "../config";

// Import Heroicons
import {
  UserPlusIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    is_superuser: false,
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
      const tokenData = localStorage.getItem("auth_token");
      if (!tokenData) {
        throw new Error("No authentication token found");
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(`${API_BASE_URL}/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      setError("Failed to load admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "is_superuser") {
      setNewAdmin((prev) => ({ ...prev, [name]: value === "true" }));
    } else {
      setNewAdmin((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "is_superuser") {
      setEditingAdmin((prev) => ({ ...prev, [name]: value === "true" }));
    } else {
      setEditingAdmin((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const tokenData = localStorage.getItem("auth_token");
      if (!tokenData) {
        throw new Error("No authentication token found");
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAdmin),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create admin");
      }
      await fetchAdmins();
      setNewAdmin({
        username: "",
        email: "",
        password: "",
        is_superuser: false,
      });
      setSuccess("Admin created successfully");
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
    setError("");
    try {
      const tokenData = localStorage.getItem("auth_token");
      if (!tokenData) {
        throw new Error("No authentication token found");
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(`${API_BASE_URL}/users/${editingAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingAdmin),
      });
      if (!response.ok) {
        throw new Error("Failed to update admin");
      }
      await fetchAdmins();
      setEditingAdmin(null);
      setSuccess("Admin updated successfully");
    } catch (error) {
      setError("Failed to update admin");
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
    setError("");
    try {
      const tokenData = localStorage.getItem("auth_token");
      if (!tokenData) {
        throw new Error("No authentication token found");
      }
      const { token } = JSON.parse(tokenData);
      const response = await fetch(
        `${API_BASE_URL}/users/${adminToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }
      await fetchAdmins();
      setSuccess("Admin deleted successfully");
    } catch (error) {
      setError("Failed to delete admin");
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      setAdminToDelete(null);
    }
  };

  // Pagination
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-semibold text-center text-blue-600 mb-6">
        Admin Management
      </h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

      {/* Heroicons Illustration */}
      <div className="text-center mb-6">
        <UserPlusIcon className="h-24 w-24 text-blue-600 mx-auto" />
      </div>

      {user && user.is_superuser ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-center text-white-700">
            Create New Admin
          </h2>
          <form
            onSubmit={handleCreateAdmin}
            className="space-y-5 max-w-lg mx-auto p-6"
          >
            <input
              type="text"
              name="username"
              value={newAdmin.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              dark:bg-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <input
              type="email"
              name="email"
              value={newAdmin.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <input
              type="password"
              name="password"
              value={newAdmin.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <select
              name="is_superuser"
              value={newAdmin.is_superuser}
              onChange={handleInputChange}
              className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              dark:bg-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500"
              required
            >
              <option value="false">Admin</option>
              <option value="true">Super Admin</option>
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" />
              ) : (
                "Create Admin"
              )}
            </button>
          </form>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-600">
          You do not have permission to manage admins.
        </p>
      )}

      <div className="space-y-6 mt-10">
        <h2 className="text-xl font-semibold mb-4 text-center text-white-700">
          Existing Admins
        </h2>
        {isLoading ? (
          <Loader className="animate-spin mx-auto" />
        ) : (
          <ul className="space-y-5">
            {currentAdmins.map((admin) => (
              <li
                key={admin.id}
                className="flex justify-between items-center p-5 border border-gray-300 rounded-lg shadow-sm hover:shadow-md "
              >
                {editingAdmin && editingAdmin.id === admin.id ? (
                  <>
                    <input
                      type="text"
                      name="username"
                      value={editingAdmin.username}
                      onChange={handleEditInputChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <input
                      type="email"
                      name="email"
                      value={editingAdmin.email}
                      onChange={handleEditInputChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <select
                      name="is_superuser"
                      value={editingAdmin.is_superuser}
                      onChange={handleEditInputChange}
                      className="p-3 border rounded-lg dark:bg-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500"
                    >
                      <option value="false">Admin</option>
                      <option value="true">Super Admin</option>
                    </select>
                    <div>
                      <button
                        onClick={handleUpdateAdmin}
                        className="text-green-500 mr-3"
                      >
                        <Check />
                      </button>
                      <button
                        onClick={() => setEditingAdmin(null)}
                        className="text-red-500"
                      >
                        <X />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-medium">
                      {admin.username}
                    </span>
                    <div>
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="text-blue-500 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        {Array.from(
          { length: Math.ceil(admins.length / adminsPerPage) },
          (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`mx-2 px-4 py-2 border rounded-lg ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          )
        )}
      </div>

      {/* Modal Confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-100">
            <p className="text-lg mb-4 dark:text-gray-100 text-gray-800">
              Are you sure you want to delete this admin?
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={confirmDeleteAdmin}
                className="bg-red-600 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
