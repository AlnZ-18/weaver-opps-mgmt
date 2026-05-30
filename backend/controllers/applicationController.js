const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Submit an application for an opportunity
 * @route   POST /api/applications/:opportunityId
 * @access  Private/Student
 */
const applyForOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;

    // 1. Verify that the opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return next(new AppError('No opportunity found with that ID.', 404));
    }

    // 2. Verify that the opportunity is open and deadline has not passed
    if (opportunity.status !== 'open') {
      return next(new AppError('This exchange opportunity is no longer accepting applications.', 400));
    }

    if (new Date() > new Date(opportunity.deadline)) {
      return next(new AppError('The application deadline for this opportunity has passed.', 400));
    }

    // 3. Verify that the student has uploaded a resume in their profile
    if (!req.user.profile || !req.user.profile.resumeUrl) {
      return next(
        new AppError('Please upload a PDF resume to your profile before applying for opportunities.', 400)
      );
    }

    // 4. Check if student has already applied to this specific opportunity
    const alreadyApplied = await Application.findOne({
      student: req.user._id,
      opportunity: opportunityId,
    });
    if (alreadyApplied) {
      return next(new AppError('You have already submitted an application for this opportunity.', 400));
    }

    // 5. Create application and record submission history logs
    const application = await Application.create({
      student: req.user._id,
      opportunity: opportunityId,
      resumeSnapshotUrl: req.user.profile.resumeUrl,
      status: 'applied',
      statusHistory: [
        {
          status: 'applied',
          updatedBy: req.user._id,
          comment: 'Application submitted successfully via student portal.',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. AIESEC Amaravati will review your profile shortly.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applications submitted by the logged-in student
 * @route   GET /api/applications/my-applications
 * @access  Private/Student
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'opportunity',
        select: 'title type subType location duration status deadline',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications (Admin view with filters)
 * @route   GET /api/applications/admin/all
 * @access  Private/Admin
 */
const getAllApplications = async (req, res, next) => {
  try {
    const { status, opportunityId } = req.query;
    const filter = {};

    // Filter by status (applied, reviewing, interviewing, accepted, rejected)
    if (status) {
      filter.status = status;
    }

    // Filter by specific opportunity ID
    if (opportunityId) {
      filter.opportunity = opportunityId;
    }

    const applications = await Application.find(filter)
      .populate('student', 'name email profile')
      .populate('opportunity', 'title type subType location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single application details
 * @route   GET /api/applications/admin/:id
 * @access  Private/Admin
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email profile')
      .populate('opportunity')
      .populate('statusHistory.updatedBy', 'name role');

    if (!application) {
      return next(new AppError('No application found with that ID.', 404));
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (Admin review action)
 * @route   PATCH /api/applications/admin/:id/status
 * @access  Private/Admin
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;

    if (!status) {
      return next(new AppError('Please specify the new application status.', 400));
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new AppError('No application found with that ID.', 404));
    }

    // Update root level status
    application.status = status;

    // Push new entry into status history logs array
    application.statusHistory.push({
      status,
      updatedBy: req.user._id, // The logged-in admin user
      comment: comment || `Application moved to state: ${status}`,
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status transitioned to '${status}' successfully.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForOpportunity,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
};
