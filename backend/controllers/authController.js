const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/storage.json');
const SECRET_KEY = 'your_secret_key_here'; // Change this to a secure key in production

// Helper to read data
function readData() {
  if (!fs.existsSync(dataFilePath)) {
    return { users: [], stations: [] };
  }
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
}

// Helper to write data
function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

exports.adminRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const data = readData();
    const existingUser = data.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role: 'admin'
    };
    data.users.push(newUser);
    writeData(data);
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = readData();
    const user = data.users.find(u => u.username === username && u.role === 'admin');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = readData();
    const user = data.users.find(u => u.username === username && u.role === 'user');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.userRegister = async (req, res) => {
  try {
    const { username, password, name, mobile, carType } = req.body;
    if (!username || !password || !name || !mobile || !carType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const data = readData();
    const existingUser = data.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role: 'user',
      name,
      mobile,
      carType
    };
    data.users.push(newUser);
    writeData(data);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
