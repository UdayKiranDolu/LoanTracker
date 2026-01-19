import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      smsNotifications: user?.preferences?.smsNotifications ?? false
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefName = name.split('.')[1];
      setProfileData({
        ...profileData,
        preferences: {
          ...profileData.preferences,
          [prefName]: checked
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      await updateProfile(profileData);
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await updatePassword(passwordData);
      // Clear form on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
      });
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleProfileSubmit}>
            <div className="px-6 py-6 space-y-6">
              {/* User Info Card */}
              <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Preferences</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="emailNotifications"
                      name="preferences.emailNotifications"
                      type="checkbox"
                      checked={profileData.preferences.emailNotifications}
                      onChange={handleProfileChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-3 block text-sm text-gray-700">
                      Email notifications for loan reminders
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="smsNotifications"
                      name="preferences.smsNotifications"
                      type="checkbox"
                      checked={profileData.preferences.smsNotifications}
                      onChange={handleProfileChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotifications" className="ml-3 block text-sm text-gray-700">
                      SMS notifications (coming soon)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handlePasswordSubmit}>
            <div className="px-6 py-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Ensure your account is using a long, random password to stay secure.
                </p>
              </div>

              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="newPasswordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPasswordConfirm"
                    name="newPasswordConfirm"
                    type="password"
                    value={passwordData.newPasswordConfirm}
                    onChange={handlePasswordChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;