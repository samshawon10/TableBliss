import Contact from '../models/Contact.js';
import { sendEmail } from '../utils/emailService.js';

// @desc    Submit contact form
// @route   POST /api/contact
export const submitContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);

    // Notify admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `New Contact: ${contact.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Message:</strong> ${contact.message}</p>
        `,
      });
    } catch (err) {
      console.error('Contact notification email failed:', err.message);
    }

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contacts (admin)
// @route   GET /api/contact
export const getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead, isResolved } = req.query;
    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isResolved !== undefined) query.isResolved = isResolved === 'true';

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark contact as read
// @route   PUT /api/contact/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark contact as resolved
// @route   PUT /api/contact/:id/resolve
export const markAsResolved = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, respondedAt: new Date() },
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};