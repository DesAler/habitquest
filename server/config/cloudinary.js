const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dbg2dkc3g',
  api_key: '662292873725755',
  api_secret: 'aQlhdIAsr0_dITQHLCKYWXbHoZw'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'habitquest_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

module.exports = storage;