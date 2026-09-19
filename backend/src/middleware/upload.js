const multer = require('multer');
const { 
    isCloudinaryConfigured,
    profileStorage, 
    ngoDocsStorage, 
    ngoLogoStorage, 
    opportunityStorage 
} = require('../config/cloudinary');

const normalizeFilePath = (req, res, next) => {
    if (!isCloudinaryConfigured) {
        if (req.file) {
            req.file.path = `/uploads/${req.file.filename}`;
        }
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(f => {
                f.path = `/uploads/${f.filename}`;
            });
        }
    }
    next();
};

const rawUploadProfileImage = multer({ storage: profileStorage }).single('profileImage');
const rawUploadNGODocuments = multer({ storage: ngoDocsStorage }).array('documents', 5);
const rawUploadNGOLogo = multer({ storage: ngoLogoStorage }).single('logo');
const rawUploadOpportunityImage = multer({ storage: opportunityStorage }).single('image');

const uploadProfileImage = (req, res, next) => {
    rawUploadProfileImage(req, res, (err) => {
        if (err) return next(err);
        normalizeFilePath(req, res, next);
    });
};

const uploadNGODocuments = (req, res, next) => {
    rawUploadNGODocuments(req, res, (err) => {
        if (err) return next(err);
        normalizeFilePath(req, res, next);
    });
};

const uploadNGOLogo = (req, res, next) => {
    rawUploadNGOLogo(req, res, (err) => {
        if (err) return next(err);
        normalizeFilePath(req, res, next);
    });
};

const uploadOpportunityImage = (req, res, next) => {
    rawUploadOpportunityImage(req, res, (err) => {
        if (err) return next(err);
        normalizeFilePath(req, res, next);
    });
};

module.exports = {
    uploadProfileImage,
    uploadNGODocuments,
    uploadNGOLogo,
    uploadOpportunityImage
};
