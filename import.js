const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const documents = [];

function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return null;
  }
  const stringField = String(field);
  const needsQuotes = /[,"'\r\n]|<iframe/g.test(stringField);
  if (needsQuotes) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

fs.createReadStream('simple.csv')
  .pipe(csv({ 
    separator: '|',
    quote: '"',
    escape: '\\'
  }))
  .on('data', (row) => {
    const id = uuidv4();

    const docData = {
      id: id,
      title: escapeCsvField(row["Gen Padova - Cum Bot Brunette Petite Girl Orgasms"]),
      duration: escapeCsvField(row["185"]),
      embed_url: escapeCsvField(row['<iframe src="https://www.pornhub.com/embed/f943adac0381c880e0ad" frameborder="0" height="481" width="608" scrolling="no"></iframe>|https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)5.jpg']),
      thumbnail_url: escapeCsvField(row["https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)5.jpg"]),
      image_urls: row["https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)1.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)2.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)3.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)4.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)5.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaf8GgaaaWavb)(mh=A_rM8VjTRqhkzV12)6.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)7.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)8.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)9.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)10.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)11.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)12.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)13.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)14.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)15.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)16.jpg"] ? row["https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)1.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)2.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)3.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)4.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)5.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)6.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)7.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)8.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)9.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)10.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)11.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)12.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)13.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)14.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)15.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)16.jpg"].split(';') : null,
50 |       tags: row["Big Tits;Blowjob;MILF;Pornstar;POV"] ? row["Big Tits;Blowjob;MILF;Pornstar;POV"].split(';') : null,
51 |       views: row["2427054"] !== undefined ? parseInt(row["2427054"]) : 0,
52 |       upvotes: row["929"] !== undefined ? parseInt(row["929"]) : 0,
53 |       downvotes: row["310"] !== undefined ? parseInt(row["310"]) : 0,
54 |       pornstar: escapeCsvField(row["Mandy May"] || null),
55 |       categories: row["brazzers.com;big-tits;tittyfuck;pov;blowjob;handjob;cumshot;milf;czech"] ? row["brazzers.com;big-tits;tittyfuck;pov;blowjob;handjob;cumshot;milf;czech"].split(';') : null,
56 |       thumbnail_url_2: escapeCsvField(row["https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)5.jpg"] || null),
57 |       image_urls_2: row["https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)1.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)2.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)3.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)4.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)5.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)6.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)7.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)8.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)9.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)10.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)11.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)12.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)13.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)14.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)15.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)16.jpg"] ? row["https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)1.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)2.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)3.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)4.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)5.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)6.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)7.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)8.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)9.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)10.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)11.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)12.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)13.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)14.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)15.jpg;https://ei.phncdn.com/videos/200802/09/76478/original/(m=eaAaGwObaaamqv)(mh=pOlDv2oSsOP9h3SL)16.jpg"].split(';') : null
58 |     };
59 | 
60 |     documents.push(docData);
61 |   })
62 |   .on('end', async () => {
63 |     const jsonOutput = JSON.stringify(documents, null, 2);
64 |     console.log(jsonOutput);
65 |     fs.writeFileSync('data.json', jsonOutput, 'utf8');
66 |   })
67 |   .on('error', (error) => {
68 |     console.error('Error reading CSV file: ', error);
69 |   });