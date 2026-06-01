const Opportunity = require('../models/Opportunity');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Create a new exchange opportunity placement
 * @route   POST /api/opportunities
 * @access  Private/Admin
 */
const createOpportunity = async (req, res, next) => {
  try {
    const { title, programType, country, city, description, stipend, duration, skillsRequired, applicationDeadline, status } = req.body;

    const opportunity = await Opportunity.create({
      title,
      programType,
      country,
      city,
      description,
      stipend,
      duration,
      skillsRequired: skillsRequired || [],
      applicationDeadline,
      status: status || 'Open',
      createdBy: req.user._id, // Pre-attached by authenticateUser middleware
    });

    res.status(201).json({
      success: true,
      message: 'Exchange opportunity placement created successfully.',
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing exchange opportunity placement
 * @route   PUT /api/opportunities/:id
 * @access  Private/Admin
 */
const updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, programType, country, city, description, stipend, duration, skillsRequired, applicationDeadline, status } = req.body;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return next(new AppError('No exchange opportunity was found with the specified identifier.', 404));
    }

    // Safely update individual keys
    if (title !== undefined) opportunity.title = title;
    if (programType !== undefined) opportunity.programType = programType;
    if (country !== undefined) opportunity.country = country;
    if (city !== undefined) opportunity.city = city;
    if (description !== undefined) opportunity.description = description;
    if (stipend !== undefined) opportunity.stipend = stipend;
    if (duration !== undefined) opportunity.duration = duration;
    if (skillsRequired !== undefined) opportunity.skillsRequired = Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired];
    if (applicationDeadline !== undefined) opportunity.applicationDeadline = applicationDeadline;
    if (status !== undefined) opportunity.status = status;

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: 'Exchange opportunity placement updated successfully.',
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an existing exchange opportunity placement
 * @route   DELETE /api/opportunities/:id
 * @access  Private/Admin
 */
const deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findByIdAndDelete(id);

    if (!opportunity) {
      return next(new AppError('No exchange opportunity was found with the specified identifier.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Exchange opportunity placement deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all exchange opportunities (Admin list: both Open and Closed)
 * @route   GET /api/opportunities/admin/all
 * @access  Private/Admin
 */
const getAdminAllOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getAdminAllOpportunities,
};
