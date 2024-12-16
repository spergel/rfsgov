const { onCall } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { defineSecret } = require('firebase-functions/params');
const { Resend } = require('resend');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

// Define the secret properly
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

// Send verification code
exports.sendVerificationCode = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  // Initialize Resend with the secret value
  const resend = new Resend(RESEND_API_KEY.value());
  console.log('Resend initialized with API key length:', RESEND_API_KEY.value().length);
  
  const { email } = request.data;
  console.log('Attempting to send email to:', email);
  
  // Verify it's a .gov email (or test email)
  if (email !== 'spergel.joshua@gmail.com' && !email.endsWith('.gov')) {
    throw new Error('Must use a .gov email address');
  }

  try {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated verification code:', code);
    
    // Store the code in Firestore with expiration
    await db.collection('verification-codes').doc(email).set({
      code,
      createdAt: new Date(),
      attempts: 0
    });
    console.log('Code stored in Firestore');

    // Send verification email using Resend
    console.log('Attempting to send email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Verification <rfsgovernment@rfsgovernment.com>',
      to: [email],
      subject: 'Your Verification Code for Legislative Request',
      html: `
        <h1>Verification Code</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log('Resend success:', data);
    return { success: true };
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error('Failed to send verification code');
  }
});

// Verify code
exports.verifyCode = onCall(async (request) => {
  const { email, code } = request.data;
  
  try {
    const docRef = db.collection('verification-codes').doc(email);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return { verified: false, message: 'No verification code found' };
    }

    const data = doc.data();
    const now = new Date();
    const createdAt = data.createdAt.toDate();
    const timeDiff = (now - createdAt) / 1000 / 60; // in minutes

    // Check if code is expired (15 minutes)
    if (timeDiff > 15) {
      await docRef.delete();
      return { verified: false, message: 'Code expired' };
    }

    // Check if too many attempts
    if (data.attempts >= 3) {
      await docRef.delete();
      return { verified: false, message: 'Too many attempts' };
    }

    // Verify code
    if (data.code === code) {
      await docRef.delete();
      return { verified: true };
    } else {
      // Increment attempts
      await docRef.update({ attempts: data.attempts + 1 });
      return { verified: false, message: 'Invalid code' };
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    throw new Error('Failed to verify code');
  }
});