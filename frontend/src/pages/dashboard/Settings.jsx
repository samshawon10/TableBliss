

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiSun, HiMoon, HiBell, HiMail, HiLogout } from 'react-icons/hi';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Delete account?',
      text: 'This action cannot be undone. All your data will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
    });
    if (result.isConfirmed) {
      try {
        await authAPI.deleteAccount();
        logout();
        Swal.fire({ icon: 'success', title: 'Account deleted', timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Failed to delete account', text: error.response?.data?.message || 'Please try again' });
      }
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

        <div className="space-y-6">
          <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <HiMoon className="w-5 h-5 text-primary-500" /> : <HiSun className="w-5 h-5 text-yellow-500" />}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode theme</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
            <div className="space-y-4">
              {[
                { icon: HiMail, label: 'Email Notifications', desc: 'Receive email updates about your reservations' },
                { icon: HiBell, label: 'Push Notifications', desc: 'Receive push notifications' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative w-12 h-6">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 transition-colors bg-gray-300 rounded-full peer-checked:bg-primary-500" />
                    <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 peer-checked:translate-x-6 transition-transform" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h2 className="mb-4 font-semibold text-red-600">Danger Zone</h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Once you delete your account, there is no going back.</p>
            <button onClick={handleDeleteAccount} className="btn-danger">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;