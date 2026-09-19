const multer = require('multer');
const { profileStorage, ngoDocsStorage, ngoLogoStorage, opportunityStorage } = require('../config/cloudinary');

const uploadProfileImage = multer({ storage: profileStorage }).single('profileImage');
const uploadNGODocuments = multer({ storage: ngoDocsStorage }).array('documents', 5);
const uploadNGOLogo = multer({ storage: ngoLogoStorage }).single('logo');
const uploadOpportunityImage = multer({ storage: opportunityStorage }).single('image');

module.exports = {
    uploadProfileImage,
    uploadNGODocuments,
    uploadNGOLogo,
    uploadOpportunityImage
};
