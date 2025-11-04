const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importRemainingVideos() {
  try {
    console.log('Starting import of remaining videos from transformed-2.json...');
    const data = fs.readFileSync('transformed-2.json', 'utf8');
    console.log('File read successfully');
    const allVideos = data.trim().split('\n').map(line => JSON.parse(line));
    console.log(`Total videos in file: ${allVideos.length}`);

    // Skip the first 9500 videos (batches 1-19) and take the remaining 500 (batch 20)
    const remainingVideos = allVideos.slice(9500);
    console.log(`Remaining videos to import: ${remainingVideos.length}`);

    let count = 0;
    const batchSize = 500;
    let batch = db.batch();

    for (const video of remainingVideos) {
      const docRef = db.collection('videos').doc(video.id);
      batch.set(docRef, video);
      count++;

      if (count % batchSize === 0) {
        console.log(`Committing final batch...`);
        await batch.commit();
        console.log(`Committed batch of ${batchSize} videos`);
        break; // Only one batch remaining
      }
    }

    console.log(`Import completed successfully! Total videos imported in this run: ${count}`);
  } catch (error) {
    console.error('Error importing videos:', error);
  }
}

importRemainingVideos();