"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const OnboardingPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    class: '',
    syllabus: '',
    school: ''
  });
  
  const [dropdowns, setDropdowns] = useState({
    class: false,
    syllabus: false,
    school: false
  });

  // Options
  const classes = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);
  const syllabi = ['State', 'CBSE', 'ICSE'];
  const schools = ['Prerana Institute', 'New Baldwin Institutions', 'Jyothi Institutions'];

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
    setDropdowns(prev => {
      // Close all dropdowns first, then toggle the clicked one
      const newState = {
        class: false,
        syllabus: false,
        school: false,
      };
      
      // Only open the clicked dropdown if it wasn't already open
      if (!prev[field as keyof typeof prev]) {
        newState[field as keyof typeof newState] = true;
      }
      
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class || !formData.syllabus || !formData.school) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful onboarding
      router.push('/dashboard');
    } catch (error) {
      console.error('Error during onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.class && formData.syllabus && formData.school;

  // Custom Dropdown Component
  const Dropdown = ({ 
    label, 
    value, 
    isOpen, 
    toggle, 
    options, 
    onSelect 
  }: { 
    label: string; 
    value: string; 
    isOpen: boolean; 
    toggle: () => void; 
    options: string[]; 
    onSelect: (option: string) => void;
  }) => {
    // Determine if this is the school dropdown
    const isSchoolDropdown = label === 'School';
    
    return (
    <div className="mb-6 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} *
      </label>
      <div 
        onClick={toggle}
        className={`w-full px-4 py-3 border ${isOpen ? 'border-[var(--primary-color)] ring-1 ring-[var(--primary-color)]' : 'border-gray-300'} rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-600'}>
          {value || `Select ${label.toLowerCase()}`}
        </span>
        {isOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
      </div>
      
      {isOpen && (
        <div 
          className={`absolute z-10 w-full ${isSchoolDropdown ? 'bottom-full mb-1' : 'mt-1'} bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto`}
        >
          <div className="py-1">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => onSelect(option)}
                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-gray-800 ${value === option ? 'bg-gray-50' : ''}`}
              >
                <span className="break-words max-w-[calc(100%-24px)]">{option}</span>
                {value === option && <FaCheck className="text-[var(--primary-color)] flex-shrink-0 ml-2" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">Help us personalize your learning experience</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Dropdown
                label="Class"
                value={formData.class}
                isOpen={dropdowns.class}
                toggle={() => toggleDropdown('class')}
                options={classes}
                onSelect={(value) => handleInputChange('class', value)}
              />

              <Dropdown
                label="Syllabus"
                value={formData.syllabus}
                isOpen={dropdowns.syllabus}
                toggle={() => toggleDropdown('syllabus')}
                options={syllabi}
                onSelect={(value) => handleInputChange('syllabus', value)}
              />

              <Dropdown
                label="School"
                value={formData.school}
                isOpen={dropdowns.school}
                toggle={() => toggleDropdown('school')}
                options={schools}
                onSelect={(value) => handleInputChange('school', value)}
              />

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full mt-8 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isFormValid 
                    ? 'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] cursor-pointer' 
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors duration-200`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">↻</span>
                    Saving...
                  </>
                ) : (
                  'Continue to Dashboard'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
