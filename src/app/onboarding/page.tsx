"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaChevronDown, FaUser, FaVenusMars, FaCalendarAlt, FaGraduationCap, FaBook, FaSchool } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastOptions } from 'react-toastify';
import authService from '@/services/authService';

interface FormData {
  gender: string;
  dob: string;
  profileType: string;
  class: string;
  syllabus: string;
  school: string;
  bio?: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  studyReminders: boolean;
  agreedToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

// Define field type
type FormField = {
  name: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
};

type FormStep = {
  id: number;
  title: string;
  fields: FormField[];
};

const OnboardingPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [progress, setProgress] = useState(25);
  
  // Form steps
  const steps = [
    {
      id: 1,
      title: 'Personal Information',
      fields: [
        { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'profileType', label: 'Profile Type', type: 'select', options: ['Student', 'Dropout', 'Repeating Year', 'Homeschooled', 'Other'], required: true },
      ]
    },
    {
      id: 2,
      title: 'Education',
      fields: [
        { name: 'class', label: 'Class', type: 'text', required: true },
        { name: 'syllabus', label: 'Syllabus', type: 'select', options: ['CBSE', 'ICSE', 'State Board', 'Other'], required: true },
        { name: 'school', label: 'School/Institution', type: 'text', required: true },
      ]
    },
    {
      id: 3,
      title: 'About You',
      fields: [
        { name: 'bio', label: 'Bio', type: 'textarea', required: false },
      ]
    },
    {
      id: 4,
      title: 'Preferences',
      fields: [
        { name: 'emailNotifications', label: 'Email Notifications', type: 'checkbox', required: false },
        { name: 'inAppNotifications', label: 'In-App Notifications', type: 'checkbox', required: false },
        { name: 'studyReminders', label: 'Study Reminders', type: 'checkbox', required: false },
        { name: 'agreedToTerms', label: 'I agree to the Terms of Service and Privacy Policy', type: 'checkbox', required: true },
      ]
    }
  ];
  
  // Form state
  interface FormData {
    gender: string;
    dob: string;
    profileType: string;
    class: string;
    syllabus: string;
    school: string;
    bio?: string;
    emailNotifications: boolean;
    inAppNotifications: boolean;
    studyReminders: boolean;
    agreedToTerms: boolean;
  }
  const [formData, setFormData] = useState<FormData>({
    gender: '',
    dob: '',
    profileType: 'Student',
    class: '',
    syllabus: '',
    school: '',
    emailNotifications: true,
    inAppNotifications: true,
    studyReminders: true,
    agreedToTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [dropdowns, setDropdowns] = useState({
    gender: false,
    profileType: false,
    class: false,
    syllabus: false,
    school: false
  });

  // Options
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const profileTypes = ['Student', 'Dropout', 'Repeating Year', 'Homeschooled', 'Other'];
  const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
  const syllabi = ['CBSE', 'ICSE', 'State Board', 'Other'];
  const schools = ['Prerana Institute', 'New Baldwin Institutions', 'Jyothi Institutions', 'Other'];

  // Update progress based on current step
  useEffect(() => {
    const newProgress = (currentStep / 4) * 100;
    setProgress(Math.min(100, Math.max(25, newProgress)));
  }, [currentStep]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Close the dropdown after selection
    setDropdowns(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const toggleDropdown = (field: string) => {
    setDropdowns(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.profileType) newErrors.profileType = 'Profile type is required';
    } else if (step === 2) {
      if (!formData.class) newErrors.class = 'Class is required';
      if (!formData.syllabus) newErrors.syllabus = 'Syllabus is required';
      if (!formData.school) newErrors.school = 'School/Institution is required';
    } else if (step === 3) {
      if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep < 4 && validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current step info
    const currentStepInfo = steps.find(step => step.id === currentStep);
    if (!currentStepInfo) {
      console.error('Current step not found:', currentStep);
      return;
    }
    
    const currentStepFields = currentStepInfo.fields;
    const errors: Record<string, string> = {};
    
    // Validate required fields for current step
    currentStepFields.forEach((field: FormField) => {
      if (field.required && !formData[field.name as keyof FormData]) {
        errors[field.name] = `${field.label} is required`;
      }
    });
    
    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // If this is the last step, submit the form
    const isLastStep = currentStep === steps[steps.length - 1].id;
    if (isLastStep) {
      setIsSubmitting(true);
      
      try {
        // Prepare the request data
        const requestData: any = {
          gender: formData.gender,
          profileType: formData.profileType,
          class: formData.class,
          syllabus: formData.syllabus,
          school: formData.school,
          bio: formData.bio || ''
        };

        // Only add dateOfBirth if it exists and is valid
        if (formData.dob) {
          const date = new Date(formData.dob);
          if (!isNaN(date.getTime())) {
            requestData.dateOfBirth = date.toISOString();
          }
        }
        
        console.log('Sending data to server:', requestData);
        
        // Call the API to save onboarding data
        const response = await fetch('/api/users/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (!response.ok) {
          // Try to get a more detailed error message
          let errorMessage = 'Failed to save your information';
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.errors) {
            errorMessage = Object.values(data.errors).join(', ');
          }
          throw new Error(errorMessage);
        }
        
        // Show success message
        toast.success('Profile updated successfully!, Please Login');
        
        // Update user data in local storage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          onboarded: true
        }));
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          authService.logout();
        }, 1000);
        
      } catch (error: any) {
        console.error('Error submitting form:', error);
        toast.error(error.message || 'Failed to save your information. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      
      return;
    }
    
    // Otherwise, go to next step
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id;
      // Update progress based on steps (ensure we don't exceed 100%)
      const newProgress = Math.min(((currentIndex + 2) / steps.length) * 100, 100);
      setProgress(newProgress);
      setCurrentStep(nextStep);
      setFormErrors({});
    }
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const isFormValid = formData.gender && formData.dob && formData.profileType && 
                     formData.class && formData.syllabus && formData.school && 
                     formData.agreedToTerms;

