'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit2, FiCheck, FiX, FiLock, FiEye, FiEyeOff, FiBook, FiBookOpen, FiFileText } from 'react-icons/fi';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';

interface ProfileFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isEditing?: boolean;
  type?: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  icon,
  isEditing = false,
  type = 'text',
  onSave = () => {},
  onCancel = () => {},
  onChange = () => {},
  isPassword = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(inputValue);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
      <div className="flex items-start">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-4 mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={isPassword && !showPassword ? 'password' : type}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    onChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onCancel}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-gray-900">
                {isPassword ? '••••••••' : value || 'Not provided'}
              </p>
              <button
                onClick={() => {}}
                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <FiEdit2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dob: 'January 15, 2005',
    location: 'San Francisco, CA',
    school: 'City High School',
    class: '12th Grade',
    syllabus: 'CBSE',
    bio: 'Passionate about learning and technology. Always looking for new challenges and opportunities to grow.'
  });

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setEditingField(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="md:block md:w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6">
                <Image
                  src="/images/favicon.png"
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
                <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors cursor-pointer">
                  <FiEdit2 size={16} />
                </button>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
                <p className="text-gray-600 mb-4">Premium Member</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Student
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <ProfileField
              label="Full Name"
              value={profile.name}
              icon={<FiUser />}
              isEditing={editingField === 'name'}
              onSave={(value) => handleSave('name', value)}
              onCancel={() => setEditingField(null)}
            />

            <ProfileField
              label="Email Address"
              value={profile.email}
              icon={<FiMail />}
              type="email"
              isEditing={editingField === 'email'}
              onSave={(value) => handleSave('email', value)}
              onCancel={() => setEditingField(null)}
            />

            <ProfileField
              label="Phone Number"
              value={profile.phone}
              icon={<FiPhone />}
              type="tel"
              isEditing={editingField === 'phone'}
              onSave={(value) => handleSave('phone', value)}
              onCancel={() => setEditingField(null)}
            />

            <ProfileField
              label="Date of Birth"
              value={profile.dob}
              icon={<FiCalendar />}
              type="date"
              isEditing={editingField === 'dob'}
              onSave={(value) => handleSave('dob', value)}
              onCancel={() => setEditingField(null)}
            />

            <ProfileField
              label="Location"
              value={profile.location}
              icon={<FiMapPin />}
              isEditing={editingField === 'location'}
              onSave={(value) => handleSave('location', value)}
              onCancel={() => setEditingField(null)}
            />

            <ProfileField
              label="School"
              value={profile.school}
              icon={<FiBook />}
              isEditing={editingField === 'school'}
              onSave={(value) => handleSave('school', value)}
              onCancel={() => setEditingField(null)}
            />

            <ProfileField
              label="Class"
              value={profile.class}
              icon={<FiBookOpen />}
              isEditing={editingField === 'class'}
              onSave={(value) => handleSave('class', value)}
              onCancel={() => setEditingField(null)}
            />

            <ProfileField
              label="Syllabus"
              value={profile.syllabus}
              icon={<FiFileText />}
              isEditing={editingField === 'syllabus'}
              onSave={(value) => handleSave('syllabus', value)}
              onCancel={() => setEditingField(null)}
            />

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-4 mt-1">
                  <FiUser />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Bio
                  </label>
                  {editingField === 'bio' ? (
                    <div className="space-y-2">
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingField(null)}
                          className="px-3 py-1 text-sm bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <p className="text-gray-900">{profile.bio}</p>
                      <button
                        onClick={() => setEditingField('bio')}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors ml-4 flex-shrink-0"
                      >
                        <FiEdit2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>



          {/* Danger Zone */}
          <div className="border border-red-200 bg-red-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Danger Zone</h2>
            <p className="text-red-700 mb-4">These actions are irreversible. Please be certain.</p>
            <div className="space-y-4">
              <button className="px-4 py-2 bg-white text-red-600 border border-red-300 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                Deactivate Account
              </button>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
