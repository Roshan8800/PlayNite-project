const fs = require('fs');
const { randomUUID } = require('crypto');

const inputFile = 'pornhub.com-db.csv';
const chunkSize = 10000; // 10,000 rows per chunk
let fileCount = 1;
let outputFile = `transformed-${fileCount}.json`;
let writeStream = fs.createWriteStream(outputFile);
const headers = ['id','title','category','duration','iframe_code','thumbnail_url','poster_url','tags','views','likes','dislikes','pornstar','posters.url','thumbnails.url'];
//const headers = ['id','title','category','duration','iframe_code','thumbnail_url','poster_url','tags','views','likes','dislikes','pornstar','posters.url','thumbnails.url'];
const records = [];


let rowCount = 0;

const stream = fs.createReadStream(inputFile, { encoding: 'utf8' });
let buffer = '';
stream.on('data', (chunk) => {
  buffer += chunk;
  let lines = buffer.split('\n');
  buffer = lines.pop(); // Keep the last incomplete line in buffer

  for (const line of lines) {
    if (!line.trim()) continue;

    const fields = line.split('|');
    if (fields.length < 13) continue; // skip incomplete rows

    const [
      iframe_code,
      thumbnail_url,
      thumbnails,
      title,
      tags,
      category,
      pornstar,
      duration,
      views,
      likes,
      dislikes,
      poster_url,
      posters
    ] = fields;

    // Generate UUID
    const id = randomUUID();

    // Handle category: use first if multiple
    const categoryArray = category ? category.split(';').map(c => c.trim()) : [];
    const finalCategory = categoryArray.length > 0 ? categoryArray[0] : '';

    // Convert semicolon separated to JSON arrays
    const tagsArray = tags ? tags.split(';').map(t => t.trim()).filter(t => t) : [];
    const postersArray = posters ? posters.split(';').map(p => p.trim()).filter(p => p) : [];
    const thumbnailsArray = thumbnails ? thumbnails.split(';').map(t => t.trim()).filter(t => t) : [];

    // JSON stringify arrays
    const tagsJson = JSON.stringify(tagsArray);
    const postersJson = JSON.stringify(postersArray);
    const thumbnailsJson = JSON.stringify(thumbnailsArray);

    // Use "" for missing values
    const transformed = {
      id,
      title: title || '',
      category: finalCategory,
      duration: duration || '',
      iframe_code: iframe_code || '',
      thumbnail_url: thumbnail_url || '',
      poster_url: poster_url || '',
      tags: tagsJson,
      views: views || '',
      likes: likes || '',
      dislikes: dislikes || '',
      pornstar: pornstar || '',
      'posters.url': postersJson,
      'thumbnails.url': thumbnailsJson
    };

    // Write row immediately
    const values = headers.map(h => {
      const val = transformed[h];
      // Escape commas and quotes in CSV
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    //writeStream.write(JSON.stringify(transformed) + '\n');
    writeStream.write(JSON.stringify(transformed) + '\n');
    rowCount++;
    if (rowCount % chunkSize === 0) {
      writeStream.end();
      fileCount++;
      outputFile = `transformed-${fileCount}.json`;
      writeStream = fs.createWriteStream(outputFile);
    }
  }
});

stream.on('end', () => {
  // Process any remaining buffer
  if (buffer.trim()) {
    const fields = buffer.split('|');
    if (fields.length >= 13) {
      // Process the last line
      const [
        iframe_code,
        thumbnail_url,
        thumbnails,
        title,
        tags,
        category,
        pornstar,
        duration,
        views,
        likes,
        dislikes,
        poster_url,
        posters
      ] = fields;

      const id = randomUUID();
      const categoryArray = category ? category.split(';').map(c => c.trim()) : [];
      const finalCategory = categoryArray.length > 0 ? categoryArray[0] : '';
      const tagsArray = tags ? tags.split(';').map(t => t.trim()).filter(t => t) : [];
      const postersArray = posters ? posters.split(';').map(p => p.trim()).filter(p => p) : [];
      const thumbnailsArray = thumbnails ? thumbnails.split(';').map(t => t.trim()).filter(t => t) : [];
      const tagsJson = JSON.stringify(tagsArray);
      const postersJson = JSON.stringify(postersArray);
      const thumbnailsJson = JSON.stringify(thumbnailsArray);

      const transformed = {
        id,
        title: title || '',
        category: finalCategory,
        duration: duration || '',
        iframe_code: iframe_code || '',
        thumbnail_url: thumbnail_url || '',
        poster_url: poster_url || '',
        tags: tagsJson,
        views: views || '',
        likes: likes || '',
        dislikes: dislikes || '',
        pornstar: pornstar || '',
        'posters.url': postersJson,
        'thumbnails.url': thumbnailsJson
      };

      const values = headers.map(h => {
        const val = transformed[h];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      //writeStream.write(values.join(',') + '\n');
      rowCount++;
    }
  }

  //const jsonOutput = JSON.stringify(records, null, 2);
  //writeStream.write('[' + jsonOutput + ']');
  writeStream.end();
  console.log(`Transformed ${rowCount} rows and saved to ${outputFile}`);
});

stream.on('error', (err) => {
  console.error('Error reading file:', err);
  writeStream.end();
});

writeStream.on('error', (err) => {
  console.error('Error writing file:', err);
});