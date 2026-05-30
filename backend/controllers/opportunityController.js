const Opportunity = require('../models/Opportunity');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Create a new opportunity (GV or GTa)
 * @route   POST /api/opportunities
 * @access  Private/Admin
 */
const createOpportunity = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      subType,
      location,
      duration,
      salary,
      vacancies,
      requirements,
      responsibilities,
      deadline,
    } = req.body;

    // Build opportunity object
    const opportunity = await Opportunity.create({
      title,
      description,
      type,
      subType,
      location,
      duration,
      salary,
      vacancies,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      deadline,
      creator: req.user._id, // Set by protect middleware
    });

    res.status(201).json({
      success: true,
      message: `${type === 'GTa' ? 'Global Talent' : 'Global Volunteer'} opportunity created successfully.`,
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all opportunities (Public with filters & search)
 * @route   GET /api/opportunities
 * @access  Public
 */
const getOpportunities = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const filter = {};

    // 1. Filter by Program Type (GTa or GV)
    if (type) {
      filter.type = type;
    }

    // 2. Filter by status (default to open, or support viewing closed ones)
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'open'; // Default to active ones
    }

    // 3. Search query (matches title or subType)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subType: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const opportunities = await Opportunity.find(filter)
      .populate('creator', 'name email')
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

/**
 * @desc    Get details of a specific opportunity
 * @route   GET /api/opportunities/:id
 * @access  Public
 */
const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate('creator', 'name email');

    if (!opportunity) {
      return next(new AppError('No opportunity found with that ID.', 404));
    }

    res.status(200).json({
      success: true,
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an opportunity
 * @route   PUT /api/opportunities/:id
 * @access  Private/Admin
 */
const updateOpportunity = async (req, res, next) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return next(new AppError('No opportunity found with that ID.', 404));
    }

    // Perform update
    opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Opportunity details updated successfully.',
      opportunity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an opportunity
 * @route   DELETE /api/opportunities/:id
 * @access  Private/Admin
 */
const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return next(new AppError('No opportunity found with that ID.', 404));
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
};
