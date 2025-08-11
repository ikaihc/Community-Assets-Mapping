const User = require('../models/user');

/**
 * Get the system guest user ID
 * This user represents all anonymous asset submissions
 */
const getGuestUserId = () => {
  return User.findOne({
    where: {
      email: 'guest@system.local',
      role: 'guest',
      is_active: false
    },
    attributes: ['id']
  })
  .then(guestUser => {
    if (!guestUser) {
      throw new Error('System guest user not found. Please run the admin setup script first.');
    }
    return guestUser.id;
  });
};

/**
 * Check if a user ID belongs to the system guest user
 */
const isGuestUser = (userId) => {
  return getGuestUserId()
    .then(guestId => userId === guestId)
    .catch(() => false);
};

module.exports = {
  getGuestUserId,
  isGuestUser
};
