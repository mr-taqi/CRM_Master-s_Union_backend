# Quick Setup Guide

This guide will help you get the CRM platform up and running quickly.

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Set Up PostgreSQL Database

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Start PostgreSQL:**
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create Database:**
   ```bash
   psql -U postgres
   CREATE DATABASE crm_db;
   \q
   ```

### Step 3: Configure Environment Variables

**Backend `.env` file** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5433
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@crm.com

FRONTEND_URL=http://localhost:3000
```

**Important:** Replace:
- `DB_PASSWORD` with your PostgreSQL password
- `JWT_SECRET` with a random secure string
- Email credentials (see Email Setup below)

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

## 📧 Email Setup (Optional but Recommended)

### Gmail Setup:
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this app password in `EMAIL_PASSWORD` (not your regular password)

### Other Email Providers:
- **SendGrid**: Use SMTP settings from SendGrid dashboard
- **Mailgun**: Use SMTP settings from Mailgun dashboard
- **AWS SES**: Configure SMTP credentials from AWS console

**Note:** Email notifications will work even if email is not configured, but you'll see console errors.

## 🐳 Docker Setup (Alternative)

If you prefer Docker:

```bash
# Update docker-compose.yml with your settings
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ✅ Verify Installation

1. **Check Backend:**
   ```bash
   curl http://localhost:4000/api/health
   ```
   Should return: `{"status":"OK","message":"CRM API is running"}`

2. **Check Frontend:**
   - Open http://localhost:3000
   - You should see the login page

3. **Create First User:**
   - Click "Register"
   - Fill in the form
   - Select "Admin" role for full access
   - Login with your credentials

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d crm_db
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill it
kill -9 $(lsof -ti:5000)
```

### Module Not Found Errors
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## 📝 Next Steps

1. **Create Admin User** - Register through the UI
2. **Add Leads** - Start creating leads
3. **Configure Email** - Set up email for notifications
4. **Customize** - Adjust settings as needed

## 🎯 Production Deployment Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use production database (managed service recommended)
- [ ] Configure production email service
- [ ] Enable HTTPS
- [ ] Set up proper CORS restrictions
- [ ] Configure environment variables on hosting platform
- [ ] Set up database backups
- [ ] Configure monitoring and logging

## 📚 Additional Resources

- See `README.md` for detailed documentation
- API endpoints are documented in README.md
- Check backend logs for debugging: `npm run dev` in backend folder

---

**Need Help?** Check the main README.md for detailed documentation.

