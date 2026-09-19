const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET && 
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

let profileStorage, ngoDocsStorage, ngoLogoStorage, opportunityStorage;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    profileStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'volunteerconnect/profiles',
            allowed_formats: ['jpg', 'png', 'jpeg']
        }
    });

    ngoDocsStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'volunteerconnect/ngo-docs',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
        }
    });

    ngoLogoStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'volunteerconnect/ngo-logos',
            allowed_formats: ['jpg', 'png', 'jpeg']
        }
    });

    opportunityStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'volunteerconnect/opportunities',
            allowed_formats: ['jpg', 'png', 'jpeg']
        }
    });
} else {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    });

    profileStorage = diskStorage;
    ngoDocsStorage = diskStorage;
    ngoLogoStorage = diskStorage;
    opportunityStorage = diskStorage;
}

module.exports = {
    isCloudinaryConfigured,
    cloudinary,
    profileStorage,
    ngoDocsStorage,
    ngoLogoStorage,
    opportunityStorage
};
