const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const batchSize = 500;
let documents = [];
let rowCount = 0;
let batchCount = 0;

fs.createReadStream('pornhub.com-db.csv')
  .pipe(csv({ separator: '|' }))
  .on('data', (row) => {
    rowCount++;

    // Convert tags to array
    const tags = row.tags ? row.tags.split(',') : [];

    // Create document data
    const docData = {
      iframe_code: row.iframe_code || '',
      thumbnail_url: row.thumbnail_url || '',
      screenshots: row.screenshots || '',
      title: row.title || '',
      tags: tags,
      categories: row.categories || '',
      pornstars: row.pornstars || '',
      duration: row.duration || '',
      views: row.views || '',
      rating: row.rating || '',
      likes: row.likes || '',
      dislikes: row.dislikes || '',
      video_url: row.video_url || '',
      thumbnail_urls: row.thumbnail_urls || '',
    };

    documents.push(docData);
  })
  .on('end', async () => {
    const batchSize = 500;
    let batch = db.batch();
    let i = 0;

    for (const docData of documents) {
      const docRef = db.collection('videos').doc();
      batch.set(docRef, docData);
      i++;

      if (i % batchSize === 0) {
        batchCount++;
        console.log(`Committing batch ${batchCount} with ${batchSize} rows`);
        await batch.commit();
        console.log(`Batch ${batchCount} committed successfully`);
        batch = db.batch();
      }
    }

    if (i % batchSize !== 0) {
      batchCount++;
      console.log(`Committing final batch ${batchCount} with ${i % batchSize} rows`);
      await batch.commit();
      console.log(`Final batch ${batchCount} committed successfully`);
    }

    console.log('CSV file successfully processed');
    console.log(`Total rows processed: ${rowCount}`);
    console.log(`Total batches committed: ${batchCount}`);
  })
  .on('error', (error) => {
    console.error('Error reading CSV file: ', error);
  });