const express = require('express');
const router = express.Router();
const Design = require('../models/design');
const Like = require('../models/like');
const auth = require('../middleware/auth');
const { getUserDetails, fetchUserDetailsByUsername, fetchUserDetailsByUsernames } = require('../services/userService');
const upload = require('../config/multer');


router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userDetails = await getUserDetails(userId);

        // Fetch all designs, sorted by createdAt in descending order
        const designs = await Design.find().sort({ createdAt: -1 });

        // Extract all unique usernames from the designs
        const usernames = [...new Set(designs.map(design => design.username))].filter(Boolean);

        // Fetch user details for all usernames in a single request
        const userDetailsMap = await fetchUserDetailsByUsernames(usernames);

        // Fetch all the designs liked by the logged-in user
        const likedDesigns = await Like.find({ username: userDetails.username }).select('designId');
        const likedDesignIds = likedDesigns.map(like => like.designId.toString());

        // Map over the designs and attach the user details
        const designsWithUserDetails = designs.map((design) => {
            const userDetail = userDetailsMap[design.username];
            const isLiked = likedDesignIds.includes(design._id.toString());

            return {
                ...design.toObject(),
                fullName: userDetail ? `${userDetail.first_name} ${userDetail.last_name}` : '',
                userImage: userDetail ? userDetail.profile_image : null,
                isLiked
            };
        });

        res.send(designsWithUserDetails);
    } catch (error) {
        console.error('Error fetching the designs', error);
        res.status(500).send(error.message);
    }
});


router.get('/public-designs', async (req, res) => {
    try {
        // Fetch all designs, sorted by createdAt in descending order
        const designs = await Design.find().sort({ createdAt: -1 });

        // Extract all unique usernames from the designs
        const usernames = [...new Set(designs.map(design => design.username))].filter(Boolean);

        // Fetch user details for all usernames in a single request
        const userDetailsMap = await fetchUserDetailsByUsernames(usernames);

        // Map over the designs and attach the user details
        const designsWithUserDetails = designs.map((design) => {
            const userDetail = userDetailsMap[design.username];

            return {
                ...design.toObject(),
                fullName: userDetail ? `${userDetail.first_name} ${userDetail.last_name}` : '',
                userImage: userDetail ? userDetail.profile_image : null,
                isLiked: false // Non-authenticated users cannot like, so set to false
            };
        });

        res.send(designsWithUserDetails);

    } catch (error) {
        console.error('Error fetching the designs', error);
        res.status(500).send(error.message);
    }
});


// Get design posts by the logged-in user
router.get('/my-designs', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userDetails = await getUserDetails(userId);

        // Fetch all designs by the logged-in user
        const designs = await Design.find({ username: userDetails.username });

        // Fetch all the designs liked by the logged-in user
        const likedDesigns = await Like.find({ username: userDetails.username }).select('designId');
        const likedDesignIds = likedDesigns.map(like => like.designId.toString());

        // Map over the designs and check if they are liked by the logged-in user
        const designsWithUserDetails = await Promise.all(designs.map(async (design) => {
            try {
                // Fetch user details from Django using the username in the design
                const userDetails = await fetchUserDetailsByUsername(design.username);

                // Set the `isLiked` flag based on whether the designId is in likedDesignIds
                const isLiked = likedDesignIds.includes(design._id.toString());

                return {
                    ...design.toObject(),
                    fullName: `${userDetails.first_name} ${userDetails.last_name}`,  // Combine first and last name
                    userImage: userDetails.profile_image,  // Assuming profile_image comes from Django
                    isLiked,  // Add the isLiked flag to the design
                };
            } catch (error) {
                console.error('Error fetching user details for design:', error);
                return {
                    ...design.toObject(),
                    isLiked: likedDesignIds.includes(design._id.toString()) // Set isLiked even if user details fetch fails
                };
            }
        }));

        res.send(designsWithUserDetails);
    } catch (error) {
        console.error('Error fetching the designs', error);
        res.status(500).send(error.message);
    }
});

// Route to get designs by username
router.get('/user/username/:username', auth, async (req, res) => {
    try {
        const username = req.params.username;

        const userId = req.user.user_id;
        const userDetails = await getUserDetails(userId);

        // Fetch designs by username
        const designs = await Design.find({ username }).sort({ createdAt: -1 });

        if (!designs.length) {
            return res.json([]);
        }

        const likedDesigns = await Like.find({ username: userDetails.username }).select('designId');
        const likedDesignIds = likedDesigns.map(like => like.designId.toString());

        // Fetch user details for each design
        const designsWithUserDetails = await Promise.all(
            designs.map(async (design) => {
                try {
                    // Fetch user details from Django using the username in the design
                    const userDetails = await fetchUserDetailsByUsername(username);

                    return {
                        ...design.toObject(),
                        fullName: `${userDetails.first_name} ${userDetails.last_name}`,  // Combine first and last name
                        userImage: userDetails.profile_image,  // Assuming profile_image comes from Django
                        isLiked: likedDesignIds.includes(design._id.toString()), // Set isLiked to false for now (if no auth mechanism)
                    };
                } catch (error) {
                    console.error('Error fetching user details for design:', error);
                    return {
                        ...design.toObject(),
                        isLiked: false // Set isLiked as false if user details fetch fails
                    };
                }
            })
        );

        res.json(designsWithUserDetails);
    } catch (error) {
        console.error('Error fetching designs by username', error);
        res.status(500).json({ message: 'An error occurred while fetching designs.' });
    }
});


