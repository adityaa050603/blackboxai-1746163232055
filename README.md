
Built by https://www.blackbox.ai

---

```markdown
# Station Management System

## Project Overview
The Station Management System allows users to register, log in, and view electric vehicle (EV) and gas stations on an interactive map. The application supports both admin and user functionalities, enabling seamless management and access to station information.

## Installation
To run this project locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then install required packages by running:
   ```bash
   npm install
   ```

3. **Start the Backend**
   You will need to start the backend server separately. Ensure it runs on `http://localhost:5000/api`.

4. **Open the Frontend**
   Open the `index.html` file in your web browser to access the application.

## Usage
- **Admin Registration**: Admin users can register via the "adminRegisterForm" by providing a username and password.
- **Admin Login**: Admin users can log in to access administrative functionalities.
- **User Registration**: New users can register through the "userRegisterForm" by entering their name, mobile number, car type, username, and password.
- **User Login**: Users log in using their credentials to view and interact with the station map.
- **View Stations**: Logged-in users can view EV and gas stations on a map, and filter stations based on their type.

## Features
- User authentication for Admin and Users.
- Interactive map to display EV and gas stations using Leaflet.
- Real-time updates using Socket.io for any changes in station data.
- Distance filtering to show stations within a 10 km radius from the user's location.
- Responsive design for ease of access on various devices.

## Dependencies
The following dependencies are used for this project:
```json
{
  "express": "^4.17.1",
  "socket.io": "^3.0.0",
  "leaflet": "^1.7.1"
}
```

## Project Structure
```
/<project-directory>
│
├── main.js                # Main JavaScript file containing application logic
├── index.html             # Entry point for the application UI
├── admin-login.html       # Admin login page
├── admin-register.html     # Admin registration page
├── user-login.html        # User login page
├── user-register.html     # User registration page
├── stations.html          # Page to display stations on map
│
└── <additional files>     # Any other required files (e.g., styles, images)
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.
```