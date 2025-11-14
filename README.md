# CRM Platform - MERN Stack with PostgreSQL

A modern, scalable Customer Relationship Management (CRM) platform built with the MERN stack (MongoDB replaced with PostgreSQL), featuring real-time updates, role-based access control, and comprehensive analytics.

## 🚀 Features

### Core Features
- **Authentication & Role Management** - JWT-based authentication with role-based access control (Admin, Manager, Sales Executive)
- **Lead Management** - Complete CRUD operations for leads with ownership tracking and history trail
- **Activity Timeline** - Detailed log of notes, calls, meetings, and status changes per lead
- **Email & Notification System** - Real-time WebSocket notifications and automated email triggers
- **Dashboard & Analytics** - Visualize performance metrics using Recharts
- **Real-time Updates** - WebSocket integration for live notifications

### Technical Stack
- **Frontend**: React 18 + Redux Toolkit + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Sequelize ORM
- **Real-time**: Socket.io
- **Authentication**: JWT + Bcrypt
- **Charts**: Recharts
- **Testing**: Jest

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

## 🛠️ Installation & Setup

### Option 1: Local Development Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Master's Union CRM"
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@crm.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### 3. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE crm_db;
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE crm_db;
\q
```

#### 4. Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### 5. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional, defaults are set):
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### 6. Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### Option 2: Docker Setup (Recommended for Production)

#### 1. Update Environment Variables

Edit `docker-compose.yml` and update the environment variables as needed, especially:
- Database password
- JWT_SECRET
- Email configuration

#### 2. Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5433
- Backend API on port 5000
- Frontend on port 3000

#### 3. View Logs

```bash
docker-compose logs -f
```

#### 4. Stop Services

```bash
docker-compose down
```

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Lead Endpoints

- `GET /api/leads` - Get all leads (with pagination, search, filter)
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Activity Endpoints

- `GET /api/activities/lead/:leadId` - Get activities for a lead
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Dashboard Endpoints

- `GET /api/dashboard` - Get dashboard analytics

### User Endpoints (Admin/Manager only)

- `GET /api/users` - Get all users

## 🔐 Role-Based Access Control

### Admin
- Full access to all features
- Can manage users
- Can view all leads and activities
- Can assign leads to any user

### Manager
- Can view all leads and activities
- Can assign leads to any user
- Cannot manage users

### Sales Executive
- Can only view/edit their own leads
- Can create activities for their leads
- Limited dashboard view (only their data)

## 🔧 Configuration for Production

### Backend Production Settings

1. **Update `.env` file:**
   - Set `NODE_ENV=production`
   - Use a strong `JWT_SECRET`
   - Configure production database credentials
   - Set up proper email service (Gmail, SendGrid, etc.)

2. **Database:**
   - Use a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
   - Enable SSL connections
   - Set up proper backup strategy

3. **Security:**
   - Enable HTTPS
   - Use environment variables for all secrets
   - Implement rate limiting
   - Add CORS restrictions for production domain

### Frontend Production Build

```bash
cd frontend
npm run build
```

The build output will be in the `dist` folder. Deploy this to a static hosting service (Vercel, Netlify, AWS S3, etc.)

### Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASSWORD`

For other providers (SendGrid, Mailgun, etc.):
- Update `EMAIL_HOST`, `EMAIL_PORT`, and credentials accordingly

## 📦 Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend
heroku create your-crm-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
cd frontend
npm install -g vercel
vercel
```

Update `VITE_API_URL` and `VITE_SOCKET_URL` to point to your production backend.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use
- Change ports in `.env` files
- Kill process using port: `lsof -ti:5000 | xargs kill`

### Email Not Sending
- Verify email credentials
- Check firewall/network settings
- For Gmail, ensure App Password is used (not regular password)

## 📝 Environment Variables Summary

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5433)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP server port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password
- `EMAIL_FROM` - From email address
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL

## 🎯 Next Steps

1. **Set up your database** - Create PostgreSQL database and update credentials
2. **Configure email** - Set up email service for notifications
3. **Create first admin user** - Register through the UI or directly in database
4. **Start adding leads** - Begin using the CRM!

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using MERN Stack**

