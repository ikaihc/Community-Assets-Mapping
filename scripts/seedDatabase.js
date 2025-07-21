const sequelize = require('../utils/database');
const User = require('../models/user');
const Category = require('../models/category');
const Address = require('../models/address');
const AssetContact = require('../models/asset_contact');
const Asset = require('../models/asset');

/**
 * Seed database with sample data for development and testing
 */
const seedDatabase = () => {
  console.log('🌱 Starting database seeding...');
  
  let guestUserId = null;
  let adminUserId = null;
  let navigatorUserId = null;
  let categoryIds = [];
  let addressIds = [];
  let contactIds = [];

  // Step 1: Get existing users (guest and admin should exist from createAdmin script)
  return User.findAll({
    attributes: ['id', 'email', 'role']
  })
  .then(users => {
    console.log('📋 Found existing users:', users.length);
    
    if (users.length === 0) {
      console.log('⚠️  No users found! Make sure createAdmin.js ran first.');
    }
    
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ID: ${user.id}`);
      // Look for guest user by email and role, not just role
      if (user.role === 'guest' && user.email === 'guest@system.local') {
        guestUserId = user.id;
      }
      if (user.role === 'admin') adminUserId = user.id;
      if (user.role === 'navigator') navigatorUserId = user.id;
    });

    console.log(`🔍 User IDs found - Guest: ${guestUserId}, Admin: ${adminUserId}, Navigator: ${navigatorUserId}`);

    // Create a sample navigator user if none exists
    if (!navigatorUserId) {
      console.log('👤 Creating sample navigator user...');
      return User.create({
        first_name: 'John',
        last_name: 'Navigator',
        email: 'navigator@example.com',
        password: '$2b$10$hashedPasswordExample',
        role: 'navigator',
        is_active: true
      });
    }
    return null;
  })
  .then(newNavigator => {
    if (newNavigator) {
      navigatorUserId = newNavigator.id;
      console.log('👤 Created sample navigator user with ID:', navigatorUserId);
    }
    
    // Validate that we have the required user IDs
    if (!guestUserId || !adminUserId) {
      throw new Error('Missing required users! Guest ID: ' + guestUserId + ', Admin ID: ' + adminUserId + 
                     '. Make sure createAdmin.js ran successfully first.');
    }

    // Step 2: Create sample categories
    const categories = [
      { name: 'Food & Nutrition', description: 'Food banks, community kitchens, nutrition programs' },
      { name: 'Healthcare', description: 'Medical clinics, mental health services, wellness programs' },
      { name: 'Education', description: 'Schools, libraries, tutoring programs, adult education' },
      { name: 'Housing', description: 'Shelters, affordable housing, housing assistance' },
      { name: 'Employment', description: 'Job training, career services, employment assistance' },
      { name: 'Community Services', description: 'Community centers, social services, support groups' },
      { name: 'Recreation', description: 'Parks, sports facilities, community events' },
      { name: 'Transportation', description: 'Public transit, ride services, transportation assistance' }
    ];

    return Promise.all(
      categories.map(category => Category.create(category))
    );
  })
  .then(createdCategories => {
    categoryIds = createdCategories.map(cat => cat.id);
    console.log('🏷️  Created categories:', categoryIds.length);

    // Step 3: Create sample addresses
    const addresses = [
      {
        street_address: '123 Main Street',
        city: 'Downtown',
        state: 'CA',
        postal_code: '90210',
        country: 'USA'
      },
      {
        street_address: '456 Oak Avenue',
        city: 'Riverside',
        state: 'CA',
        postal_code: '90211',
        country: 'USA'
      },
      {
        street_address: '789 Pine Road',
        city: 'Hillside',
        state: 'CA',
        postal_code: '90212',
        country: 'USA'
      },
      {
        street_address: '321 Cedar Lane',
        city: 'Westside',
        state: 'CA',
        postal_code: '90213',
        country: 'USA'
      },
      {
        street_address: '654 Elm Street',
        city: 'Eastside',
        state: 'CA',
        postal_code: '90214',
        country: 'USA'
      }
    ];

    return Promise.all(
      addresses.map(address => Address.create(address))
    );
  })
  .then(createdAddresses => {
    addressIds = createdAddresses.map(addr => addr.id);
    console.log('📍 Created addresses:', addressIds.length);

    // Step 4: Create sample contacts
    const contacts = [
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@foodbank.org',
        phone: '(555) 123-4567',
        job_title: 'Program Director'
      },
      {
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'mchen@healthclinic.org',
        phone: '(555) 234-5678',
        job_title: 'Community Coordinator'
      },
      {
        first_name: 'Emily',
        last_name: 'Rodriguez',
        email: 'emily.r@library.gov',
        phone: '(555) 345-6789',
        job_title: 'Outreach Librarian'
      },
      {
        first_name: 'David',
        last_name: 'Thompson',
        email: 'dthompson@shelter.org',
        phone: '(555) 456-7890',
        job_title: 'Case Manager'
      },
      {
        first_name: 'Lisa',
        last_name: 'Williams',
        email: 'lwilliams@jobcenter.org',
        phone: '(555) 567-8901',
        job_title: 'Employment Specialist'
      }
    ];

    return Promise.all(
      contacts.map(contact => AssetContact.create(contact))
    );
  })
  .then(createdContacts => {
    contactIds = createdContacts.map(contact => contact.id);
    console.log('👥 Created contacts:', contactIds.length);

    // Step 5: Create sample assets
    const assets = [
      {
        name: 'Downtown Community Food Bank',
        description: 'Provides free groceries and hot meals to families in need. Open Monday-Friday 9AM-5PM.',
        website: 'https://www.downtownfoodbank.org',
        status: 'approved',
        has_volunteer_opportunities: true,
        volunteer_description: 'Help sort donations, serve meals, and assist with distribution.',
        address_id: addressIds[0],
        contact_Info_Id: contactIds[0],
        created_by: guestUserId,
        last_Update_By: adminUserId,
        approved_by: adminUserId
      },
      {
        name: 'Riverside Health Clinic',
        description: 'Free and low-cost medical services including primary care, dental, and mental health services.',
        website: 'https://www.riversidehealth.org',
        status: 'approved',
        has_volunteer_opportunities: true,
        volunteer_description: 'Medical professionals and administrative volunteers needed.',
        address_id: addressIds[1],
        contact_Info_Id: contactIds[1],
        created_by: navigatorUserId,
        last_Update_By: navigatorUserId,
        approved_by: adminUserId
      },
      {
        name: 'Hillside Public Library',
        description: 'Community library offering books, computer access, educational programs, and free WiFi.',
        website: 'https://www.hillsidelibrary.gov',
        status: 'approved',
        has_volunteer_opportunities: true,
        volunteer_description: 'Help with reading programs, computer tutoring, and community events.',
        address_id: addressIds[2],
        contact_Info_Id: contactIds[2],
        created_by: navigatorUserId,
        last_Update_By: navigatorUserId,
        approved_by: adminUserId
      },
      {
        name: 'Westside Emergency Shelter',
        description: 'Temporary housing and support services for individuals and families experiencing homelessness.',
        website: 'https://www.westsidesheter.org',
        status: 'pending',
        has_volunteer_opportunities: true,
        volunteer_description: 'Meal preparation, donation sorting, and client support volunteers needed.',
        address_id: addressIds[3],
        contact_Info_Id: contactIds[3],
        created_by: guestUserId,
        last_Update_By: guestUserId
      },
      {
        name: 'Eastside Job Training Center',
        description: 'Career development, job placement services, and skills training programs for adults.',
        website: 'https://www.eastsidejobs.org',
        status: 'approved',
        has_volunteer_opportunities: false,
        address_id: addressIds[4],
        contact_Info_Id: contactIds[4],
        created_by: navigatorUserId,
        last_Update_By: navigatorUserId,
        approved_by: adminUserId
      }
    ];

    return Promise.all(
      assets.map(asset => Asset.create(asset))
    );
  })
  .then(createdAssets => {
    console.log('🏢 Created assets:', createdAssets.length);
    
    // Debug: Log the created asset IDs
    createdAssets.forEach((asset, index) => {
      console.log(`   Asset ${index + 1}: ${asset.name} (ID: ${asset.id})`);
    });

    // Step 6: Create asset-category associations using direct SQL
    const now = new Date();
    const associations = [
      { asset_id: createdAssets[0].id, category_id: categoryIds[0], createdAt: now, updatedAt: now }, // Food Bank -> Food & Nutrition
      { asset_id: createdAssets[1].id, category_id: categoryIds[1], createdAt: now, updatedAt: now }, // Health Clinic -> Healthcare
      { asset_id: createdAssets[2].id, category_id: categoryIds[2], createdAt: now, updatedAt: now }, // Library -> Education
      { asset_id: createdAssets[3].id, category_id: categoryIds[3], createdAt: now, updatedAt: now }, // Shelter -> Housing
      { asset_id: createdAssets[4].id, category_id: categoryIds[4], createdAt: now, updatedAt: now }  // Job Center -> Employment
    ];

    console.log('🔗 Creating associations:', associations.length);
    return sequelize.getQueryInterface().bulkInsert('asset_categories', associations);
  })
  .then(() => {
    console.log('🔗 Created asset-category associations');
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categoryIds.length}`);
    console.log(`   - Addresses: ${addressIds.length}`);
    console.log(`   - Contacts: ${contactIds.length}`);
    console.log(`   - Assets: 5`);
    console.log('   - Asset-Category associations: 5');
  })
  .catch(error => {
    console.error('❌ Error seeding database:', error);
    throw error;
  });
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
  .then(() => {
    console.log('🎉 Seeding script completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
