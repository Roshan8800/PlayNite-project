var admin = require("firebase-admin");

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || "../../service-account.json";

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://playnite-30409-default-rtdb.firebaseio.com"
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
    db.collection('videos').add({
      embed_url: row['<iframe src="https://www.pornhub.com/embed/c3dbc9a5d726288d8a4b" frameborder="0" height="481" width="608" scrolling="no"></iframe>'],
      thumbnail_url: row['https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)5.jpg'],
      image_urls: row['https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)1.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)2.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)3.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)4.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)5.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)6.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)7.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)8.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)9.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)10.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)11.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)12.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)13.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)14.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)15.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaf8GgaaaWavb)(mh=VLBsRAsYYSS6491_)16.jpg'],
      title: row['Gen Padova - Cum Bot Brunette Petite Girl Orgasms'],
      categories: row['cumbots.com;machine;toys;brunette;teen;orgasm;natural-tits'],
      tags: row['Brunette;Toys;Pornstar;18-25;Exclusive;Verified Models;Solo Female'],
      pornstar: row['Gen Padova'],
      duration: row['185'],
      views: row['2346519'],
      upvotes: row['3003'],
      downvotes: row['415'],
      thumbnail_url_2: row['https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)5.jpg'],
      image_urls_2: row['https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)1.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)2.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)3.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)4.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)5.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)6.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)7.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)8.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)9.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)10.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)11.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)12.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)13.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)14.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)15.jpg;https://ei.phncdn.com/videos/200712/10/65404/original/(m=eaAaGwObaaamqv)(mh=3IROU0NPQStpTLN7)16.jpg']
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