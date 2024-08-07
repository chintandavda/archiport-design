const axios = require('axios');
require('dotenv').config();

// API_BASE_URL=http://localhost:8000/api

const getUserDetails = async (userId) => {
    console.log('auth');

    try {
        const response = await axios.get(`${process.env.API_BASE_URL}/get_user_details/${userId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:');
        throw error;
    }
};

module.exports = { getUserDetails };
