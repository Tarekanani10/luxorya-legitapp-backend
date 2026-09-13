const { formidable } = require('formidable');
const fs = require('fs');
const FormData = require('form-data');
const { handlePreflight, legitApp, sendError } = require('./_lib');

// Vercel: disable the default body parser so formidable can read the
// raw multipart stream itself.
module.exports.config = { api: { bodyParser: false } };

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [, files] = await form.parse(req);

    const uploaded = files.image?.[0];
    if (!uploaded) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(uploaded.filepath), {
      filename: uploaded.originalFilename || 'photo.jpg',
      contentType: uploaded.mimetype || 'image/jpeg',
    });

    const response = await legitApp.post('/asset_image', formData, {
      headers: formData.getHeaders(),
    });

    res.status(200).json({ image_url: response.data.url });
  } catch (error) {
    sendError(res, error);
  }
};
