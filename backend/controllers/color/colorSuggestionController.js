import ColorSuggestion from '../../models/ColorSuggestion.js';
import { sendWhatsAppTemplate } from '../../services/whatsappService.js';

// Create a color suggestion (protected — any logged-in user). Only hexCode from user; name/colorCode set by admin on approval.
export const createSuggestion = async (req, res) => {
  const { hexCode, product, notes, imageUrl } = req.body;
  if (!hexCode || typeof hexCode !== 'string' || !hexCode.trim()) {
    return res.status(400).json({ success: false, message: 'Hex code is required.' });
  }
  try {
    const suggestion = await ColorSuggestion.create({
      user: req.user._id,
      hexCode: hexCode.trim(),
      product: product || undefined,
      notes: notes || undefined,
      imageUrl: imageUrl || undefined,
    });
    return res.status(201).json({ success: true, data: suggestion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get suggestions by the current user
export const getMySuggestions = async (req, res) => {
  try {
    const suggestions = await ColorSuggestion.find({ user: req.user._id })
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all suggestions
export const getAllSuggestions = async (req, res) => {
  try {
    const suggestions = await ColorSuggestion.find()
      .populate('user', 'name email phone')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update suggestion status. For approval, admin must send name and colorCode (decided by admin).
export const updateSuggestionStatus = async (req, res) => {
  const { id } = req.params;
  const body = req.body ?? {};
  const { status, adminNotes, name, colorCode } = body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be pending, approved, or rejected.' });
  }
  if (status === 'approved') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Color name is required when approving.' });
    }
    if (!colorCode || typeof colorCode !== 'string' || !colorCode.trim()) {
      return res.status(400).json({ success: false, message: 'Color code is required when approving.' });
    }
  }
  const updateFields = { status, adminNotes: adminNotes || undefined };
  if (status === 'approved' && name?.trim()) updateFields.name = name.trim();
  if (status === 'approved' && colorCode?.trim()) updateFields.colorCode = colorCode.trim();

  try {
    const suggestion = await ColorSuggestion.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    )
      .populate('user', 'name phone');
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found.' });
    }

    if (status === 'approved' && suggestion.user?.phone) {
      const userName = suggestion.user.name || 'Customer';
      const colorName = suggestion.name || 'your suggested color';
      const code = suggestion.colorCode || suggestion.hexCode || '—';
      sendWhatsAppTemplate(suggestion.user.phone, {
        '1': userName,
        '2': colorName,
        '3': code,
      }).catch((err) => {
        console.error('WhatsApp approval notification failed:', err?.message || err);
      });
    }

    return res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
