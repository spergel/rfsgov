import { useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useDropzone } from 'react-dropzone';
import { db } from '../firebase';

function Submit() {
  const [formData, setFormData] = useState({
    legislativeOffice: '', // required
    title: '', // required
    problemStatement: '', // required
    description: '', // optional, general description
    currentSituation: '', // optional
    desiredOutcome: '', // optional
    contactEmail: '', // required, .gov
    projectType: 'volunteer',
    budget: '', // New field for budget amount
    additionalNotes: '', // optional, for any other details
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    // For testing, allow .com. In production, change to .gov only
    const testMode = true; // Set to false in production
    const emailRegex = testMode 
      ? /^[^\s@]+@[^\s@]+\.(gov|com)$/
      : /^[^\s@]+@[^\s@]+\.gov$/;
    
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, contactEmail: email }));
    
    if (email && !validateEmail(email)) {
      setEmailError('Must be a .gov email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.contactEmail)) {
      setEmailError('Must be a .gov email address');
      return;
    }
    setLoading(true);

    try {
      await addDoc(collection(db, 'legislative-requests'), {
        ...formData,
        status: 'open',
        createdAt: new Date().toISOString(),
      });

      alert('Your request has been posted successfully!');
      setFormData({
        legislativeOffice: '',
        title: '',
        problemStatement: '',
        description: '',
        currentSituation: '',
        desiredOutcome: '',
        contactEmail: '',
        projectType: 'volunteer',
        budget: '',
        additionalNotes: '',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Post Tech Request</h2>
      <p className="text-gray-600 mb-8">
        Share your office's needs for websites, apps, or data tools. 
        Connect with civic-minded developers who can help build solutions.
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Required Fields */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Required Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legislative Office <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.legislativeOffice}
                onChange={(e) => setFormData(prev => ({ ...prev, legislativeOffice: e.target.value }))}
                required
                className="w-full px-4 py-2 border rounded"
                placeholder="e.g., Office of Senator Smith, Education Committee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-2 border rounded"
                placeholder="e.g., Education Budget Dashboard, Constituent Data Tool"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                required
                rows={3}
                className="w-full px-4 py-2 border rounded"
                placeholder="What problem needs solving? Be specific about what you need."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={handleEmailChange}
                required
                className={`w-full px-4 py-2 border rounded ${emailError ? 'border-red-500' : ''}`}
                placeholder="your.email@agency.gov"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Additional Details (Optional)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border rounded"
                placeholder="Provide any additional context or general information about your request"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Process
              </label>
              <textarea
                value={formData.currentSituation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentSituation: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border rounded"
                placeholder="How is this currently being handled?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Outcome
              </label>
              <textarea
                value={formData.desiredOutcome}
                onChange={(e) => setFormData(prev => ({ ...prev, desiredOutcome: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border rounded"
                placeholder="What would you like the end result to look like?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border rounded"
                placeholder="Any other details that might be helpful for developers"
              />
            </div>
          </div>
        </div>

        {/* Project Type */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Project Type</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, projectType: 'volunteer', budget: '' }))}
                className={`p-4 rounded-lg border-2 text-center ${
                  formData.projectType === 'volunteer'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Volunteer Project</div>
                <div className="text-sm text-gray-600">Seeking civic-minded developers</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, projectType: 'paid' }))}
                className={`p-4 rounded-lg border-2 text-center ${
                  formData.projectType === 'paid'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Paid Project</div>
                <div className="text-sm text-gray-600">Budget available</div>
              </button>
            </div>

            {/* Budget Input - Only shows when paid is selected */}
            {formData.projectType === 'paid' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      budget: e.target.value 
                    }))}
                    required={formData.projectType === 'paid'}
                    min="0"
                    step="1000"
                    className="w-full pl-7 pr-12 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the estimated budget for this project
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-3 text-white rounded-lg text-lg font-semibold ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Posting...' : 'Post Request'}
        </button>
      </form>
    </div>
  );
}

export default Submit; 