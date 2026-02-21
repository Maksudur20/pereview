const Perfume = require('../models/Perfume');
const Review = require('../models/Review');
const { validateUrl } = require('../utils/validators');

// @desc    Get all perfumes with filtering, sorting, pagination
// @route   GET /api/perfumes
const getPerfumes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      brand,
      category,
      minPrice,
      maxPrice,
      minRating,
      country,
      releaseYear,
      notes,
      search,
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (category) query.category = category;
    if (country) query.country = { $regex: country, $options: 'i' };
    if (releaseYear) query.releaseYear = parseInt(releaseYear);

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Minimum rating
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Notes filter (search across all note types)
    if (notes) {
      const noteArray = notes.split(',').map((n) => n.trim().toLowerCase());
      query.$or = [
        { 'notes.top': { $in: noteArray } },
        { 'notes.middle': { $in: noteArray } },
        { 'notes.base': { $in: noteArray } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Perfume.countDocuments(query);

    const perfumes = await Perfume.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: perfumes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single perfume by ID
// @route   GET /api/perfumes/:id
const getPerfumeById = async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.id).lean();

    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    res.json({ success: true, data: perfume });
  } catch (error) {
    next(error);
  }
};

// @desc    Create perfume (Admin)
// @route   POST /api/perfumes
const createPerfume = async (req, res, next) => {
  try {
    const {
      name, brand, designer, country, category, releaseYear,
      price, description, notes, buyLink,
    } = req.body;

    if (buyLink && !validateUrl(buyLink)) {
      return res.status(400).json({ message: 'Invalid buy link URL' });
    }

    // Handle notes - parse if string
    let parsedNotes = notes;
    if (typeof notes === 'string') {
      try {
        parsedNotes = JSON.parse(notes);
      } catch {
        parsedNotes = { top: [], middle: [], base: [] };
      }
    }

    // Normalize note values to lowercase
    if (parsedNotes) {
      if (parsedNotes.top) parsedNotes.top = parsedNotes.top.map((n) => n.toLowerCase().trim());
      if (parsedNotes.middle) parsedNotes.middle = parsedNotes.middle.map((n) => n.toLowerCase().trim());
      if (parsedNotes.base) parsedNotes.base = parsedNotes.base.map((n) => n.toLowerCase().trim());
    }

    const perfumeData = {
      name, brand, designer, country, category, releaseYear,
      price, description, notes: parsedNotes, buyLink,
      createdBy: req.user._id,
    };

    // Handle uploaded image
    if (req.file) {
      perfumeData.imageUrl = req.file.path;
    } else if (req.body.imageUrl) {
      perfumeData.imageUrl = req.body.imageUrl;
    }

    const perfume = await Perfume.create(perfumeData);
    res.status(201).json({ success: true, data: perfume });
  } catch (error) {
    next(error);
  }
};

// @desc    Update perfume (Admin)
// @route   PUT /api/perfumes/:id
const updatePerfume = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    if (updates.buyLink && !validateUrl(updates.buyLink)) {
      return res.status(400).json({ message: 'Invalid buy link URL' });
    }

    // Handle notes parsing
    if (typeof updates.notes === 'string') {
      try {
        updates.notes = JSON.parse(updates.notes);
      } catch {
        delete updates.notes;
      }
    }

    if (updates.notes) {
      if (updates.notes.top) updates.notes.top = updates.notes.top.map((n) => n.toLowerCase().trim());
      if (updates.notes.middle) updates.notes.middle = updates.notes.middle.map((n) => n.toLowerCase().trim());
      if (updates.notes.base) updates.notes.base = updates.notes.base.map((n) => n.toLowerCase().trim());
    }

    // Handle uploaded image
    if (req.file) {
      updates.imageUrl = req.file.path;
    }

    const perfume = await Perfume.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    res.json({ success: true, data: perfume });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete perfume (Admin)
// @route   DELETE /api/perfumes/:id
const deletePerfume = async (req, res, next) => {
  try {
    const perfume = await Perfume.findByIdAndDelete(req.params.id);

    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    // Delete all reviews for this perfume
    await Review.deleteMany({ perfumeId: req.params.id });

    res.json({ success: true, message: 'Perfume deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Track buy link click
// @route   POST /api/perfumes/:id/buy-click
const trackBuyClick = async (req, res, next) => {
  try {
    const perfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      { $inc: { buyClickCount: 1 } },
      { new: true }
    );

    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    res.json({ success: true, buyLink: perfume.buyLink });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar perfumes based on notes
// @route   GET /api/perfumes/:id/similar
const getSimilarPerfumes = async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.id);

    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    const allNotes = [
      ...perfume.notes.top,
      ...perfume.notes.middle,
      ...perfume.notes.base,
    ];

    const similar = await Perfume.find({
      _id: { $ne: perfume._id },
      $or: [
        { 'notes.top': { $in: allNotes } },
        { 'notes.middle': { $in: allNotes } },
        { 'notes.base': { $in: allNotes } },
      ],
    })
      .sort({ averageRating: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, data: similar });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare two perfumes
// @route   GET /api/perfumes/compare?ids=id1,id2
const comparePerfumes = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: 'Please provide perfume IDs to compare' });
    }

    const idArray = ids.split(',').map((id) => id.trim());

    if (idArray.length !== 2) {
      return res.status(400).json({ message: 'Please provide exactly 2 perfume IDs' });
    }

    const perfumes = await Perfume.find({ _id: { $in: idArray } }).lean();

    if (perfumes.length !== 2) {
      return res.status(404).json({ message: 'One or both perfumes not found' });
    }

    res.json({ success: true, data: perfumes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique brands
// @route   GET /api/perfumes/meta/brands
const getBrands = async (req, res, next) => {
  try {
    const brands = await Perfume.distinct('brand');
    res.json({ success: true, data: brands.sort() });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique notes
// @route   GET /api/perfumes/meta/notes
const getNotes = async (req, res, next) => {
  try {
    const [topNotes, middleNotes, baseNotes] = await Promise.all([
      Perfume.distinct('notes.top'),
      Perfume.distinct('notes.middle'),
      Perfume.distinct('notes.base'),
    ]);

    const allNotes = [...new Set([...topNotes, ...middleNotes, ...baseNotes])].sort();
    res.json({ success: true, data: allNotes });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPerfumes, getPerfumeById, createPerfume, updatePerfume,
  deletePerfume, trackBuyClick, getSimilarPerfumes, comparePerfumes,
  getBrands, getNotes,
};
