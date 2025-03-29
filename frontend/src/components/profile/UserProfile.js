// src/components/profile/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/users';
import Layout from '../Layout';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setFormData({
        ...formData,
        full_name: data.full_name,
        company_name: data.company_name || ''
      });
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    // Validate passwords if the user is trying to change it
    if (formData.new_password || formData.confirm_password) {
      if (!formData.current_password) {
        setError('Current password is required to set a new password');
        setSaving(false);
        return;
      }
      
      if (formData.new_password !== formData.confirm_password) {
        setError('New passwords do not match');
        setSaving(false);
        return;
      }
    }
    
    try {
      const updateData = {
        full_name: formData.full_name,
        company_name: formData.company_name
      };
      
      // Only include password fields if the user is changing their password
      if (formData.new_password && formData.current_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }
      
      await updateProfile(updateData);
      setSuccess('Profile updated successfully');
      
      // Clear password fields
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(err.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  return (
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
            <p className="mt-1 text-sm text-gray-600">
              Update your account information and change your password.
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
                
                {success && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{success}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      disabled
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100"
                      value={userProfile?.email || ''}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Your email cannot be changed.
                    </p>
                  </div>

                  <div className="col-span-6 sm:col-span-4">
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

                  <div className="col-span-6 sm:col-span-4">
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

                  <div className="col-span-6 border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Change password</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Leave these fields blank if you don't want to change your password.
                    </p>
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                      Current password
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      id="current_password"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.current_password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                      New password
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      id="new_password"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.new_password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.confirm_password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
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
  );
};

export default UserProfile;