import React, { useState } from 'react';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import backIcon from '../../assets/icons/white/white-back-button-icon.png';

const AccountInfo: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('Tlholo');
  const [lastName, setLastName] = useState('Tshwane');
  const [email, setEmail] = useState('tlholo@gmail.com');
  const [phone, setPhone] = useState('22030190');
  const [address, setAddress] = useState('123 Block Myself');
  const [city, setCity] = useState('Mabopane');
  const [province, setProvince] = useState('Gauteng');
  const [postal, setPostal] = useState('0190');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleEdit = () => setEditing((s) => !s);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    // persist logic can be added here
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // basic client-side check
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    // password change logic here
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Password changed (demo)');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back button + heading */}
        <div className="flex items-center mb-6">
          <button onClick={() => window.history.back()} className="mr-4">
            <img src={backIcon} alt="Back" className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-semibold">Account Information</h1>
            <p className="text-gray-200">Manage your personal information and security settings</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Profile panel */}
          <div className="bg-[#062245] bg-opacity-95 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white text-xl font-semibold">Personal Information</h2>
                <p className="text-gray-300 text-sm">Update your personal details</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="bg-[#0F51AF] text-white px-4 py-2 rounded-md text-sm hover:bg-[#0d4291] transition-colors"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-200 text-sm mb-2 block">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!editing}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="text-gray-200 text-sm mb-2 block">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!editing}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-gray-200 text-sm mb-2 block">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="text-gray-200 text-sm mb-2 block">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="text-gray-200 text-sm mb-2 block">Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!editing}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-200 text-sm mb-2 block">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!editing}
                    className="w-full px-3 py-2 rounded bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-200 text-sm mb-2 block">Province</label>
                  <input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    disabled={!editing}
                    className="w-full px-3 py-2 rounded bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-200 text-sm mb-2 block">Postal Code</label>
                  <input
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    disabled={!editing}
                    className="w-full px-3 py-2 rounded bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end">
                <button type="submit" className="bg-[#00CD07] text-white px-4 py-2 rounded-md font-medium">Save</button>
              </div>
            )}
          </div>

          {/* Change Password panel */}
          <div className="bg-[#062245] bg-opacity-95 rounded-2xl p-6 shadow-lg">
            <h3 className="text-white text-lg font-semibold mb-3">Change Password</h3>
            <p className="text-gray-300 text-sm mb-4">Update your password to keep your account secure</p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-gray-200 text-sm mb-2 block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="text-gray-200 text-sm mb-2 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="text-gray-200 text-sm mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white text-gray-900"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="bg-[#00CD07] text-black px-4 py-2 rounded-md font-semibold">Change Password</button>
              </div>
            </form>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountInfo;