  // Custom Input Component
  const InputField = ({ 
    label, 
    value, 
    onChange, 
    type = 'text', 
    placeholder = '',
    required = false,
    icon: Icon,
    onFocus = () => {}
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    type?: string;
    placeholder?: string;
    required?: boolean;
    icon: React.ElementType;
    onFocus?: () => void;
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
        <Icon className="mr-2 text-[var(--primary-color)]" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border ${value ? 'border-[var(--primary-color)]' : 'border-gray-300'} 
                  transition-all duration-200
                  shadow-sm placeholder-gray-400`}
        required={required}
      />
    </div>
  );

  // Custom Dropdown Component
  const Dropdown = ({ 
    label, 
    value, 
    isOpen, 
    toggle, 
    options, 
    onSelect,
    icon: Icon,
    required = false
  }: { 
    label: string; 
    value: string; 
    isOpen: boolean; 
    toggle: () => void; 
    options: string[]; 
    onSelect: (option: string) => void;
    icon: React.ElementType;
    required?: boolean;
  }) => (
    <div className="mb-6 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
        <Icon className="mr-2 text-[var(--primary-color)]" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div 
        onClick={toggle}
        className={`w-full px-4 py-3 rounded-xl border ${value ? 'border-[var(--primary-color)]' : 'border-gray-300'} 
                  flex justify-between items-center cursor-pointer transition-all duration-200
                  hover:border-[var(--primary-hover)]`}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || `Select ${label.toLowerCase()}`}
        </span>
        {isOpen ? <FaChevronDown className="text-gray-500 rotate-180" /> : <FaChevronDown className="text-gray-500" />}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto"
          >
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => onSelect(option)}
                className={`px-4 py-2.5 hover:bg-[var(--primary-color)] hover:text-white cursor-pointer transition-colors ${
                  value === option ? 'bg-[var(--primary-color)] text-white font-medium' : 'text-gray-700'
                }`}
              >
                {option}
                {value === option && <FaCheck className="float-right mt-1 text-[var(--primary-color)]" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            <p className="text-gray-600 mb-6">Tell us a bit about yourself to get started.</p>
            
            <div>
              <Dropdown
                label="Gender"
                value={formData.gender}
                isOpen={dropdowns.gender}
                toggle={() => toggleDropdown('gender')}
                options={genders}
                onSelect={(value) => handleInputChange('gender', value)}
                icon={FaVenusMars}
                required
              />
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <FaCalendarAlt className="mr-2 text-[var(--primary-color)]" />
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-gray-700 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} transition-all duration-200`}
                required
              />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
            </div>
            
            <div>
              <Dropdown
                label="Profile Type"
                value={formData.profileType}
                isOpen={dropdowns.profileType}
                toggle={() => toggleDropdown('profileType')}
                options={profileTypes}
                onSelect={(value) => handleInputChange('profileType', value)}
                icon={FaUser}
                required
              />
              {errors.profileType && <p className="mt-1 text-sm text-red-600">{errors.profileType}</p>}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Education Details</h2>
            <p className="text-gray-600 mb-6">Help us understand your educational background.</p>
            
            <div>
              <Dropdown
                label="Class"
                value={formData.class}
                isOpen={dropdowns.class}
                toggle={() => toggleDropdown('class')}
                options={classes}
                onSelect={(value) => handleInputChange('class', value)}
                icon={FaGraduationCap}
                required
              />
              {errors.class && <p className="mt-1 text-sm text-red-600">{errors.class}</p>}
            </div>
            
            <div>
              <Dropdown
                label="Syllabus"
                value={formData.syllabus}
                isOpen={dropdowns.syllabus}
                toggle={() => toggleDropdown('syllabus')}
                options={syllabi}
                onSelect={(value) => handleInputChange('syllabus', value)}
                icon={FaBook}
                required
              />
              {errors.syllabus && <p className="mt-1 text-sm text-red-600">{errors.syllabus}</p>}
            </div>
            
            <div>
              <Dropdown
                label="School/Institution"
                value={formData.school}
                isOpen={dropdowns.school}
                toggle={() => toggleDropdown('school')}
                options={schools}
                onSelect={(value) => handleInputChange('school', value)}
                icon={FaSchool}
                required
              />
              {errors.school && <p className="mt-1 text-sm text-red-600">{errors.school}</p>}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Account Preferences</h2>
            <p className="text-gray-600 mb-6">Customize your experience with us.</p>
            
            <div className="bg-indigo-50 p-6 rounded-xl mb-6">
              <h3 className="font-medium text-indigo-800 mb-2">Notification Preferences</h3>
              <p className="text-sm text-indigo-700 mb-4">How would you like to receive updates?</p>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-[var(--primary-color)]" 
                    checked={formData.emailNotifications}
                    onChange={(e) => handleCheckboxChange('emailNotifications', e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-[var(--primary-color)]" 
                    checked={formData.inAppNotifications}
                    onChange={(e) => handleCheckboxChange('inAppNotifications', e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">In-app notifications</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-[var(--primary-color)]" 
                    checked={formData.studyReminders}
                    onChange={(e) => handleCheckboxChange('studyReminders', e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Study reminders</span>
                </label>
              </div>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-xl">
              <h3 className="font-medium text-amber-800 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-amber-700 mb-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
              <div className="mt-2">
                <label className="flex items-start">
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded text-[var(--primary-color)]" 
                    checked={formData.agreedToTerms}
                    onChange={(e) => handleCheckboxChange('agreedToTerms', e.target.checked)}
                    required 
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to the terms and conditions
                  </span>
                </label>
                {errors.agreedToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms}</p>}
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">You're all set!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your profile is ready. Click the button below to complete your onboarding and start your learning journey with us.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-xl text-left max-w-md mx-auto">
              <h3 className="font-medium text-gray-800 mb-3">Your Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {Object.entries(formData).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex">
                      <span className="font-medium text-gray-700 w-32 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span>{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[var(--primary-color)]">
              Step {currentStep} of 4
            </span>
            <span className="text-sm font-medium text-[var(--primary-color)]">
              {progress}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-[var(--primary-color)] h-2.5 rounded-full" 
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>
        
        {/* Form Container */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {currentStep === 1 && 'Welcome to Murshid'}
              {currentStep === 2 && 'Education Details'}
              {currentStep === 3 && 'Almost There'}
              {currentStep === 4 && 'Setup Complete!'}
            </h1>
            <p className="text-gray-500">
              {currentStep === 1 && 'Let\'s set up your profile to get started'}
              {currentStep === 2 && 'Tell us about your education'}
              {currentStep === 3 && 'A few more details to personalize your experience'}
              {currentStep === 4 && 'You\'re ready to go!'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            <div className={`mt-10 flex ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors ml-auto cursor-pointer"
                  disabled={isSubmitting}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors w-full sm:w-auto cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Completing...
                    </span>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? <a href="#" className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
