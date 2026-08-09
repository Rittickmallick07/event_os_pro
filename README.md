# event_os_pro - Community Event OS

View the website:- https://event-os-pro.vercel.app/

# Community Event OS

> An all-in-one event management platform for organizers, volunteers, speakers, and attendees.

**Community Event OS** is a full-stack web application designed to simplify the complete event lifecycle — from event creation and registration to QR-based check-in, volunteer management, announcements, feedback, certificates, and post-event analytics.

---

## 🚀 Features

### 👤 User Authentication & Roles

* Secure user authentication
* Role-based access control
* Organizer, Volunteer, and Attendee roles
* Protected API routes and dashboards

### 🎟️ Event Registration & Ticketing

* Create and manage events
* Online event registration
* Registration and ticket management
* Attendee registration tracking

### 📱 QR Code Check-in

* Generate QR codes for registrations
* QR-based attendee verification
* Fast check-in kiosk
* Duplicate check-in prevention

### 🎤 Speaker & Session Management

* Manage speakers
* Create event sessions
* Organize sessions by tracks
* Schedule management

### 🙋 Volunteer Management

* Assign volunteers to events
* Create volunteer shifts
* Track assignments and responsibilities
* Manage volunteer availability

### 📢 Announcements

* Global event announcements
* Broadcast important updates
* Organizer-to-attendee communication

### ⭐ Feedback Collection

* Collect post-event feedback
* Ratings and comments
* Session/event feedback analysis

### 🏆 Automated Certificates

* Generate certificates for attendees and volunteers
* Event-specific certificate templates
* Downloadable certificates

### 📊 Analytics Dashboard

* Registration statistics
* Attendance and check-in rates
* Volunteer statistics
* Feedback analysis
* Event performance insights

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* React Router

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication

### Database

* PostgreSQL / MySQL
* Relational SQL database

### Other Technologies

* QR Code generation and verification
* PDF certificate generation
* RESTful APIs
* Git & GitHub

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │   React + JavaScript│
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │  Node.js + Express  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       Authentication      Event APIs       Analytics
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │    SQL Database     │
                    │ PostgreSQL / MySQL  │
                    └─────────────────────┘
```

---

## 📁 Project Structure

```text
community-event-os/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── EventCard.jsx
│       │   └── QRScanner.jsx
│       │
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Events.jsx
│       │   ├── EventDetails.jsx
│       │   ├── CheckIn.jsx
│       │   ├── Volunteers.jsx
│       │   └── Analytics.jsx
│       │
│       ├── services/
│       │   └── api.js
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── checkinController.js
│   │   ├── volunteerController.js
│   │   └── analyticsController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── checkinRoutes.js
│   │   ├── volunteerRoutes.js
│   │   └── analyticsRoutes.js
│   │
│   ├── services/
│   │   ├── qrService.js
│   │   ├── certificateService.js
│   │   └── emailService.js
│   │
│   ├── app.js
│   └── server.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 🗄️ Database Architecture

The application uses a relational SQL database.

### Core Tables

```text
Users
  │
  ├─────────────── Events
  │                    │
  │                    ├── Sessions
  │                    ├── Registrations
  │                    └── Volunteers
  │
  └── Registrations
```

### Main Relationships

* One User can create multiple Events.
* One Event can have multiple Sessions.
* One User can register for multiple Events.
* One Event can have multiple Registrations.
* Volunteers are assigned to Events and Shifts.
* Sessions belong to Events.

---

## 🗃️ SQL Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('organizer', 'volunteer', 'attendee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    organizer_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    capacity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    ticket_type VARCHAR(50) DEFAULT 'standard',
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    checked_in BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_in_at TIMESTAMP,

    CONSTRAINT fk_registration_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_registration_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_event_user
        UNIQUE(event_id, user_id)
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    speaker_name VARCHAR(150),
    track VARCHAR(100),
    room VARCHAR(100),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,

    CONSTRAINT fk_session_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

CREATE TABLE volunteers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    shift_start TIMESTAMP,
    shift_end TIMESTAMP,
    assignment VARCHAR(150),
    status VARCHAR(30) DEFAULT 'assigned',

    CONSTRAINT fk_volunteer_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_volunteer_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/register` | Register a user  |
| POST   | `/api/auth/login`    | Login            |
| GET    | `/api/auth/me`       | Get current user |
| POST   | `/api/auth/logout`   | Logout           |

## Events

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| GET    | `/api/events`     | Get all events    |
| GET    | `/api/events/:id` | Get event details |
| POST   | `/api/events`     | Create event      |
| PUT    | `/api/events/:id` | Update event      |
| DELETE | `/api/events/:id` | Delete event      |

## Registrations

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/registrations`            | Register for event  |
| GET    | `/api/registrations/:id`        | Get registration    |
| GET    | `/api/events/:id/registrations` | Get event attendees |
| DELETE | `/api/registrations/:id`        | Cancel registration |

## QR Check-in

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| GET    | `/api/checkin/:qr_code` | Verify QR code    |
| POST   | `/api/checkin/:qr_code` | Check in attendee |

## Sessions

| Method | Endpoint                   | Description    |
| ------ | -------------------------- | -------------- |
| GET    | `/api/events/:id/sessions` | Get sessions   |
| POST   | `/api/events/:id/sessions` | Create session |
| PUT    | `/api/sessions/:id`        | Update session |
| DELETE | `/api/sessions/:id`        | Delete session |

## Volunteers

