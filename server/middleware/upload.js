const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Настройка доступа к Cloudinary
// Вставь свои данные из Dashboard Cloudinary
cloudinary.config({
  cloud_name: 'dbg2dkc3g',
  api_key: '662292873725755',
  api_secret: 'aQlhdIAsr0_dITQHLCKYWXbHoZw'
});

// 2. Настройка облачного хранилища
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'habitquest_uploads', // папка, которая создастся в облаке
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // оптимизация картинки
  },
});

// 3. Фильтр файлов (оставляем твой, он хороший)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = { upload };