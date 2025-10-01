# 🏭 MES-ERP Manufacturing Execution System

Complete role-based Manufacturing Execution System (MES) integrated with Enterprise Resource Planning (ERP).

## ✨ Features

### 🏢 ERP Module (ERP Owner)
- Create production orders with description, quantity, and material
- Auto-generated Order IDs
- View all orders and their status
- View production reports from MES
- Analytics dashboard with charts:
  - Total orders (completed vs in-progress)
  - Production by shopfloor
  - Defect rates
  - Material usage

### 📊 MES Module (MES Manager)
- Receive orders from ERP
- Auto-distribute orders based on real-time shopfloor capacity
- Set and update shopfloor capacities
- Monitor all shopfloor heartbeats (online/offline status)
- View all production reports
- Real-time capacity and load tracking

### 👷 Shopfloor Module (Shopfloor Workers)
- View only assigned shopfloor orders
- Real-time heartbeat status display with pulse animation
- Production statistics (produced, defective, success rate)
- Cannot access MES or ERP pages

### 🔐 Authentication
- Role-based login with role selector
- Google OAuth integration
- Three roles: `user`, `mes_manager`, `erp_owner`
- Session-based authentication

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (running on localhost:27017)
- **MQTT Broker** (Mosquitto recommended)
- **npm** or **yarn**

## 🚀 Installation

### 1. Install MongoDB

**Windows:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
net start MongoDB
```

**Verify MongoDB is running:**
```powershell
mongo --version
```

### 2. Install MQTT Broker (Mosquitto)

**Windows:**
```powershell
# Download from https://mosquitto.org/download/
# Install and start service
net start mosquitto
```

**Or use a simple MQTT broker:**
```powershell
npm install -g mosca
mosca -v
```

### 3. Clone/Navigate to Project

```powershell
cd C:\Users\admin\Desktop\Java_practice\final\track2
```

### 4. Install Backend Dependencies

```powershell
cd backend
npm install
```

### 5. Install Frontend Dependencies

```powershell
cd ../frontend
npm install
```

### 6. Install Shopfloor Dependencies

```powershell
cd ../shopfloors
npm install
```

## ⚙️ Configuration

### Backend Configuration

Edit `backend/.env` if needed:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=mes_erp_db
MQTT_BROKER=mqtt://localhost:1883
SESSION_SECRET=mes_erp_secret_key_change_in_production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
PORT=4000
```

## 🎯 Running the System

### Start All Services (Recommended Order)

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```
Should see: `🚀 MES-ERP Backend running on http://localhost:4000`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```
Should open: `http://localhost:3001`

**Terminal 3 - Shopfloor 1:**
```powershell
cd shopfloors
npm run sf1
```

**Terminal 4 - Shopfloor 2:**
```powershell
cd shopfloors
npm run sf2
```

**Terminal 5 - Shopfloor 3:**
```powershell
cd shopfloors
npm run sf3
```

**Or run all shopfloors at once:**
```powershell
cd shopfloors
npm run all
```

## 👥 Creating Users

### Option 1: Via Frontend (Recommended)

1. Go to `http://localhost:3001`
2. Click "Register" tab
3. Select role and fill in details
4. Click "Register"

### Option 2: Via API (Postman/cURL)

**Create ERP Owner:**
```bash
curl -X POST http://localhost:4000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "erp_admin",
    "password": "erp123",
    "email": "erp@company.com",
    "role": "erp_owner"
  }'
```

**Create MES Manager:**
```bash
curl -X POST http://localhost:4000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mes_manager",
    "password": "mes123",
    "email": "mes@company.com",
    "role": "mes_manager"
  }'
```

**Create Shopfloor Worker:**
```bash
curl -X POST http://localhost:4000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "worker1",
    "password": "worker123",
    "email": "worker1@company.com",
    "role": "user",
    "shopfloor": "Shopfloor-1"
  }'
```

## 🔄 Complete Workflow Test

### Step 1: Login as ERP Owner

1. Go to `http://localhost:3001`
2. Select "ERP Owner" role (or login with existing ERP account)
3. Login with credentials

### Step 2: Create Production Order

1. Fill in the order form:
   - **Description**: "500ml Cola Bottles"
   - **Quantity**: 10000
   - **Material**: "PET Plastic"
2. Click "Create Order"
3. Note the generated Order ID (e.g., `ORD-1234567890`)

### Step 3: Monitor as MES Manager

1. Logout and login as MES Manager
2. View the order in "All Orders" table
3. Check "Shopfloor Capacities" - see real-time loads
4. Monitor "Heartbeats" - all shopfloors should show green (online)
5. Watch as order gets distributed automatically

### Step 4: View as Shopfloor Worker

1. Logout and login as Shopfloor Worker (user role)
2. Select your shopfloor (e.g., Shopfloor-1)
3. See heartbeat status with pulse animation
4. View your assigned orders in "My Orders" table
5. Watch production statistics update

### Step 5: Check Shopfloor Simulators

