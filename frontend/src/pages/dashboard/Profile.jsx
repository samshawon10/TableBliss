import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiUser, HiMail, HiPhone, HiCamera, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Password states
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Set password state (for social login users)
  const [setPwData, setSetPwData] = useState({ password: '', confirmPassword: '' });
  const [setPwLoading, setSetPwLoading] = useState(false);
  const [showSetPw, setShowSetPw] = useState(false);
  const [showSetPwConfirm, setShowSetPwConfirm] = useState(false);

  const isSocialLogin = user?.authProvider === 'google';
  const isEmailLogin = user?.authProvider === 'email';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authAPI.updateProfile(data);
      updateUser(res.data.data);
      Swal.fire({ icon: 'success', title: 'Profile updated!', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Update failed' });
    } finally { setIsLoading(false); }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Please select an image file' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'Image must be less than 5MB' });
      return;
    }

    setAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const avatar = event.target?.result;
        try {
          const res = await authAPI.updateProfile({ avatar });
          updateUser(res.data.data);
          Swal.fire({ icon: 'success', title: 'Avatar updated!', timer: 1500, showConfirmButton: false });
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Failed to update avatar' });
        } finally {
          setAvatarUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed to upload image' });
      setAvatarUploading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Swal.fire({ icon: 'error', title: 'Password must be at least 6 characters' });
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.updatePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire({ icon: 'success', title: 'Password updated!', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Failed to update password' });
    } finally { setPasswordLoading(false); }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (setPwData.password !== setPwData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Passwords do not match' });
      return;
    }
    if (setPwData.password.length < 6) {
      Swal.fire({ icon: 'error', title: 'Password must be at least 6 characters' });
      return;
    }
    setSetPwLoading(true);
    try {
      const res = await authAPI.setPassword({ password: setPwData.password });
      updateUser(res.data.data);
      setSetPwData({ password: '', confirmPassword: '' });
      Swal.fire({ icon: 'success', title: 'Password set successfully!', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Failed to set password' });
    } finally { setSetPwLoading(false); }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">Profile Settings</h1>

        {/* Profile Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-500">{getInitials(user?.name)}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {avatarUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HiCamera className="w-6 h-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                {user?.role && (
                  <span className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
                    {user.role.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" {...register('name', { required: 'Name is required' })} className="input-field pl-10" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={user?.email} disabled className="input-field pl-10 bg-gray-50 dark:bg-gray-700 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone</label>
              <div className="relative">
                <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="tel" {...register('phone')} className="input-field pl-10" placeholder="+1 (555) 123-4567" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Set Password Card - For social login users without password */}
        {isSocialLogin && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HiLockClosed className="w-5 h-5 text-primary-500" />
                Set Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You signed up with social login. Set a password to also log in with email and password.
              </p>
            </div>
            <form onSubmit={handleSetPassword} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showSetPw ? 'text' : 'password'}
                    value={setPwData.password}
                    onChange={(e) => setSetPwData({ ...setPwData, password: e.target.value })}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowSetPw(!showSetPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showSetPw ? <HiEyeOff className="w-5 h-5 text-gray-400" /> : <HiEye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showSetPwConfirm ? 'text' : 'password'}
                    value={setPwData.confirmPassword}
                    onChange={(e) => setSetPwData({ ...setPwData, confirmPassword: e.target.value })}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowSetPwConfirm(!showSetPwConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showSetPwConfirm ? <HiEyeOff className="w-5 h-5 text-gray-400" /> : <HiEye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={setPwLoading} className="btn-primary">
                {setPwLoading ? 'Setting...' : 'Set Password'}
              </button>
            </form>
          </div>
        )}

        {/* Change Password Card - For users with existing password */}
        {isEmailLogin && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HiLockClosed className="w-5 h-5 text-primary-500" />
                Change Password
              </h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Current Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showCurrentPw ? <HiEyeOff className="w-5 h-5 text-gray-400" /> : <HiEye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showNewPw ? <HiEyeOff className="w-5 h-5 text-gray-400" /> : <HiEye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showConfirmPw ? <HiEyeOff className="w-5 h-5 text-gray-400" /> : <HiEye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={passwordLoading} className="btn-primary">
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;