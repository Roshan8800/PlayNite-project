const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkImport() {
  try {
    console.log('Checking import...');

    // Get total count of documents in videos collection
    const snapshot = await db.collection('videos').get();
    console.log(`Total documents in videos collection: ${snapshot.size}`);

    // Get a few sample documents
    const querySnapshot = await db.collection('videos').limit(5).get();
    console.log('\nSample documents:');
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, JSON.stringify(doc.data(), null, 2));
    });

    // Check if transformed-1.json was imported
    const sampleDoc = await db.collection('videos').doc('6506d7ae-fe63-4233-a46a-3a4289bbad14').get();
    if (sampleDoc.exists) {
      console.log('\nSample document from transformed-1.json exists:', sampleDoc.data().title);
    } else {
      console.log('\nSample document from transformed-1.json does not exist');
    }

  } catch (error) {
    console.error('Error checking import:', error);
  }
}

checkImport();