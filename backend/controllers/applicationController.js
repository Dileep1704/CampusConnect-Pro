const Application = require('../models/Application');
const Internship = require('../models/Internship');

// @desc    Apply to internship
// @route   POST /api/applications
// @access  Private (Student only)
exports.applyToInternship = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply' });
    }

    const { internshipId, coverLetter } = req.body;

    // Check if internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      internship: internshipId,
      student: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this internship' });
    }

    // Create application
    const application = new Application({
      internship: internshipId,
      student: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      resumeUrl: req.user.resumeUrl,
      coverLetter
    });

    await application.save();

    // Increment applications count
    internship.applicationsCount += 1;
    await internship.save();

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/my-applications
// @access  Private (Student only)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('internship')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get applications for company's internships
// @route   GET /api/applications/company/applications
// @access  Private (Company only)
exports.getCompanyApplications = async (req, res) => {
  try {
    const internships = await Internship.find({ company: req.user.id });
    const internshipIds = internships.map(i => i._id);

    const applications = await Application.find({
      internship: { $in: internshipIds }
    })
    .populate('internship')
    .populate('student', 'name email university major')
    .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Company only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('internship');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the internship
    if (application.internship.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Student only)
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await application.deleteOne();

    // Decrement applications count
    await Internship.findByIdAndUpdate(application.internship, {
      $inc: { applicationsCount: -1 }
    });

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};