| Method | Endpoint                     | Description       |
| ------ | ---------------------------- | ----------------- |
| GET    | `/api/events/:id/volunteers` | Get volunteers    |
| POST   | `/api/volunteers`            | Assign volunteer  |
| PUT    | `/api/volunteers/:id`        | Update assignment |
| DELETE | `/api/volunteers/:id`        | Remove volunteer  |

## Announcements

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| GET    | `/api/announcements`     | Get announcements   |
| POST   | `/api/announcements`     | Create announcement |
| DELETE | `/api/announcements/:id` | Delete announcement |

## Feedback

| Method | Endpoint                   | Description        |
| ------ | -------------------------- | ------------------ |
| POST   | `/api/feedback`            | Submit feedback    |
| GET    | `/api/events/:id/feedback` | Get event feedback |

## Certificates

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| POST   | `/api/certificates/generate` | Generate certificate |
| GET    | `/api/certificates/:id`      | Download certificate |

## Analytics

| Method | Endpoint                  | Description     |
| ------ | ------------------------- | --------------- |
| GET    | `/api/analytics/:eventId` | Event analytics |

---

# ⚙️ Backend Setup

### Install dependencies

```bash
cd server
npm install
```

### Example dependencies

```bash
npm install express cors dotenv pg bcryptjs jsonwebtoken qrcode
npm install --save-dev nodemon
```

### Start development server

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/community_event_os

JWT_SECRET=your_super_secret_key

CLIENT_URL=http://localhost:5173
```

**Never commit `.env` to GitHub.**

Use `.env.example` instead:

```env
PORT=
DATABASE_URL=
JWT_SECRET=
CLIENT_URL=
```

---

# 🧩 Example Express Route

### Registration Route

```javascript
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { event_id, user_id } = req.body;

        // Create registration
        // Generate unique QR code
        // Save registration in database

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed"
        });
    }
});

module.exports = router;
```

---

# 📱 QR Verification & Check-in

The check-in kiosk accepts a QR code string and sends it to the backend.

### Example React Component

```jsx
import { useState } from "react";

function CheckInKiosk() {
    const [qrCode, setQrCode] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        if (!qrCode.trim()) return;

        setLoading(true);

        try {
            const response = await fetch(
                `/api/checkin/${encodeURIComponent(qrCode)}`
            );

            const data = await response.json();

            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                message: "Unable to verify QR code"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkin-container">
            <h1>Event Check-in</h1>

            <p>Scan or enter the attendee QR code.</p>

            <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Enter QR code"
            />

            <button
                onClick={handleCheckIn}
                disabled={loading}
            >
                {loading ? "Verifying..." : "Verify & Check In"}
            </button>

            {result && (
                <div>
                    <h3>
                        {result.success
                            ? "Check-in Successful"
                            : "Check-in Failed"}
                    </h3>

                    <p>{result.message}</p>
                </div>
            )}
        </div>
    );
}

export default CheckInKiosk;
```

---

# 🔄 Check-in Flow

```text
Attendee
   │
   ▼
QR Code
   │
   ▼
Check-in Kiosk
   │
   ▼
POST /api/checkin/:qr_code
   │
   ▼
Backend Verification
   │
   ├── Invalid QR ──► Reject
   │
   ├── Already Used ─► Reject
   │
   └── Valid ───────► Mark Checked-in
                            │
                            ▼
                       Success Response
```

---

# 📊 Analytics

The analytics dashboard can provide:

* Total registrations
* Total attendees checked in
* Attendance percentage
* Registration conversion rate
* Volunteer count
* Session attendance
* Feedback ratings
* Event participation trends

Example API response:

```json
{
    "totalRegistrations": 500,
    "totalCheckedIn": 420,
    "attendanceRate": 84,
    "totalVolunteers": 35,
    "averageFeedback": 4.5
}
```

---

# 🔒 Security

The application should implement:

* Password hashing using bcrypt
* JWT-based authentication
* Role-based authorization
* Input validation
* SQL parameterized queries
* CORS configuration
* Environment variables for secrets
* Rate limiting
* Secure HTTP headers
* QR-code validation
* Duplicate check-in protection

---

# 🚀 Deployment

The frontend can be deployed using platforms such as **Vercel**.

The Express backend can be deployed as a serverless/API application or hosted separately depending on the deployment architecture.

### Production Architecture

```text
                    Internet
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        React Frontend       Express API
          Vercel             Backend
                                 │
                                 ▼
                           PostgreSQL
                            Database
```

Before deployment, configure:

```env
DATABASE_URL=your_production_database
JWT_SECRET=your_production_secret
CLIENT_URL=your_frontend_url
```

---

# 🧪 Development Workflow

```bash
# Clone repository
git clone <your-repository-url>

# Enter project
cd community-event-os

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Start backend
npm run dev

# Start frontend in another terminal
cd ../client
npm run dev
```

---

# 🗺️ Future Improvements

* 📱 Mobile application
* 🔔 Real-time notifications
* 💳 Online payment integration
* 🤖 AI-powered event recommendations
* 📧 Automated email campaigns
* 📈 Advanced analytics
* 🗺️ Interactive venue maps
* 🎫 Multiple ticket categories
* 🌐 Multi-event organization management
* ☁️ Cloud file storage
* 🔴 Real-time event monitoring

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/new-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "Add new feature"
```

5. Push the branch.

```bash
git push origin feature/new-feature
```

6. Create a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Rittick Mallick**

B.Tech CSE – AI & ML

---

⭐ If you find **Community Event OS** useful, consider giving the repository a star!
