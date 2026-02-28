import ColorSet from '../../models/ColorSet.js';
import ColorSetItem from '../../models/ColorSetItem.js';
import Color from '../../models/Color.js';
import Grade from '../../models/Grade.js';

/** List color sets: user's own + all admin sets */
export const list = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sets = await ColorSet.find({
      $or: [{ createdBy: userId }, { isAdminSet: true }],
    })
      .populate('createdBy', 'name')
      .populate('product', 'name image')
      .sort({ updatedAt: -1 })
      .lean();

    const setIds = sets.map((s) => s._id);
    const items = await ColorSetItem.find({ colorSet: { $in: setIds } })
      .populate('color')
      .sort({ order: 1 })
      .lean();

    const colorIdsBySet = {};
    items.forEach((item) => {
      if (!item.color) return;
      if (!colorIdsBySet[item.colorSet]) colorIdsBySet[item.colorSet] = [];
      colorIdsBySet[item.colorSet].push(item.color);
    });

    const result = sets.map((s) => ({
      ...s,
      colors: colorIdsBySet[s._id] || [],
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list color sets' });
  }
};

/** Get one color set with colors and product; include grades per product for add-to-cart */
export const get = async (req, res) => {
  try {
    const set = await ColorSet.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('product', 'name image')
      .lean();
    if (!set) {
      return res.status(404).json({ message: 'Color set not found' });
    }

    const items = await ColorSetItem.find({ colorSet: req.params.id })
      .populate({ path: 'color', populate: { path: 'product', select: 'name image minimumOrderQuantity' } })
      .sort({ order: 1 })
      .lean();

    const colors = (items.map((i) => i.color).filter(Boolean));
    const productIds = [...new Set(colors.map((c) => c.product?._id).filter(Boolean))];
    const gradesByProduct = {};
    await Promise.all(
      productIds.map(async (pid) => {
        const grades = await Grade.find({ product: pid }).lean();
        gradesByProduct[pid] = grades;
      })
    );

    const colorsWithGrades = colors.map((c) => ({
      ...c,
      product: c.product ? { ...c.product, grades: gradesByProduct[c.product._id] || [] } : null,
    }));

    res.status(200).json({ ...set, colors: colorsWithGrades });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to get color set' });
  }
};

/** Create color set (name, product?, colorIds, isAdminSet) */
export const create = async (req, res) => {
  try {
    const { name, product, colorIds, isAdminSet } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const set = await ColorSet.create({
      name: name.trim(),
      createdBy: req.user._id,
      product: product || undefined,
      isAdminSet: isAdminSet === true,
    });

    const ids = Array.isArray(colorIds) ? colorIds : [];
    await ColorSetItem.insertMany(
      ids.map((colorId, index) => ({
        colorSet: set._id,
        color: colorId,
        order: index,
      }))
    );

    const populated = await ColorSet.findById(set._id)
      .populate('createdBy', 'name')
      .populate('product', 'name image')
      .lean();
    const items = await ColorSetItem.find({ colorSet: set._id }).populate('color').lean();
    const data = { ...populated, colors: items.map((i) => i.color).filter(Boolean) };
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create color set' });
  }
};

/** Update color set (name, product?, colorIds, isAdminSet for admin only) */
export const update = async (req, res) => {
  try {
    const set = await ColorSet.findById(req.params.id);
    if (!set) return res.status(404).json({ message: 'Color set not found' });

    const isAdmin = req.isAdmin === true;
    const isOwner = String(set.createdBy) === String(req.user._id);
    const canEdit = isOwner || (set.isAdminSet && isAdmin);
    if (!canEdit) {
      return res.status(403).json({ message: 'Not allowed to edit this color set' });
    }

    const { name, product, colorIds, isAdminSet } = req.body;
    if (name != null && typeof name === 'string') set.name = name.trim();
    if (product !== undefined) set.product = product || undefined;
    if (isAdmin && isAdminSet !== undefined) set.isAdminSet = isAdminSet === true;
    await set.save();

    if (Array.isArray(colorIds)) {
      await ColorSetItem.deleteMany({ colorSet: set._id });
      await ColorSetItem.insertMany(
        colorIds.map((colorId, index) => ({
          colorSet: set._id,
          color: colorId,
          order: index,
        }))
      );
    }

    const populated = await ColorSet.findById(set._id)
      .populate('createdBy', 'name')
      .populate('product', 'name image')
      .lean();
    const items = await ColorSetItem.find({ colorSet: set._id }).populate('color').lean();
    const data = { ...populated, colors: items.map((i) => i.color).filter(Boolean) };
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update color set' });
  }
};

/** Delete color set */
export const remove = async (req, res) => {
  try {
    const set = await ColorSet.findById(req.params.id);
    if (!set) return res.status(404).json({ message: 'Color set not found' });

    const isAdmin = req.isAdmin === true;
    const isOwner = String(set.createdBy) === String(req.user._id);
    const canDelete = isOwner || (set.isAdminSet && isAdmin);
    if (!canDelete) {
      return res.status(403).json({ message: 'Not allowed to delete this color set' });
    }

    await ColorSetItem.deleteMany({ colorSet: set._id });
    await ColorSet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Color set deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete color set' });
  }
};

/** Get colors for a product (for add-to-set form) */
export const productColors = async (req, res) => {
  try {
    const colors = await Color.find({ product: req.params.productId }).lean();
    res.status(200).json(colors);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to get product colors' });
  }
};
