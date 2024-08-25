const axios = require('axios');
require('dotenv').config();

const getUserDetails = async (userId) => {
    try {
        const response = await axios.get(`${process.env.API_BASE_URL}/get_auth_user_details/${userId}/`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:');
        throw error;
    }
};

// Second function to fetch user details by username
const fetchUserDetailsByUsername = async (username) => {
    try {
        const response = await axios.get(`${process.env.API_BASE_URL}/get_user_details/${username}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details by username from Django:', error);
        throw error;
    }
};

const fetchUserDetailsByUsernames = async (usernames) => {
    try {
        const response = await axios.post(`${process.env.API_BASE_URL}/get_user_details_batch/`, { usernames });
        const userDetailsList = response.data;

        // Create a map of username to user details
        const userDetailsMap = {};
        userDetailsList.forEach(user => {
            userDetailsMap[user.username] = user;
        });

        return userDetailsMap;
    } catch (error) {
        console.error('Error fetching user details in batch:', error);
        throw error;
    }
};


module.exports = { getUserDetails, fetchUserDetailsByUsername, fetchUserDetailsByUsernames };
