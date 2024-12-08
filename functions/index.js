const { onCall } = require('firebase-functions/v2/https');
const { Resend } = require('resend');

// TESTING ONLY - REMOVE BEFORE PRODUCTION
const RESEND_API_KEY = 're_64i5m7wC_AXG9zvt66FrvsDFU11Fvh5k9';

exports.sendConfirmation = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (request) => {
  try {
    const { email, code, projectTitle } = request.data;
    console.log('Attempting to send email to:', email);

    const resend = new Resend(RESEND_API_KEY);

    const response = await resend.emails.send({
      from: 'rfsgovernment@rfsgovernment.com',
      to: email,
      subject: 'Confirm Your Project Submission',
      html: `
        <h2>Project Submission Confirmation</h2>
        <p>You are submitting a new project: <strong>${projectTitle}</strong></p>
        <p>Your confirmation code is: <strong>${code}</strong></p>
        <p>Please enter this code to complete your submission.</p>
      `
    });

    console.log('Resend API Response:', response);
    return { success: true, id: response.id };
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error.stack);
    throw new Error('Failed to send confirmation email');
  }
});

// Cleanup old projects
// exports.cleanupOldProjects = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//   const snapshot = await admin.firestore()
//     .collection('projects')
//     .where('pendingDeletion', '==', true)
//     .where('deletionMarkedAt', '<=', thirtyDaysAgo)
//     .get();

//   const batch = admin.firestore().batch();
//   snapshot.docs.forEach((doc) => {
//     batch.delete(doc.ref);
//   });

//   await batch.commit();
//   return null;
// }); 