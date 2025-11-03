const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importVideos() {
  try {
    console.log('Starting import...');
    const data = fs.readFileSync('transformed-1.json', 'utf8');
    console.log('File read successfully');
    const videos = data.trim().split('\n').map(line => JSON.parse(line));
    console.log(`Parsed ${videos.length} videos`);

    let count = 0;
    const batchSize = 500;
    let batch = db.batch();

    for (const video of videos) {
      const docRef = db.collection('videos').doc(video.id);
      batch.set(docRef, video);
      count++;

      if (count % batchSize === 0) {
        console.log(`Committing batch ${count / batchSize}...`);
        await batch.commit();
        console.log(`Committed batch of ${batchSize} videos`);
        batch = db.batch();
      }
    }

    if (count % batchSize !== 0) {
      console.log('Committing final batch...');
      await batch.commit();
      console.log(`Committed final batch of ${count % batchSize} videos`);
    }

    console.log(`Import completed successfully! Total videos: ${count}`);
  } catch (error) {
    console.error('Error importing videos:', error);
  }
}

importVideos();