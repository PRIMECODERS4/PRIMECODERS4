require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-secret-key-2024';
const MONGO_URI = process.env.MONGO_URI;

const possiblePaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', '..', 'public'),
  path.join(process.cwd(), 'public'),
  path.join(__dirname, 'src', 'public')
];

let publicPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    publicPath = p;
    break;
  }
}

if (!publicPath) {
  console.error('Could not find public folder. Tried:', possiblePaths);
  publicPath = path.join(__dirname, 'public');
}

console.log('Resolved public path:', publicPath);
console.log('Files in public:', fs.readdirSync(publicPath));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.error('MONGO_URI not defined');
}

app.use(express.json());
app.use(cors());
app.use(express.static(publicPath));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({ success: false, message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, message: 'Username and password required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ success: true, token, username: user.username });
  } catch (error) {
    res.json({ success: false, message: 'Login failed' });
  }
});

app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});