In the shopfloor terminal windows, you should see:
```
💓 Shopfloor-1 heartbeat sent
📥 Shopfloor-1 received instruction: { OrderID: 'ORD-...', Assigned: 3333 }
🔨 Shopfloor-1 starting production for ORD-...
✅ Shopfloor-1 completed order ORD-...: { Produced: 3333, Defective: 250 }
```

### Step 6: View Reports & Analytics (ERP Owner)

1. Login back as ERP Owner
2. Scroll to "Production Reports from MES"
3. See completed reports from all shopfloors
4. View analytics charts:
   - Production by Shopfloor (Bar chart)
   - Order Status (Pie chart)
5. Check summary metrics at top

## 📊 System Architecture

```
┌─────────────┐
│  ERP Owner  │ → Creates Orders
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│  Backend API    │ → Stores in MongoDB
│  (Port 4000)    │ → Publishes to MQTT
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MES Manager    │ → Distributes based on capacity
└────────┬────────┘
         │
         ↓
┌──────────────────────────────────┐
│  MQTT Broker (Port 1883)         │
└──────┬───────────┬───────────┬───┘
       │           │           │
       ↓           ↓           ↓
┌──────────┐ ┌──────────┐ ┌──────────┐
│Shopfloor1│ │Shopfloor2│ │Shopfloor3│
│  💓 →    │ │  💓 →    │ │  💓 →    │
│  ← 📊   │ │  ← 📊   │ │  ← 📊   │
└──────────┘ └──────────┘ └──────────┘
     ↓            ↓            ↓
┌──────────────────────────────────┐
│  Shopfloor Workers (View Only)   │
└──────────────────────────────────┘
```

## 🗄️ Database Structure

### MongoDB Collections

**Database:** `mes_erp_db`

**Collections:**
1. `users` - User accounts with roles
2. `orders` - Production orders
3. `reports` - Shopfloor production reports
4. `capacities` - Shopfloor capacity settings
5. `heartbeats` - Shopfloor status

## 🔧 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login
- `GET /auth/google` - Google OAuth
- `GET /me` - Get current user
- `POST /logout` - Logout

### Orders (ERP)
- `POST /orders` - Create order (ERP Owner only)
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get specific order

### MES
- `GET /capacities` - Get shopfloor capacities
- `POST /capacities` - Update capacity (MES Manager only)
- `GET /reports` - Get all reports
- `GET /analytics` - Get analytics (ERP Owner only)

### Shopfloor
- `GET /shopfloor/:name/orders` - Get shopfloor orders (User only)
- `GET /heartbeats` - Get all heartbeats

## 🎨 UI Features

### Dark Theme
- Professional gradient backgrounds
- Color-coded status indicators
- Smooth animations and transitions
- Responsive design

### Real-time Updates
- Auto-refresh every 5-10 seconds
- Live heartbeat monitoring
- Dynamic capacity tracking
- Instant order status updates

### Charts & Analytics
- Bar chart: Production by shopfloor
- Pie chart: Order status distribution
- Summary metrics cards
- Color-coded tables

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if MongoDB is running
mongo --version

# Check if port 4000 is available
netstat -ano | findstr :4000

# Check backend logs
cd backend
npm start
```

### Frontend won't start
```powershell
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Shopfloors not connecting
```powershell
# Check if MQTT broker is running
# For Mosquitto:
net start mosquitto

# Check shopfloor logs
cd shopfloors
npm run sf1
```

### No heartbeats showing
- Ensure shopfloor simulators are running
- Check MQTT broker is accessible
- Verify backend is subscribed to `shopfloor/heartbeat` topic

### Orders not distributing
- Check MongoDB connection
- Verify shopfloor capacities are set
- Check backend logs for errors

## 📝 Default Credentials (After Registration)

**ERP Owner:**
- Username: `erp_admin`
- Password: `erp123`

**MES Manager:**
- Username: `mes_manager`
- Password: `mes123`

**Shopfloor Workers:**
- Username: `worker1` / `worker2` / `worker3`
- Password: `worker123`

## 🔒 Security Notes

- Change `SESSION_SECRET` in production
- Use HTTPS in production
- Store Google OAuth credentials securely
- Implement rate limiting for APIs
- Add input validation and sanitization

## 📦 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB
- MQTT (Mosquitto)
- Passport.js (Google OAuth)
- bcrypt (Password hashing)

**Frontend:**
- React 18
- Material-UI (MUI)
- Chart.js
- Axios
- React Router

**Communication:**
- REST API (HTTP)
- MQTT (Pub/Sub)
- WebSockets (Real-time updates)

## 🎓 Learning Resources

- [MQTT Protocol](https://mqtt.org/)
- [ISA-95 Standard](https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa95)
- [Material-UI Docs](https://mui.com/)
- [MongoDB Docs](https://docs.mongodb.com/)

## 📄 License

MIT License - Feel free to use for learning and development

## 🤝 Contributing

This is a learning project. Feel free to extend and modify!

## 📞 Support

For issues or questions, check the troubleshooting section or review the code comments.

---

**🎉 Congratulations! Your MES-ERP system is ready to use!**

Start with creating users, then create an order as ERP Owner, and watch it flow through the entire system!
