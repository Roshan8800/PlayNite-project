const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize Firebase Admin SDK with service account key
const serviceAccount = require('./service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://playnite-30409-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// Path to the CSV file - can be overridden by command line argument
const filePath = process.argv[2] || 'pornhub.com-db.csv';

// Batch size for Firestore writes
const batchSize = 500;

// Initialize batch variables
let batch = db.batch();
let batchCount = 0;
let rowCount = 0;
let currentBatchSize = 0;

// Create a read stream for the CSV file and pipe to csv-parser for streaming
fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    try {
      rowCount++;
      console.log(`Processing row ${rowCount}`);

      // Convert 'tags' field to an array by splitting on commas and trimming whitespace
      if (row.tags) {
        row.tags = row.tags.split(',').map(tag => tag.trim());
      } else {
        row.tags = [];
      }

      // Prepare the document data (assuming fields: title, video_url, thumbnail_url, tags, duration, iframe_code, embed_code)
      const docData = {
        title: row.title || '',
        video_url: row.video_url || '',
        thumbnail_url: row.thumbnail_url || '',
        tags: row.tags,
        duration: row.duration || '',
        iframe_code: row.iframe_code || '',
        embed_code: row.embed_code || ''
      };

      // Add to the current batch
      const docRef = db.collection('videos').doc(); // Use auto-generated ID
      batch.set(docRef, docData);
      currentBatchSize++;

      // If batch size reached, commit the batch
      if (currentBatchSize >= batchSize) {
        batch.commit()
          .then(() => {
            console.log(`Committed batch ${batchCount + 1} (${batchSize} documents)`);
            batchCount++;
          })
          .catch((err) => {
            console.error(`Error committing batch ${batchCount + 1}:`, err);
          });

        // Start a new batch
        batch = db.batch();
        currentBatchSize = 0;
      }
    } catch (err) {
      console.error(`Error processing row ${rowCount}:`, err);
      // Skip invalid rows and continue
    }
  })
  .on('end', () => {
    // Commit any remaining documents in the last batch
    if (currentBatchSize > 0) {
      batch.commit()
        .then(() => {
          console.log(`Committed final batch ${batchCount + 1} (${currentBatchSize} documents)`);
        })
        .catch((err) => {
          console.error('Error committing final batch:', err);
        });
    }

    console.log(`Import completed. Total rows processed: ${rowCount}`);
    console.log(`Total batches committed: ${batchCount + (currentBatchSize > 0 ? 1 : 0)}`);

    // Close the Firebase app
    admin.app().delete();
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
    admin.app().delete();
  });