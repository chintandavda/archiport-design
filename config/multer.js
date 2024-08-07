const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const s3 = require('./s3');


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
        key: (req, file, cb) => {
            const folderName = 'design_uploads'; // Name of the folder where files will be uploaded
            const fileName = Date.now().toString() + '-' + file.originalname;
            const fullPath = `${folderName}/${fileName}`;
            cb(null, fullPath);
        },
    }),
    limits: { fileSize: 3000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
}).single('image');

module.exports = upload;