// Create a new design (requires authentication)
router.post('/', auth, upload, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userDetails = await getUserDetails(userId);

        if (!req.file) {
            return res.status(400).send('Image file is required');
        }

        const design = new Design({
            username: userDetails.username,
            image: req.file.location, // Use the path of the uploaded file
            caption: req.body.caption,
            location: req.body.location || 'Mumbai', // Default value for location
            likeCount: 0,
            saveCount: 0,
            viewCount: 0,
        });

        await design.save();
        res.send(design);
    } catch (error) {
        console.error('Error while saving design:', error);
        res.status(500).send(error.message);
    }
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

// Delete the post
router.delete('/:id', auth, async (req, res) => {
    try {
        // First, fetch the design by ID
        const design = await Design.findById(req.params.id);

        // Check if the design exists and if the user is the author
        if (!design) {
            return res.status(404).send('Design not found');
        }

        const userDetails = await getUserDetails(req.user.user_id);

        // Assuming you're storing the author's user ID in the `author` field (change if necessary)
        if (design.username.toString() !== userDetails.username) {
            return res.status(403).send('You are not authorized to delete this post');
        }

        // If authorized, delete the post
        await Design.findByIdAndDelete(req.params.id);

        // Delete all likes associated with this design
        await Like.deleteMany({ designId: req.params.id });

        console.log('Post Deleted by: ', userDetails.username);
        res.send({ message: 'Post Deleted' });
    } catch (error) {
        console.error('Failed to delete the post:', error);
        res.status(500).send('Server error');
    }
});


// Delete post while deleting the user
router.delete('/user/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Step 1: Find all designs by the user and delete them
        const userDesigns = await Design.find({ username: username });
        const designIds = userDesigns.map((design) => design._id);

        if (designIds.length > 0) {
            // Delete all likes associated with the user's designs
            await Like.deleteMany({ designId: { $in: designIds } });

            // Delete the user's designs
            await Design.deleteMany({ _id: { $in: designIds } });

            console.log(`User's designs and associated likes deleted for username: ${username}`);
        }

        // Step 2: Find all likes made by the user on other designs and decrement their likeCount
        const userLikes = await Like.find({ username: username });
        const likedDesignIds = userLikes.map((like) => like.designId);

        if (likedDesignIds.length > 0) {
            // Decrement the likeCount for each design that the user liked
            await Design.updateMany(
                { _id: { $in: likedDesignIds } },
                { $inc: { likeCount: -1 } }
            );

            // Delete all likes made by the user on other designs
            await Like.deleteMany({ username: username });

            console.log(`User's likes deleted and likeCounts decremented for username: ${username}`);
        }
        res.send({ message: 'User designs and associated likes deleted successfully' });
    } catch (error) {
        console.error('Failed to delete the designs and likes:', error);
        res.status(500).send('Server error');
    }
});



router.post('/like', async (req, res) => {
    try {
        const { designId, username } = req.body;

        // Check if username is null
        if (!username) {
            return res.status(400).json({ message: 'Username is required to like a post.' });
        }

        // Check if the user has already liked this design
        const existingLike = await Like.findOne({ designId, username });
        if (existingLike) {
            return res.status(400).json({ message: 'You have already liked this design.' });
        }

        // Create a new like
        const newLike = new Like({ designId, username });
        await newLike.save();

        // Increment the like count on the design
        await Design.findByIdAndUpdate(designId, { $inc: { likeCount: 1 } });

        res.status(200).json({ message: 'Design liked successfully!' });
    } catch (error) {
        console.error('Error liking design:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Unlike a design
router.post('/unlike', async (req, res) => {
    try {
        const { designId, username } = req.body;

        // Check if the user has liked this design
        const existingLike = await Like.findOne({ designId, username });
        if (!existingLike) {
            return res.status(400).json({ message: 'You have not liked this design.' });
        }

        // Remove the like
        await Like.deleteOne({ designId, username });

        // Optionally, decrement the like count on the design
        await Design.findByIdAndUpdate(designId, { $inc: { likeCount: -1 } });

        res.status(200).json({ message: 'Design unliked successfully!' });
    } catch (error) {
        console.error('Error unliking design:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;