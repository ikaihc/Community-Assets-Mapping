const bcrypt = require('bcryptjs');
const User = require('../models/user');
const sequelize = require('../utils/database');

const createSystemUsers = () => {
  console.log('🚀 Creating system users...');

  // First hash the passwords
  const guestPasswordPromise = bcrypt.hash('NO_LOGIN_ALLOWED', 12);
  const adminPassword = process.env.ADMIN_PASSWORD || 'TempAdmin123!';
  const adminPasswordPromise = bcrypt.hash(adminPassword, 12);

  return Promise.all([guestPasswordPromise, adminPasswordPromise])
    .then(([guestHashedPassword, adminHashedPassword]) => {
      // Create guest user (ID = 1) - System user to represent anonymous submissions
      return User.findOrCreate({
        where: { id: 1 },
        defaults: {
          id: 1,
          first_name: 'Anonymous',
          last_name: 'Guest',
          email: 'guest@system.local',
          password: guestHashedPassword, // Unusable password
          role: 'guest',
          is_active: false // System user, cannot login - only for FK references
        }
      })
      .then(guestUser => {
        if (guestUser[1]) {
          console.log('✅ Guest user created (ID: 1)');
        } else {
          console.log('ℹ️  Guest user already exists (ID: 1)');
        }

        // Create admin user
        const adminEmail = 'admin@communityassets.com';
        
        return User.findOrCreate({
          where: { email: adminEmail },
          defaults: {
            first_name: 'System',
            last_name: 'Administrator',
            email: adminEmail,
            password: adminHashedPassword,
            role: 'admin',
            is_active: true
          }
        })
        .then(adminUser => {
          if (adminUser[1]) {
            console.log('✅ Admin user created');
            console.log(`📧 Email: ${adminEmail}`);
            if (!process.env.ADMIN_PASSWORD) {
              console.log('🚨 SECURITY WARNING: Using temporary password!');
              console.log('🔒 Temporary Password: TempAdmin123!');
              console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login!');
              console.log('💡 Production: Set ADMIN_PASSWORD environment variable');
            } else {
              console.log('✅ Password set securely from environment variable');
            }
          } else {
            console.log('ℹ️  Admin user already exists');
          }

          console.log('🎉 System users setup complete!');
        });
      });
    })
    .catch(error => {
      console.error('❌ Error creating system users:', error);
      throw error;
    });
};

// Allow running this file directly
if (require.main === module) {
  createSystemUsers()
    .then(() => {
      console.log('🏁 Script finished');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = createSystemUsers;
