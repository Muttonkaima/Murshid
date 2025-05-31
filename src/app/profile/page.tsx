'use client';

import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit2, FiLock, FiX, FiBook, FiBookOpen, FiFileText, FiSave, FiImage, FiTrash } from 'react-icons/fi';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';

type ProfileField = {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  type?: string;
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [profileImage, setProfileImage] = useState('/images/favicon.png');
  
  const [profile, setProfile] = useState<ProfileField[]>([
    { id: 'name', label: 'Full Name', value: 'John Doe', icon: <FiUser /> },
    { id: 'email', label: 'Email', value: 'john.doe@example.com', icon: <FiMail />, type: 'email' },
    { id: 'gender', label: 'Gender', value: 'Male', icon: <FiPhone />, type: 'tel' },
    { id: 'dob', label: 'Date of Birth', value: '1990-01-01', icon: <FiCalendar />, type: 'date' },
    { id: 'profileType', label: 'Profile Type', value: 'Student', icon: <FiMapPin /> },
    { id: 'school', label: 'School', value: 'Prerana Institute', icon: <FiBook /> },
    { id: 'class', label: 'Class', value: '12th Grade', icon: <FiBookOpen /> },
    { id: 'syllabus', label: 'Syllabus', value: 'CBSE', icon: <FiFileText /> },
  ]);

  const [bio, setBio] = useState('Passionate about learning and technology. Always looking for new challenges and opportunities to grow.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');

  const startEditing = (id: string, value: string) => {
    setIsEditing(id);
    setTempValue(value);
  };

  const saveEdit = () => {
    if (isEditing) {
      setProfile(profile.map(field => 
        field.id === isEditing ? { ...field, value: tempValue } : field
      ));
      setIsEditing(null);
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditingBio = () => {
    setTempBio(bio);
    setIsEditingBio(true);
  };

  const saveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
  };

  const cancelBioEdit = () => {
    setIsEditingBio(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className="md:block md:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative group mb-6 md:mb-0 md:mr-8">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all transform hover:scale-110 shadow-md cursor-pointer">
                  <FiImage size={18} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Mithun</h1>
                <p className="text-blue-500 font-medium mb-4">mithun@gmail.com</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {profile.map((field) => (
              <div 
                key={field.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-green-100 text-[var(--primary-color)] mr-4">
                    {field.icon}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {field.label}
                    </label>
                    {isEditing === field.id ? (
                      <div className="space-y-2">
                        <input
                          type={field.type || 'text'}
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:border-transparent"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 text-sm bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] hover:text-white transition-colors flex items-center cursor-pointer"
                          >
                            <FiSave className="mr-1" size={14} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center group">
                        <p className="text-gray-900">
                          {field.value || 'Not provided'}
                        </p>
                        <button
                          onClick={() => startEditing(field.id, field.value)}
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-100 hover:text-blue-600 transition-colors text-blue-400 md:opacity-0 group-hover:opacity-100 cursor-pointer"
                          aria-label={`Edit ${field.label}`}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">About Me</h2>
              {!isEditingBio && (
                <button
                  onClick={startEditingBio}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                  aria-label="Edit bio"
                >
                  <FiEdit2 size={18} />
                </button>
              )}
            </div>
            
            {isEditingBio ? (
              <div className="space-y-4">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:border-transparent min-h-[120px]"
                  autoFocus
                />
                <div className="flex space-x-3">
                  <button
                    onClick={saveBio}
                    className="px-4 py-2 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center cursor-pointer"
                  >
                    <FiSave className="mr-2" size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={cancelBioEdit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {bio || 'No bio provided. Click the edit button to add one.'}
              </p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-gradient-to-r from-red-50 to-red-50/80 border border-red-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-xl font-semibold text-red-800 mb-3">Danger Zone</h2>
            <p className="text-red-700 mb-6">These actions are irreversible. Please be certain.</p>
            <div className="space-y-4">
              <button className="w-full md:w-auto px-6 py-2.5 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-all hover:shadow-sm flex items-center justify-center space-x-2 cursor-pointer">
                <FiLock size={16} />
                <span>Deactivate Account</span>
              </button>
              <button className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all hover:shadow-sm flex items-center justify-center space-x-2 cursor-pointer">
                <FiTrash size={18} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
