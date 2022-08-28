const express = require('express')
const router = express.Router()

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/profileImages/');
    },
    filename: function(req, file, cb) {
        cb(null,  Math.floor(10000 + Math.random() * 90000).toString() + file.originalname.replaceAll(' ',''));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG, JPG and PNG images are allowed.'), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024*1024
    },
    fileFilter: fileFilter
});

router.post('/profileImage',upload.single('profileImage'), async (req, res) => {
    console.log(req.file);

    if(req.file.path) {
        res.status(200).json({
            message:'Uploaded Successfully',
            path: req.file.path.replaceAll('\\','/')
        })
    }
    else{
        res.status(500).json({
            Error: 'Some error occured while uploading.'
        })
    }
});

module.exports = router