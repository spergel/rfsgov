import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import TagInput from '../components/TagInput';

function Submit() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const functions = getFunctions();

  useEffect(() => {
    // Fetch available tags and add default category tags
    const fetchTags = async () => {
      try {
        const defaultCategories = [
          'Technology',
          'Infrastructure',
          'Healthcare',
          'Education',
          'Other'
        ];

        const tagsRef = collection(db, 'tags');
        const tagsSnapshot = await getDocs(tagsRef);
        const existingTags = tagsSnapshot.docs.map(doc => doc.data().name);
        
        // Add any default categories that don't exist yet
        for (const category of defaultCategories) {
          if (!existingTags.includes(category)) {
            await addDoc(tagsRef, {
              name: category,
              createdAt: serverTimestamp(),
              isCategory: true
            });
          }
        }

        // Fetch all tags again to get the complete list
        const updatedTagsSnapshot = await getDocs(tagsRef);
        const tagsList = updatedTagsSnapshot.docs.map(doc => doc.data().name);
        setAvailableTags(tagsList);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  const validateGovEmail = (email) => {
    return email.toLowerCase().endsWith('.gov');
  };

  const generateConfirmationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSendConfirmation = async (e) => {
    e.preventDefault();
    
    if (!validateGovEmail(contactEmail)) {
      setError('Please use a valid .gov email address');
      return;
    }

    try {
      const code = generateConfirmationCode();
      setConfirmationCode(code);
      
      // Debug log
      console.log('Starting confirmation request...');
      
      const sendConfirmationEmail = httpsCallable(functions, 'sendConfirmation', {
        timeout: 60000 // 60 second timeout
      });

      // Debug log
      console.log('Sending data:', {
        email: contactEmail,
        code: code,
        projectTitle: title
      });

      const result = await sendConfirmationEmail({
        email: contactEmail,
        code: code,
        projectTitle: title
      });

      // Debug log
      console.log('Server response:', result);

      if (!result.data || !result.data.success) {
        throw new Error(result.data?.error || 'Server returned unsuccessful response');
      }
      
      setIsConfirmationSent(true);
      setError('');
    } catch (error) {
      // Detailed error logging
      console.error('=== Error Details ===');
      console.error('Error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error stack:', error.stack);
      
      setError(`Failed to send confirmation email: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (enteredCode !== confirmationCode) {
      setError('Invalid confirmation code');
      return;
    }

    if (selectedTags.length === 0) {
      setError('Please select at least one tag');
      return;
    }

    try {
      setSubmitStatus('processing');
      
      await addDoc(collection(db, 'projects'), {
        title,
        description,
        contactEmail,
        tags: selectedTags,
        status: 'pending',
        createdAt: serverTimestamp(),
        verified: true
      });
      
      setSubmitStatus('success');
      setError('');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error submitting project:', error);
      setError('Failed to submit project. Please try again.');
      setSubmitStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Submit New Project Request</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      {submitStatus === 'success' && (
        <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">
          Project submitted successfully!
        </div>
      )}

      <form onSubmit={isConfirmationSent ? handleSubmit : handleSendConfirmation} className="max-w-lg">
        <div className="mb-4">
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border rounded h-32"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Government Email (.gov required)</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            pattern=".+\.gov$"
            className="w-full p-2 border rounded"
            disabled={isConfirmationSent}
            placeholder="your.name@agency.gov"
          />
        </div>

        {isConfirmationSent && (
          <div className="mb-4">
            <label className="block mb-2">Confirmation Code</label>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter the code sent to your email"
            />
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tags (Select at least one)
          </label>
          <TagInput
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={availableTags}
          />
        </div>
        
        <button
          type="submit"
          disabled={submitStatus === 'processing'}
          className="bg-patriot-red text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {submitStatus === 'processing' ? 'Processing...' : 
           isConfirmationSent ? 'Submit Project' : 'Send Confirmation Code'}
        </button>
      </form>
    </div>
  );
}

export default Submit; 