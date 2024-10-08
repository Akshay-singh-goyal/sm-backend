const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Built-in JSON parser

// MongoDB connection
mongoose.connect('mongodb+srv://akshaysinghrajput702:skart123@cluster0.6pyfv.mongodb.net/?retryWrites=true&w=majority&appName=tickets', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Ticket Schema and Model
const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  ticketType: { type: String, enum: ['daily', 'weekly', 'seasonal', 'regular'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] },
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

// Define Booking Schema and Model
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  whatsappnumber: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// Define Routes
const ticketRouter = express.Router();

// Route to handle ticket purchase
ticketRouter.post('/', async (req, res) => {
  try {
    const ticketData = req.body;
    const newTicket = new Ticket(ticketData);
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route to handle confirming payment
ticketRouter.post('/confirm', async (req, res) => {
  const { email, ticketId } = req.body;

  try {
    const ticket = await Ticket.findOneAndUpdate(
      { email, ticketId },
      { status: 'Approved' },
      { new: true }
    );

    if (ticket) {
      // Call your sendEmail function here
      res.json({ message: 'Payment confirmed!', ticket });
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ error: 'Failed to confirm payment', details: error.message });
  }
});

// Attach ticket routes to the app
app.use('/api/tickets', ticketRouter);

// Define bookings route
app.post('/api/bookings', async (req, res) => {
  const newBooking = new Booking(req.body);
  try {
    await newBooking.save();
    res.json({ message: 'ticket may raised contact to shortly' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
