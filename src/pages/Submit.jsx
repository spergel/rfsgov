import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import confetti from 'canvas-confetti';

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
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [touched, setTouched] = useState({});

  const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
  const verifyEmailCode = httpsCallable(functions, 'verifyEmailCode');

  const validateEmail = (email) => {
    // Special case for testing
    if (email === 'spergel.joshua@gmail.com') return true;
    
    // Strict .gov validation
    const govEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.gov$/;
    return govEmailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, contactEmail: email }));
    
    if (email && !validateEmail(email)) {
      setEmailError('Only .gov email addresses are accepted for submissions');
    } else {
      setEmailError('');
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.contactEmail)) {
      setEmailError('Must be a .gov email address');
      return;
    }

    setLoading(true);
    try {
      await sendVerificationEmail({ email: formData.contactEmail });
      setEmailSent(true);
      setShowVerification(true);
      alert('Verification code sent to your email');
    } catch (error) {
      console.error('Error sending verification:', error);
      alert('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      alert('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      // Verify the code first
      const verifyResult = await verifyEmailCode({ 
        email: formData.contactEmail, 
        code: verificationCode 
      });

      if (verifyResult.data.verified) {
        // If verified, submit the request
        const docRef = await addDoc(collection(db, 'legislative-requests'), {
          ...formData,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        alert('Your request has been submitted successfully!');
        // Reset form
        setFormData({
          legislativeOffice: '',
          title: '',
          problemStatement: '',
          description: '',
          currentSituation: '',
          desiredOutcome: '',
          contactEmail: '',
          projectType: 'volunteer',
          additionalNotes: '',
        });
        setVerificationCode('');
        setShowVerification(false);
        setEmailSent(false);
      } else {
        alert('Invalid verification code');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to verify code or submit request');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    if (required.includes(name) && !value) {
      return 'This field is required';
    }
    return '';
  };

  const required = ['legislativeOffice', 'title', 'problemStatement', 'contactEmail'];

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const isFieldInvalid = (name) => {
    return touched[name] && validateField(name, formData[name]);
  };

  const inputClasses = (name) => `w-full px-4 py-2 border rounded ${
    isFieldInvalid(name) ? 'border-red-500 bg-red-50' : ''
  }`;

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
                name="legislativeOffice"
                value={formData.legislativeOffice}
                onChange={(e) => setFormData({...formData, legislativeOffice: e.target.value})}
                onBlur={() => handleBlur('legislativeOffice')}
                className={inputClasses('legislativeOffice')}
                required
                placeholder="e.g., Office of Senator Smith, Education Committee"
              />
              {isFieldInvalid('legislativeOffice') && (
                <p className="text-red-500 text-sm mt-1">This field is required</p>
              )}
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

            {formData.projectType === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Budget
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Enter budget amount"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          {!showVerification ? (
            <button
              type="button"
              onClick={handleSendCode}
              disabled={loading || !formData.contactEmail}
              className="w-full px-6 py-3 text-white rounded-lg text-lg font-semibold bg-blue-500 hover:bg-blue-600"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Enter code from email"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !verificationCode}
                className="w-full px-6 py-3 text-white rounded-lg text-lg font-semibold bg-blue-500 hover:bg-blue-600"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default Submit; 