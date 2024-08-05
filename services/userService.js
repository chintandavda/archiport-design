const axios = require('axios');

const getUserDetails = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/get_user_details/${userId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:');
        throw error;
    }
};

module.exports = { getUserDetails };
