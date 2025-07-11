const Address = require('../models/address');
const { Op, literal } = require('sequelize');

// Get all addresses
exports.getAllAddresses = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, post_code } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter by city
    if (city) {
      whereClause.city = { [Op.iLike]: `%${city}%` };
    }

    // Filter by post code
    if (post_code) {
      whereClause.post_code = post_code;
    }

    const { count, rows: addresses } = await Address.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['city', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: addresses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get address by ID
exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      data: address
    });

  } catch (error) {
    console.error('Get address by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new address
exports.createAddress = async (req, res) => {
  try {
    const {
      city,
      city_code,
      street_address,
      post_code,
      longitude,
      latitude,
      google_maps_url
    } = req.body;

    // Validate required fields
    if (!street_address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Street address and city are required'
      });
    }

    const address = await Address.create({
      city,
      city_code,
      street_address,
      post_code,
      longitude,
      latitude,
      google_maps_url
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: address
    });

  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.destroy();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search addresses by coordinates (nearby)
exports.searchNearbyAddresses = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Using Haversine formula to find nearby addresses
    const addresses = await Address.findAll({
      where: literal(`
        (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * sin(radians(latitude)))) <= ${radius}
      `),
      order: literal(`
        (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * sin(radians(latitude)))
      `)
    });

    res.status(200).json({
      success: true,
      data: addresses,
      searchCenter: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      radiusKm: parseFloat(radius)
    });

  } catch (error) {
    console.error('Search nearby addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

