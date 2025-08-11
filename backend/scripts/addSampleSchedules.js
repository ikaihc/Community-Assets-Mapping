const Asset = require('../models/asset');
const sequelize = require('../utils/database');

async function addSampleSchedules() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Sample schedule structures
    const schedules = {
      recurring_weekdays: {
        type: 'recurring',
        entries: [
          {
            id: 'weekdays-1',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            startTime: '09:00',
            endTime: '17:00',
            isRecurring: true,
            notes: 'Monday through Friday'
          }
        ],
        lastUpdated: new Date().toISOString()
      },
      
      mixed_schedule: {
        type: 'recurring',
        entries: [
          {
            id: 'weekdays-2',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            startTime: '08:30',
            endTime: '16:30',
            isRecurring: true,
            notes: 'Weekdays'
          },
          {
            id: 'saturday-1',
            days: ['saturday'],
            startTime: '10:00',
            endTime: '15:00',
            isRecurring: true,
            notes: 'Saturday only'
          }
        ],
        lastUpdated: new Date().toISOString()
      },

      specific_dates: {
        type: 'specific_dates',
        entries: [
          {
            id: 'summer-2025',
            startDate: '2025-07-01',
            endDate: '2025-08-31',
            startTime: '10:00',
            endTime: '17:00',
            isRecurring: false,
            notes: 'Summer program'
          }
        ],
        lastUpdated: new Date().toISOString()
      }
    };

    // Get all approved assets
    const assets = await Asset.findAll({
      where: { status: 'approved' }
    });

    console.log(`Found ${assets.length} approved assets`);

    if (assets.length === 0) {
      console.log('No approved assets found to update');
      return;
    }

    // Assign different schedule types to different assets
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      let schedule;
      
      switch (i % 3) {
        case 0:
          schedule = schedules.recurring_weekdays;
          break;
        case 1:
          schedule = schedules.mixed_schedule;
          break;
        case 2:
          schedule = schedules.specific_dates;
          break;
      }

      const scheduleJson = JSON.stringify(schedule);
      
      await asset.update({
        service_hrs: scheduleJson
      });
      
      console.log(`Updated asset "${asset.name}" with ${schedule.type} schedule`);
    }

    console.log('\n✅ Schedule update complete!');
    console.log('\nYou can now view assets to see the new JSON-based schedules.');

  } catch (error) {
    console.error('Error updating schedules:', error);
  } finally {
    process.exit();
  }
}

console.log('🕒 Adding sample JSON schedules to assets...');
console.log('This will update the service_hrs field with structured JSON data.');
console.log('');

addSampleSchedules();
