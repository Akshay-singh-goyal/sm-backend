const Contact = require("../models/Contact");

exports.createContact = async (req, res) => {
  try {
    const { name, email, category, priority, subject, message } = req.body;

    if (!name || !email || !subject) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      category,
      priority,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message received successfully",
      data: contact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
