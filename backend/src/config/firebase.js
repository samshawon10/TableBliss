import admin from 'firebase-admin';

let firebaseApp = null;

try {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
      : '';

    if (privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'tablebliss',
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.log('Firebase Admin: Missing credentials, running without Firebase Auth');
    }
  } else {
    console.log('Firebase Admin: No credentials provided, running without Firebase Auth');
  }
} catch (error) {
  console.error('Firebase admin initialization error:', error.message);
  console.log('Firebase Admin: Continuing without Firebase authentication');
}

export const auth = firebaseApp ? admin.auth() : null;
export default admin;