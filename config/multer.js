const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/', // Folder to store images
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 3000000 }, // 1MB file size limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
}).single('image'); // 'image' is the name of the form field

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = upload;
