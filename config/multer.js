const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const s3 = require('./s3');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/', // Folder to store images
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});


// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 3000000 }, 
//     fileFilter: (req, file, cb) => {
//         checkFileType(file, cb);
//     },
// }).single('image'); 



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


// Initialize upload
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_STORAGE_BUCKET_NAME,
        limits: { fileSize: 3000000 }, // 3MB file size limit
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },

    }),
    limits: { fileSize: 3000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
}).single('image');

module.exports = upload;
