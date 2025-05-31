import api from './api';

export const getProfile = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData: any) => {
  try {
    // Send the update request
    await api.patch('/users/update-me', profileData);
    
    // Return the updated profile data
    const response = await getProfile();
    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);

  try {
    // Send the photo update request
    await api.patch('/users/update-me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Return the updated user data
    const response = await getProfile();
    return response.user;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};
