const Asset = require('../models/asset');
const Address = require('../models/address');
const AssetContact = require('../models/asset_contact');
const User = require('../models/user');

// Get all assets with pagination and filtering (only approved assets for regular users)
exports.getAllAssets = (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    has_volunteer_opportunities,
    city,
    search
  } = req.query;

  const offset = (page - 1) * limit;
  const whereClause = {};
  const addressWhere = {};

  // Regular users can only see approved assets
  // Navigators and admins can see all assets
  if (req.user.role === 'user') {
    whereClause.status = 'approved';
  } else if (status) {
    whereClause.status = status;
  } else {
    // If no status filter and user is navigator/admin, exclude deleted
    whereClause.status = { [require('sequelize').Op.ne]: 'deleted' };
  }

  // Filter by volunteer opportunities
  if (has_volunteer_opportunities !== undefined) {
    whereClause.has_volunteer_opportunities = has_volunteer_opportunities === 'true';
  }

  // Filter by city
  if (city) {
    addressWhere.city = { [require('sequelize').Op.iLike]: `%${city}%` };
  }

  // Search in name and description
  if (search) {
    whereClause[require('sequelize').Op.or] = [
      { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
      { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
    ];
  }

  Asset.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Address,
        as: 'address',
        where: Object.keys(addressWhere).length > 0 ? addressWhere : undefined,
        required: Object.keys(addressWhere).length > 0
      },
      {
        model: AssetContact,
        as: 'contact'
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'first_name', 'last_name', 'email']
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  })
  .then(result => {
    const { count, rows: assets } = result;
    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  })
  .catch(error => {
    console.error('Get all assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get single asset by ID
exports.getAssetById = (req, res) => {
  const { id } = req.params;

  Asset.findByPk(id, {
    include: [
      {
        model: Address,
        as: 'address'
      },
      {
        model: AssetContact,
        as: 'contact'
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'first_name', 'last_name', 'email']
      },
      {
        model: User,
        as: 'lastUpdater',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ]
  })
  .then(asset => {
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  })
  .catch(error => {
    console.error('Get asset by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Create new asset (submitted for approval)
exports.createAsset = (req, res) => {
  const {
    name,
    description,
    volunteer_details,
    has_volunteer_opportunities,
    service_hrs,
    // Address fields
    address,
    // Contact fields
    contact
  } = req.body;

  const userId = req.user.userId;

  // Validate required fields
  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: 'Name and description are required'
    });
  }

  let addressRecord = null;
  let contactRecord = null;

  // Create address first (if provided)
  const createAddressPromise = address ? Address.create(address) : Promise.resolve(null);
  
  createAddressPromise
  .then(addressResult => {
    addressRecord = addressResult;
    // Create contact information (if provided)
    return contact ? AssetContact.create(contact) : Promise.resolve(null);
  })
  .then(contactResult => {
    contactRecord = contactResult;

    // Determine initial status based on user role
    let initialStatus = 'pending'; // Default for regular users
    let approvedBy = null;
    let approvedAt = null;

    // Navigators and admins can auto-approve their own assets
    if (req.user.role === 'navigator' || req.user.role === 'admin') {
      initialStatus = 'approved';
      approvedBy = userId;
      approvedAt = new Date();
    }

    // Create asset
    return Asset.create({
      name,
      description,
      volunteer_details,
      has_volunteer_opportunities: has_volunteer_opportunities || false,
      status: initialStatus,
      service_hrs,
      created_by: userId,
      address_id: addressRecord ? addressRecord.id : null,
      contact_Info_Id: contactRecord ? contactRecord.id : null,
      approved_by: approvedBy,
      approved_at: approvedAt
    });
  })
  .then(asset => {
    // Fetch the created asset with all relations
    return Asset.findByPk(asset.id, {
      include: [
        { model: Address, as: 'address' },
        { model: AssetContact, as: 'contact' },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
  })
  .then(createdAsset => {
    const message = createdAsset.status === 'approved' 
      ? 'Asset created and approved successfully' 
      : 'Asset submitted for approval successfully';

    res.status(201).json({
      success: true,
      message: message,
      data: createdAsset
    });
  })
  .catch(error => {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Update asset
exports.updateAsset = (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    volunteer_details,
    has_volunteer_opportunities,
    status,
    service_hrs,
    address,
    contact
  } = req.body;

  const userId = req.user.userId;

  // Find asset
  Asset.findByPk(id)
  .then(asset => {
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if user owns the asset or is admin
    if (asset.created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own assets'
      });
    }

    // Update address if provided
    const updateAddressPromise = (address && asset.address_id) 
      ? Address.update(address, { where: { id: asset.address_id } })
      : Promise.resolve();

    // Update contact if provided
    const updateContactPromise = (contact && asset.contact_Info_Id)
      ? AssetContact.update(contact, { where: { id: asset.contact_Info_Id } })
      : Promise.resolve();

    return Promise.all([updateAddressPromise, updateContactPromise])
    .then(() => {
      // Update asset
      return asset.update({
        name: name || asset.name,
        description: description || asset.description,
        volunteer_details: volunteer_details || asset.volunteer_details,
        has_volunteer_opportunities: has_volunteer_opportunities !== undefined ? has_volunteer_opportunities : asset.has_volunteer_opportunities,
        status: status || asset.status,
        service_hrs: service_hrs || asset.service_hrs,
        last_Update_By: userId
      });
    });
  })
  .then(() => {
    // Fetch updated asset with relations
    return Asset.findByPk(id, {
      include: [
        { model: Address, as: 'address' },
        { model: AssetContact, as: 'contact' },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'lastUpdater', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
  })
  .then(updatedAsset => {
    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  })
  .catch(error => {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Delete asset
exports.deleteAsset = (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  Asset.findByPk(id)
  .then(asset => {
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if user owns the asset or is admin
    if (asset.created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own assets'
      });
    }

    // Soft delete - just update status to 'deleted'
    return asset.update({ status: 'deleted' });
  })
  .then(() => {
    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  })
  .catch(error => {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get assets by user (my assets)
exports.getMyAssets = (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { created_by: userId };
  if (status) {
    whereClause.status = status;
  }

  Asset.findAndCountAll({
    where: whereClause,
    include: [
      { model: Address, as: 'address' },
      { model: AssetContact, as: 'contact' }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  })
  .then(result => {
    const { count, rows: assets } = result;
    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  })
  .catch(error => {
    console.error('Get my assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get pending assets (Navigator/Admin only)
exports.getPendingAssets = (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  Asset.findAndCountAll({
    where: { status: 'pending' },
    include: [
      { model: Address, as: 'address' },
      { model: AssetContact, as: 'contact' },
      { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'ASC']] // Oldest first for review
  })
  .then(result => {
    const { count, rows: assets } = result;
    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  })
  .catch(error => {
    console.error('Get pending assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Approve asset (Navigator/Admin only)
exports.approveAsset = (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  Asset.findByPk(id)
  .then(asset => {
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    if (asset.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Asset is not in pending status'
      });
    }

    return asset.update({
      status: 'approved',
      approved_by: userId,
      approved_at: new Date()
    });
  })
  .then(() => {
    return Asset.findByPk(id, {
      include: [
        { model: Address, as: 'address' },
        { model: AssetContact, as: 'contact' },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
  })
  .then(approvedAsset => {
    res.status(200).json({
      success: true,
      message: 'Asset approved successfully',
      data: approvedAsset
    });
  })
  .catch(error => {
    console.error('Approve asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Reject asset (Navigator/Admin only)
exports.rejectAsset = (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;
  const userId = req.user.userId;

  if (!rejection_reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  Asset.findByPk(id)
  .then(asset => {
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    if (asset.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Asset is not in pending status'
      });
    }

    return asset.update({
      status: 'rejected',
      approved_by: userId,
      approved_at: new Date(),
      rejection_reason
    });
  })
  .then(() => {
    return Asset.findByPk(id, {
      include: [
        { model: Address, as: 'address' },
        { model: AssetContact, as: 'contact' },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });
  })
  .then(rejectedAsset => {
    res.status(200).json({
      success: true,
      message: 'Asset rejected successfully',
      data: rejectedAsset
    });
  })
  .catch(error => {
    console.error('Reject asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get assets by status (Navigator/Admin only)
exports.getAssetsByStatus = (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const validStatuses = ['pending', 'approved', 'rejected', 'deleted'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
    });
  }

  Asset.findAndCountAll({
    where: { status },
    include: [
      { model: Address, as: 'address' },
      { model: AssetContact, as: 'contact' },
      { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: User, as: 'approver', attributes: ['id', 'first_name', 'last_name', 'email'] }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  })
  .then(result => {
    const { count, rows: assets } = result;
    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  })
  .catch(error => {
    console.error('Get assets by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Get asset statistics (Navigator/Admin only)
exports.getAssetStats = (req, res) => {
  const totalAssetsPromise = Asset.count();
  const pendingAssetsPromise = Asset.count({ where: { status: 'pending' } });
  const approvedAssetsPromise = Asset.count({ where: { status: 'approved' } });
  const rejectedAssetsPromise = Asset.count({ where: { status: 'rejected' } });
  const deletedAssetsPromise = Asset.count({ where: { status: 'deleted' } });

  const assetsByUserPromise = Asset.findAll({
    attributes: [
      'created_by',
      [require('sequelize').fn('COUNT', require('sequelize').col('created_by')), 'count']
    ],
    include: [{
      model: User,
      as: 'creator',
      attributes: ['first_name', 'last_name', 'email']
    }],
    group: ['created_by', 'creator.id', 'creator.first_name', 'creator.last_name', 'creator.email'],
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('created_by')), 'DESC']]
  });

  Promise.all([
    totalAssetsPromise,
    pendingAssetsPromise,
    approvedAssetsPromise,
    rejectedAssetsPromise,
    deletedAssetsPromise,
    assetsByUserPromise
  ])
  .then(([
    totalAssets,
    pendingAssets,
    approvedAssets,
    rejectedAssets,
    deletedAssets,
    assetsByUser
  ]) => {
    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        pendingAssets,
        approvedAssets,
        rejectedAssets,
        deletedAssets,
        assetsByUser: assetsByUser.map(item => ({
          user: item.creator,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  })
  .catch(error => {
    console.error('Get asset stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};