const multer = require('multer');
const path = require('path');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const { AppError } = require('./errorMiddleware');

// 1. Storage definition for Cloudinary (Memory Storage)
const memoryStorage = multer.memoryStorage();

// 2. Storage definition for Local Fallback (Disk Storage)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using user ID and current timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `resume-${req.user._id}-${uniqueSuffix}${fileExtension}`);
  },
});

// 3. Strict PDF Filter: only allow .pdf documents
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Format Rejected: Only PDF documents are allowed as resume uploads.', 400), false);
  }
};

// Enforce max file size boundaries (Default is 5MB)
const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
};

// 4. Instantiate Multer instances dynamically based on config
const uploadToCloudinary = multer({
  storage: memoryStorage,
  fileFilter,
  limits,
}).single('resume');

const uploadToDisk = multer({
  storage: diskStorage,
  fileFilter,
  limits,
}).single('resume');

/**
 * Dynamic Upload Middleware
 */
const uploadResume = (req, res, next) => {
  if (isCloudinaryConfigured) {
    uploadToCloudinary(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Upload Failed: Resume size exceeds the maximum limit of 5MB.', 400));
        }
        return next(new AppError(`Multer upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  } else {
    uploadToDisk(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Upload Failed: Resume size exceeds the maximum limit of 5MB.', 400));
        }
        return next(new AppError(`Multer upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  }
};

module.exports = {
  uploadResume,
};
