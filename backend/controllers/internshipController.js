const Internship = require('../models/Internship');

// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
exports.getInternships = async (req, res) => {
  try {
    const { type, location, search } = req.query;
    let query = { status: 'approved' };

    if (type) query.type = type;
    if (location) query.location = location;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const internships = await Internship.find(query)
      .populate('company', 'companyName location')
      .sort({ createdAt: -1 });

    res.json(internships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('company', 'companyName description location industry');
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    
    res.json(internship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create internship
// @route   POST /api/internships
// @access  Private (Company only)
exports.createInternship = async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can post internships' });
    }

    const internship = new Internship({
      ...req.body,
      company: req.user.id,
      companyName: req.user.companyName,
      createdBy: req.user.id
    });

    await internship.save();
    res.status(201).json(internship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Company only)
exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (internship.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(internship, req.body);
    await internship.save();
    
    res.json(internship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Company only)
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (internship.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await internship.deleteOne();
    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get company's internships
// @route   GET /api/internships/company/my-posts
// @access  Private (Company only)
exports.getCompanyInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ company: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(internships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};