// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper to show alerts
function showAlert(message) {
  alert(message);
}

// Admin Register Form
const adminRegisterForm = document.getElementById('adminRegisterForm');
if (adminRegisterForm) {
  adminRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = adminRegisterForm.username.value.trim();
    const password = adminRegisterForm.password.value.trim();
    if (!username || !password) {
      showAlert('Please fill all fields');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Admin registered successfully. Please login.');
        window.location.href = 'admin-login.html';
      } else {
        showAlert(data.message || 'Registration failed');
      }
    } catch (error) {
      showAlert('Server error');
    }
  });
}

// Admin Login Form
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = adminLoginForm.username.value.trim();
    const password = adminLoginForm.password.value.trim();
    if (!username || !password) {
      showAlert('Please fill all fields');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        showAlert('Login successful');
        window.location.href = 'stations.html';
      } else {
        showAlert(data.message || 'Login failed');
      }
    } catch (error) {
      showAlert('Server error');
    }
  });
}

// User Login Form
const userLoginForm = document.getElementById('userLoginForm');
if (userLoginForm) {
  userLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = userLoginForm.username.value.trim();
    const password = userLoginForm.password.value.trim();
    if (!username || !password) {
      showAlert('Please fill all fields');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        showAlert('Login successful');
        window.location.href = 'stations.html';
      } else {
        showAlert(data.message || 'Login failed');
      }
    } catch (error) {
      showAlert('Server error');
    }
  });
}

// User Register Form
const userRegisterForm = document.getElementById('userRegisterForm');
if (userRegisterForm) {
  userRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = userRegisterForm.name.value.trim();
    const mobile = userRegisterForm.mobile.value.trim();
    const carType = userRegisterForm.carType.value;
    const username = userRegisterForm.username.value.trim();
    const password = userRegisterForm.password.value.trim();
    if (!name || !mobile || !carType || !username || !password) {
      showAlert('Please fill all fields');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, carType, username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('User registered successfully. Please login.');
        window.location.href = 'user-login.html';
      } else {
        showAlert(data.message || 'Registration failed');
      }
    } catch (error) {
      showAlert('Server error');
    }
  });
}

// Stations Page Logic
if (window.location.pathname.endsWith('stations.html')) {
  const socket = io('http://localhost:5000');
  const stationList = document.getElementById('stationList');
  const filterForm = document.getElementById('filterForm');
  let map;
  let markers = [];
  let userLocation = null;

  function initMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = [position.coords.latitude, position.coords.longitude];
          map.setView(userLocation, 13);
          L.marker(userLocation).addTo(map).bindPopup('You are here').openPopup();
          loadStations();
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          loadStations();
        }
      );
    } else {
      loadStations();
    }
  }

  function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
  }

  function addMarker(station) {
    const icon = L.divIcon({
      className: 'custom-icon',
      html: station.type === 'EV' ? '<i class="fas fa-bolt fa-lg text-green-600"></i>' : '<i class="fas fa-gas-pump fa-lg text-green-600"></i>',
      iconSize: [20, 20],
      iconAnchor: [10, 20]
    });
    const marker = L.marker([station.latitude, station.longitude], { icon }).addTo(map);
    marker.bindPopup(`<strong>${station.name}</strong><br>Type: ${station.type}<br>${station.details || ''}`);
    markers.push(marker);
  }

  function distance(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance in km
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function filterStations(stations) {
    const checkedTypes = Array.from(filterForm.elements['type'])
      .filter(input => input.checked)
      .map(input => input.value);
    let filtered = stations.filter(station => checkedTypes.includes(station.type));
    if (userLocation) {
      filtered = filtered.filter(station => {
        const dist = distance(userLocation[0], userLocation[1], station.latitude, station.longitude);
        return dist <= 10; // Show stations within 10 km radius
      });
    }
    return filtered;
  }

  async function fetchStations() {
    try {
      const res = await fetch(`${API_BASE_URL}/stations`);
      const data = await res.json();
      return data;
    } catch (error) {
      showAlert('Failed to fetch stations');
      return [];
    }
  }

  function renderStationList(stations) {
    stationList.innerHTML = '';
    if (stations.length === 0) {
      stationList.innerHTML = '<li>No stations found nearby.</li>';
      return;
    }
    stations.forEach(station => {
      const li = document.createElement('li');
      li.className = 'p-2 border border-gray-300 rounded cursor-pointer hover:bg-green-100';
      li.textContent = station.name + ' (' + station.type + ')';
      li.addEventListener('click', () => {
        map.setView([station.latitude, station.longitude], 15);
      });
      stationList.appendChild(li);
    });
  }

  async function loadStations() {
    const stations = await fetchStations();
    const filteredStations = filterStations(stations);
    clearMarkers();
    filteredStations.forEach(addMarker);
    renderStationList(filteredStations);
  }

  filterForm.addEventListener('change', loadStations);

  socket.on('connect', () => {
    console.log('Connected to socket.io server');
  });

  socket.on('stationAdded', (station) => {
    loadStations();
  });

  socket.on('stationUpdated', (station) => {
    loadStations();
  });

  socket.on('stationDeleted', (station) => {
    loadStations();
  });

  initMap();
}
