// src/components/admin/UserForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, createUser, updateUser } from '../../services/users';
import Layout from '../Layout';

const UserForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!userId;
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    company_name: '',
    password: '',
    is_admin: false,
    is_active: true
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchUser();
    }
  }, [userId, isEditing]);

  const fetchUser = async () => {
    try {
      const data = await getUser(userId);
      setFormData({
        email: data.email,
        full_name: data.full_name,
        company_name: data.company_name || '',
        password: '', // Don't show password
        is_admin: data.is_admin,
        is_active: data.is_active
      });
      setError('');
    } catch (err) {
      setError('Failed to load user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditing) {
        // Don't send password if it's empty
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(userId, updateData);
      } else {
        await createUser(formData);
      }
      navigate('/admin/users');
    } catch (err) {
      setError(err.detail || 'Failed to save user');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEditing ? 'Edit User' : 'Create User'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {isEditing
                ? 'Update user information and permissions.'
                : 'Create a new user account.'}
            </p>
          </div>
        </div>
        
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                {error && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      disabled={isEditing}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${isEditing ? 'bg-gray-100' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                      Company name
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      id="company_name"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {isEditing ? 'New password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      required={!isEditing}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="is_admin"
                          name="is_admin"
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={formData.is_admin}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="is_admin" className="font-medium text-gray-700">
                          Admin user
                        </label>
                        <p className="text-gray-500">Grants full administrative privileges.</p>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="col-span-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            checked={formData.is_active}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="is_active" className="font-medium text-gray-700">
                            Active
                          </label>
                          <p className="text-gray-500">Deactivated users cannot log in.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
                  onClick={() => navigate('/admin/users')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UserForm;