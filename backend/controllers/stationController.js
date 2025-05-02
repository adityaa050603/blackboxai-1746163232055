const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/storage.json');

function readData() {
  if (!fs.existsSync(dataFilePath)) {
    return { users: [], stations: [] };
  }
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

exports.getAllStations = (req, res) => {
  try {
    const data = readData();
    res.json(data.stations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addStation = (req, res) => {
  try {
    const { name, type, latitude, longitude, details } = req.body;
    if (!name || !type || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const data = readData();
    const newStation = {
      id: Date.now().toString(),
      name,
      type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      details: details || ''
    };
    data.stations.push(newStation);
    writeData(data);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('stationAdded', newStation);

    res.status(201).json(newStation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStation = (req, res) => {
  try {
    const stationId = req.params.id;
    const { name, type, latitude, longitude, details } = req.body;
    const data = readData();
    const stationIndex = data.stations.findIndex(s => s.id === stationId);
    if (stationIndex === -1) {
      return res.status(404).json({ message: 'Station not found' });
    }
    const updatedStation = {
      ...data.stations[stationIndex],
      name: name || data.stations[stationIndex].name,
      type: type || data.stations[stationIndex].type,
      latitude: latitude || data.stations[stationIndex].latitude,
      longitude: longitude || data.stations[stationIndex].longitude,
      details: details || data.stations[stationIndex].details
    };
    data.stations[stationIndex] = updatedStation;
    writeData(data);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('stationUpdated', updatedStation);

    res.json(updatedStation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteStation = (req, res) => {
  try {
    const stationId = req.params.id;
    const data = readData();
    const stationIndex = data.stations.findIndex(s => s.id === stationId);
    if (stationIndex === -1) {
      return res.status(404).json({ message: 'Station not found' });
    }
    const deletedStation = data.stations.splice(stationIndex, 1)[0];
    writeData(data);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('stationDeleted', deletedStation);

    res.json({ message: 'Station deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
