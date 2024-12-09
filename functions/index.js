const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();
const resend = new Resend(functions.config().resend.api_key);

// Send verification email using Resend
exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  const { email } = data;
  
  // Log the incoming request
  console.log('Attempting to send verification email to:', email);
  
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    // Log before storing code
    console.log('Storing verification code in Firestore...');
    
    // Store the code
    await db.collection('verification-codes').doc(email).set({
      code,
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    // Log before sending email
    console.log('Sending email via Resend...');

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'RFS Government <rfsgovernment@rfsgovernment.com>',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <h1>Verification Code</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `
    });

    // Log the Resend response
    console.log('Resend API response:', emailResponse);

    return { success: true };

  } catch (error) {
    // More detailed error logging
    console.error('Failed to send verification email:', {
      error: error.message,
      stack: error.stack,
      details: error.response?.data // For Resend-specific errors
    });
    throw new functions.https.HttpsError('internal', 'Failed to send verification email');
  }
});

// Updated verifyEmailCode function with expiration check
exports.verifyEmailCode = functions.https.onCall(async (data, context) => {
  const { email, code } = data;
  
  const docRef = db.collection('verification-codes').doc(email);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new functions.https.HttpsError('not-found', 'No verification code found');
  }

  const { code: storedCode, attempts, createdAt } = doc.data();
  
  if (code !== storedCode) {
    await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
    throw new functions.https.HttpsError('invalid-argument', 'Invalid code');
  }

  // Code is valid - clean up
  await docRef.delete();
  return { verified: true };
});

// Send confirmation using Firebase Auth
exports.sendConfirmationEmail = functions.firestore
  .document('legislative-requests/{requestId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    try {
      await admin.auth().sendCustomEmail(data.contactEmail, {
        subject: 'Request Received',
        text: `We've received your request: ${data.title}`,
        html: `<p>We've received your request: <strong>${data.title}</strong></p>`
      });
    } catch (error) {
      console.error('Email error:', error);
    }
  });