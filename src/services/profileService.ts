import api from './api';

export interface UserProfile {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    onboarded: boolean;
  };
  profile: {
    id: string;
    gender: string;
    dateOfBirth: string;
    profileType: string;
    class: string;
    syllabus: string;
    school: string;
    bio: string;
    profileImage: string;
  };
}

export const getProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get('/users/me');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData: Partial<UserProfile['profile']>): Promise<UserProfile> => {
  try {
    const response = await api.patch('/users/update-me', profileData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (file: File): Promise<{ profileImage: string }> => {
  const formData = new FormData();
  formData.append('profileImage', file);

  try {
    const response = await api.patch('/users/update-me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Return the updated profile image URL
    return { profileImage: response.data.data.profile.profileImage };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};
