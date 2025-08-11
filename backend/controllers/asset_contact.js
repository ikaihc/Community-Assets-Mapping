const AssetContact = require('../models/asset_contact');

// Get all asset contacts
exports.getAllAssetContacts = (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;
  const whereClause = {};

  // Search in name and email
  if (search) {
    whereClause[require('sequelize').Op.or] = [
      { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
    ];
  }

  AssetContact.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['name', 'ASC']]
  })
  .then(result => {
    const { count, rows: contacts } = result;
    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  })
  .catch(error => {
    console.error('Get all asset contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get asset contact by ID
exports.getAssetContactById = (req, res) => {
  const { id } = req.params;

  AssetContact.findByPk(id)
  .then(contact => {
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Asset contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  })
  .catch(error => {
    console.error('Get asset contact by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Create new asset contact
exports.createAssetContact = (req, res) => {
  const {
    name,
    email,
    phone_number,
    website
  } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Contact name is required'
    });
  }

  // Validate email format if provided
  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Validate website URL if provided
  if (website && !isValidUrl(website)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid website URL format'
    });
  }

  AssetContact.create({
    name,
    email,
    phone_number,
    website
  })
  .then(contact => {
    res.status(201).json({
      success: true,
      message: 'Asset contact created successfully',
      data: contact
    });
  })
  .catch(error => {
    console.error('Create asset contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Update asset contact
exports.updateAssetContact = (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone_number,
    website
  } = req.body;

  AssetContact.findByPk(id)
  .then(contact => {
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Asset contact not found'
      });
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate website URL if provided
    if (website && !isValidUrl(website)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website URL format'
      });
    }

    return contact.update({
      name: name || contact.name,
      email: email !== undefined ? email : contact.email,
      phone_number: phone_number !== undefined ? phone_number : contact.phone_number,
      website: website !== undefined ? website : contact.website
    });
  })
  .then(contact => {
    res.status(200).json({
      success: true,
      message: 'Asset contact updated successfully',
      data: contact
    });
  })
  .catch(error => {
    console.error('Update asset contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Delete asset contact
exports.deleteAssetContact = (req, res) => {
  const { id } = req.params;

  AssetContact.findByPk(id)
  .then(contact => {
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Asset contact not found'
      });
    }

    return contact.destroy();
  })
  .then(() => {
    res.status(200).json({
      success: true,
      message: 'Asset contact deleted successfully'
    });
  })
  .catch(error => {
    console.error('Delete asset contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Helper functions for validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}