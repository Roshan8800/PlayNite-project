var admin = require("firebase-admin");

var serviceAccount = require("../../service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://playnite-30409-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

db.collection('videos').limit(1).get()
  .then((snapshot: any) => {
    snapshot.forEach((doc: any) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err: any) => {
    console.log('Error getting documents', err);
  });

const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('simple.csv')
  .pipe(csv({ separator: '|' }))
  .on('data', (row: any) => {
    Object.keys(row).forEach(key => {
      if (row[key] === undefined) {
        row[key] = '';
      }
    });
    db.collection('videos').add({
      iframe_code: row.iframe_code || '',
      thumbnail_url: row.thumbnail_url || '',
      screenshots: row.screenshots || '',
      title: row.title || '',
      tags: row.tags || '',
      categories: row.categories || '',
      pornstars: row.pornstars || '',
      duration: row.duration || '',
      views: row.views || '',
      rating: row.rating || '',
      likes: row.likes || '',
      dislikes: row.dislikes || '',
      video_url: row.video_url || '',
      thumbnail_urls: row.thumbnail_urls || '',
    })
    .then((docRef: any) => {
      console.log('Document written with ID: ', docRef.id);
    })
    .catch((error: any) => {
      console.error('Error adding document: ', error);
    });
  })
  .on('data', (row: any) => {
    Object.keys(row).forEach(key => {
      if (row[key] === undefined) {
        row[key] = '';
      }
    });
    db.collection('videos').add({
      iframe_code: row.iframe_code || '',
      thumbnail_url: row.thumbnail_url || '',
      screenshots: row.screenshots || '',
      title: row.title || '',
      tags: row.tags || '',
      categories: row.categories || '',
      pornstars: row.pornstars || '',
      duration: row.duration || '',
      views: row.views || '',
      rating: row.rating || '',
      likes: row.likes || '',
      dislikes: row.dislikes || '',
      video_url: row.video_url || '',
      thumbnail_urls: row.thumbnail_urls || '',
    })
    .then((docRef: any) => {
      console.log('Document written with ID: ', docRef.id);
    })
    .catch((error: any) => {
      console.error('Error adding document: ', error);
    });
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });