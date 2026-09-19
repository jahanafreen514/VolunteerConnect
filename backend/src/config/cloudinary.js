const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'volunteerconnect/profiles',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const ngoDocsStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'volunteerconnect/ngo-docs',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
    }
});

const ngoLogoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'volunteerconnect/ngo-logos',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const opportunityStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'volunteerconnect/opportunities',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

module.exports = {
    cloudinary,
    profileStorage,
    ngoDocsStorage,
    ngoLogoStorage,
    opportunityStorage
};
