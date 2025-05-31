'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { FiEdit2, FiLock, FiX, FiSave, FiTrash, FiEdit, FiUpload, FiXCircle, FiCamera } from 'react-icons/fi';
import { FaUserGraduate, FaEnvelope, FaUser, FaVenusMars, FaCalendarAlt, FaGraduationCap, FaBook, FaSchool } from 'react-icons/fa';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, updateProfile, uploadProfileImage } from '@/services/profileService';
import { toast } from 'react-toastify';

type ProfileField = {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  type?: string;
  options?: string[];
};

const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('/images/favicon.png');
  
  // Dropdown visibility state
  type DropdownState = {
    gender: boolean;
    profileType: boolean;
    class: boolean;
    syllabus: boolean;
    school: boolean;
  };

  const [dropdowns, setDropdowns] = useState<DropdownState>({
    gender: false,
    profileType: false,
    class: false,
    syllabus: false,
    school: false
  });

  const [profile, setProfile] = useState<ProfileField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [bio, setBio] = useState('');
  const [tempImage, setTempImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();
        const profileData = response.profile || {};
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Transform profile data to match our form structure
        const profileFields: ProfileField[] = [
          { 
            id: 'firstName', 
            label: 'First Name', 
            value: userData.firstName || '', 
            icon: <FaUser /> 
          },
          { 
            id: 'lastName', 
            label: 'Last Name', 
            value: userData.lastName || '', 
            icon: <FaUser /> 
          },
          { 
            id: 'email', 
            label: 'Email', 
            value: userData.email || '', 
            icon: <FaEnvelope />, 
            type: 'email' 
          },
          { 
            id: 'gender', 
            label: 'Gender', 
            value: profileData.gender || '', 
            icon: <FaVenusMars />, 
            type: 'select', 
            options: ['Male', 'Female', 'Other', 'Prefer not to say'] 
          },
          { 
            id: 'dateOfBirth', 
            label: 'Date of Birth', 
            value: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '', 
            icon: <FaCalendarAlt />, 
            type: 'date' 
          },
          { 
            id: 'profileType', 
            label: 'Profile Type', 
            value: profileData.profileType || '', 
            icon: <FaUserGraduate />, 
            type: 'select', 
            options: ['Student', 'Dropout', 'Repeating Year', 'Homeschooled', 'Other'] 
          },
          { 
            id: 'school', 
            label: 'School', 
            value: profileData.school || '', 
            icon: <FaSchool />, 
            type: 'select', 
            options: ['Prerana Institute', 'New Baldwin Institutions', 'Jyothi Institutions', 'Other'] 
          },
          { 
            id: 'class', 
            label: 'Class', 
            value: profileData.class || '', 
            icon: <FaGraduationCap />, 
            type: 'select', 
            options: Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`) 
          },
          { 
            id: 'syllabus', 
            label: 'Syllabus', 
            value: profileData.syllabus || '', 
            icon: <FaBook />, 
            type: 'select', 
            options: ['CBSE', 'ICSE', 'State Board', 'Other'] 
          },
        ];

        setProfile(profileFields);
        setBio(profileData.bio || '');
        setProfileImage(profileData.profileImage || '/images/favicon.png');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Prepare the data to be sent to the server
      const updateData: Record<string, any> = {};
      
      // Handle name separately as it's split in the form
      if (formData.firstName || formData.lastName) {
        updateData.name = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
      }
      
      // Add other fields
      const otherFields = ['gender', 'dateOfBirth', 'profileType', 'school', 'class', 'syllabus', 'bio'];
      otherFields.forEach(field => {
        if (formData[field] !== undefined) {
          updateData[field] = formData[field];
        }
      });
      
      // Update profile
      await updateProfile(updateData);
      
      // Refresh the profile data to ensure we have the latest from the server
      const response = await getProfile();
      const profileData = response.profile || {};
      const userData = response.user || {};
      
      // Update local state with the updated profile data
      const profileFields: ProfileField[] = [
        { 
          id: 'firstName', 
          label: 'First Name', 
          value: userData.name?.split(' ')[0] || '', 
          icon: <FaUser /> 
        },
        { 
          id: 'lastName', 
          label: 'Last Name', 
          value: userData.name?.split(' ').slice(1).join(' ') || '', 
          icon: <FaUser /> 
        },
        { 
          id: 'email', 
          label: 'Email', 
          value: userData.email || '', 
          icon: <FaEnvelope />, 
          type: 'email' 
        },
        { 
          id: 'gender', 
          label: 'Gender', 
          value: profileData.gender || '', 
          icon: <FaVenusMars />, 
          type: 'select', 
          options: ['Male', 'Female', 'Other', 'Prefer not to say'] 
        },
        { 
          id: 'dateOfBirth', 
          label: 'Date of Birth', 
          value: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '', 
          icon: <FaCalendarAlt />, 
          type: 'date' 
        },
        { 
          id: 'profileType', 
          label: 'Profile Type', 
          value: profileData.profileType || '', 
          icon: <FaUserGraduate />, 
          type: 'select', 
          options: ['Student', 'Dropout', 'Repeating Year', 'Homeschooled', 'Other'] 
        },
        { 
          id: 'school', 
          label: 'School', 
          value: profileData.school || '', 
          icon: <FaSchool />, 
          type: 'select', 
          options: ['Prerana Institute', 'New Baldwin Institutions', 'Jyothi Institutions', 'Other'] 
        },
        { 
          id: 'class', 
          label: 'Class', 
          value: profileData.class || '', 
          icon: <FaGraduationCap />, 
          type: 'select', 
          options: Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`) 
        },
        { 
          id: 'syllabus', 
          label: 'Syllabus', 
          value: profileData.syllabus || '', 
          icon: <FaBook />, 
          type: 'select', 
          options: ['CBSE', 'ICSE', 'State Board', 'Other'] 
        },
      ];

      setProfile(profileFields);
      setBio(profileData.bio || '');
      setProfileImage(userData.photo || '/images/favicon.png');
      
      // Close the modal and show success message
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = '';

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Create a temporary URL for the image preview
    const imageUrl = URL.createObjectURL(file);
    setTempImage(imageUrl);

    try {
      setIsUpdating(true);
      const userData = await uploadProfileImage(file);
      
      // Update profile image in state
      if (userData?.photo) {
        setProfileImage(userData.photo);
        toast.success('Profile image updated successfully!');
      } else {
        // If no photo in response, refresh the profile to get the latest data
        const response = await getProfile();
        if (response?.user?.photo) {
          setProfileImage(response.user.photo);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image. Please try again.');
      setTempImage(''); // Reset temp image on error
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = () => {
    const initialFormData: Record<string, string> = {};
    profile.forEach(field => {
      initialFormData[field.id] = field.value;
    });
    // Add bio to form data
    initialFormData['bio'] = bio;
    setFormData(initialFormData);
    setTempImage(''); // Reset temp image when opening modal
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (['gender', 'profileType', 'class', 'syllabus', 'school'].includes(id)) {
      const dropdownId = id as keyof DropdownState;
      setDropdowns(prev => {
        // Close all dropdowns first
        const newState = Object.keys(prev).reduce((acc, key) => ({
          ...acc,
          [key]: false
        }), {} as DropdownState);
        
        // Toggle the clicked dropdown only if it wasn't already open
        if (!prev[dropdownId]) {
          newState[dropdownId] = true;
        }
        
        return newState;
      });
    }
  };
  
  const toggleDropdown = (id: string) => {
    setDropdowns(prev => {
      // Close all dropdowns first
      const newState = Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {} as DropdownState);
      
      // Toggle the clicked dropdown only if it wasn't already open
      if (!prev[id as keyof DropdownState]) {
        newState[id as keyof DropdownState] = true;
      }
      
      return newState;
    });
  };

  const saveChanges = () => {
    const updatedProfile = profile.map(field => ({
      ...field,
      value: formData[field.id] || field.value
    }));
    setProfile(updatedProfile);
    // Update bio if it was changed
    if (formData['bio'] !== undefined) {
      setBio(formData['bio']);
    }
    // Update profile image if changed
    if (tempImage) {
      setProfileImage(tempImage);
      setTempImage(''); // Reset temp image after saving
    }
    closeEditModal();
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className="md:block md:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Edit Profile Modal */}
          <AnimatePresence>
            {isEditModalOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={closeEditModal}
              >
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold bg-[var(--primary-color)] bg-clip-text text-transparent">
                          Edit Profile
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
                      </div>
                      <button 
                        onClick={closeEditModal}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        aria-label="Close"
                      >
                        <FiX size={24} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center mb-10">
                      <div className="relative group">
                        <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl relative">
                          <Image
                            src={tempImage || profileImage}
                            alt="Profile Preview"
                            width={144}
                            height={144}
                            className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <FiUpload className="text-white text-2xl" />
                          </div>
                        </div>
                        <label className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full hover:shadow-lg hover:scale-105 transition-all transform cursor-pointer shadow-md">
                          <FiCamera size={20} />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                          />
                        </label>
                        {tempImage && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setTempImage('');
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            <FiXCircle size={16} />
                          </button>
                        )}
                      </div>
                      <p className="mt-4 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        Click to upload new photo
                      </p>
                    </div>
                    
                    {/* Form Fields */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.map((field) => (
                          <div key={field.id} className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 pl-1">
                              {field.label}
                            </label>
                            <div className="relative">
                              {field.type === 'select' ? (
                                <div className="relative">
                                  <div 
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-800 cursor-pointer flex justify-between items-center"
                                    onClick={() => toggleDropdown(field.id)}
                                  >
                                    <span className={!formData[field.id] ? 'text-gray-400' : ''}>
                                      {formData[field.id] || `Select ${field.label.toLowerCase()}`}
                                    </span>
                                    <FaChevronDown className={`transition-transform duration-200 ${dropdowns[field.id as keyof typeof dropdowns] ? 'transform rotate-180' : ''}`} size={14} />
                                  </div>
                                  {dropdowns[field.id as keyof typeof dropdowns] && (
                                    <div className="absolute text-gray-700 z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                      {field.options?.map((option) => (
                                        <div
                                          key={option}
                                          className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer ${formData[field.id] === option ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : ''}`}
                                          onClick={() => handleInputChange(field.id, option)}
                                        >
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <input
                                    type={field.type || 'text'}
                                    value={formData[field.id] || ''}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 placeholder-gray-400 text-gray-800"
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                                    {React.cloneElement(field.icon as React.ReactElement, { 
                                      // @ts-ignore - size prop is valid for the icon component
                                      size: 18 
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Bio Field */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 pl-1">
                          About Me
                        </label>
                        <div className="relative">
                          <textarea
                            value={formData['bio'] || ''}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 placeholder-gray-400 text-gray-800 resize-none"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 mt-8 border-t border-gray-100">
                      <button
                        onClick={closeEditModal}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveChanges}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[var(--primary-color)] rounded-xl hover:bg-[var(--primary-hover)] transition-all duration-200 transform flex items-center cursor-pointer"
                      >
                        <FiSave className="mr-2" size={16} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex justify-end items-start">
              <button
                onClick={openEditModal}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <FiEdit className="mr-2" />
                Edit Profile
              </button>
            </div>
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
                    <p className="text-gray-900">
                      {field.value || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">About Me</h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {bio || 'No bio provided. Click the edit button to add one.'}
            </p>
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
