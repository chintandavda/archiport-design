const axios = require('axios');
require('dotenv').config();

const getUserDetails = async (userId) => {
    try {
        const response = await axios.get(`${process.env.API_BASE_URL}/get_user_details/${userId}/`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:');
        throw error;
    }
};

module.exports = { getUserDetails };
