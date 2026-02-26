import ColorSuggestion from '../../models/ColorSuggestion.js';
import { sendWhatsAppMessage } from '../../services/whatsappService.js';

// Create a color suggestion (protected — any logged-in user)
export const createSuggestion = async (req, res) => {
  const { name, hexCode, product, notes, imageUrl } = req.body;
  if (!name || !hexCode) {
    return res.status(400).json({ success: false, message: 'Color name and hex code are required.' });
  }
  try {
    const suggestion = await ColorSuggestion.create({
      user: req.user._id,
      name,
      hexCode,
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

// Admin: Update suggestion status
export const updateSuggestionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be pending, approved, or rejected.' });
  }
  try {
    const suggestion = await ColorSuggestion.findByIdAndUpdate(
      id,
      { status, adminNotes: adminNotes || undefined },
      { new: true }
    )
      .populate('user', 'name phone');
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found.' });
    }

    if (status === 'approved' && suggestion.user?.phone) {
      const userName = suggestion.user.name || 'Customer';
      const colorName = suggestion.name || 'your suggested color';
      let body = `Hi ${userName}! Good news — your color suggestion "${colorName}" has been approved by Color Smith.`;
      if (adminNotes && adminNotes.trim()) {
        body += `\n\nNote from our team: ${adminNotes.trim()}`;
      }
      body += '\n\nThank you for your suggestion!';
      sendWhatsAppMessage(suggestion.user.phone, body).catch((err) => {
        console.error('WhatsApp approval notification failed:', err?.message || err);
      });
    }

    return res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
