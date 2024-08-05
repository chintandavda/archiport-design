const express = require('express');
const router = express.Router();
const Design = require('../models/design');
const Like = require('../models/like');
const auth = require('../middleware/auth');
const { getUserDetails } = require('../services/userService');
const upload = require('../config/multer');


// get all the designs
router.get('/', async (req, res) => {
    try {
        const designs = await Design.find();
        res.send(designs);
    } catch (error) {
        console.error('Error fetching the designs', error);
        res.status(500).send(error.message);
    }
});


// Create a new design (requires authentication)
router.post('/', auth, upload, async (req, res) => {
    try {
        console.log('File:', req.file); // Log the file details
        console.log('Body:', req.body);

        const userId = req.user.user_id;
        const userDetails = await getUserDetails(userId);

        console.log("user id" + userDetails);
        if (!req.file) {
            return res.status(400).send('Image file is required');
        }

        const design = new Design({
            username: userDetails.username,
            image: req.file.path, // Use the path of the uploaded file
            caption: req.body.caption,
            location: req.body.location || 'Mumbai', // Default value for location
            likeCount: 0,
            saveCount: 0,
            viewCount: 0,
        });

        await design.save();
        console.log(design);
        res.send(design);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Get design posts by the logged-in user
router.get('/my-designs', auth, async (req, res) => {
    const designs = await Design.find({ author: req.user.id });
    res.send(designs);
});

// update design
router.put('/:id', auth, async (req, res) => {
    const design = await Design.findOneAndUpdate({ _id: req.params.id, author: req.user.id },
        req.body, { new: true }
    );
    if (!design) return res.status(404).send('Design not found ot not authorized');
    res.send(design)
})

// get a single design
router.get('/:id', async (req, res) => {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).send('Design not found');
    res.send(design);
});

// delete the post
router.delete('/:id', auth, async (req, res) => {
    const design = await Design.findByIdAndDelete({ _id: req.params.id, author: req.user.id });
    if (!design) return res.status(404).send('Desing not found');
    res.send({ message: 'Post Deleted' });
});


module.exports = router;