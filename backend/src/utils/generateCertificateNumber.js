const crypto = require('crypto');

const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
    return `VC-${year}-${randomHex}`;
};

module.exports = generateCertificateNumber;
