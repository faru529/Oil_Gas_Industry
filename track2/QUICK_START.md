# 🚀 Quick Start Guide - MES-ERP System

## ✅ Complete Project Created!

All files have been created in: `C:\Users\admin\Desktop\Java_practice\final\track2\`

## 📁 Project Structure

```
track2/
├── backend/                    ✅ Complete
│   ├── server.js              ✅ Full backend with role-based auth
│   ├── package.json           ✅ Dependencies
│   └── .env                   ✅ Configuration
├── frontend/                   ✅ Complete
│   ├── package.json           ✅ Dependencies
│   ├── public/
│   │   └── index.html         ✅ HTML template
│   └── src/
│       ├── index.js           ✅ React entry point
│       ├── index.css          ✅ Global styles
│       ├── App.js             ✅ Main router
│       └── components/
│           ├── RoleLogin.js        ✅ Login with role selector
│           ├── ERPDashboard.js     ✅ ERP Owner dashboard
│           ├── MESManager.js       ✅ MES Manager dashboard
│           └── ShopfloorUser.js    ✅ Shopfloor worker dashboard
├── shopfloors/                 ✅ Complete
│   ├── package.json           ✅ Dependencies
│   ├── shopfloor1.js          ✅ Simulator
│   ├── shopfloor2.js          ✅ Simulator
│   └── shopfloor3.js          ✅ Simulator
├── README.md                   ✅ Full documentation
├── SETUP_INSTRUCTIONS.md       ✅ Detailed setup
└── QUICK_START.md             ✅ This file
```

## ⚡ 5-Minute Setup

### 1. Prerequisites Check

```powershell
# Check Node.js
node --version  # Should be v16+

# Check MongoDB
mongo --version

# Check if MongoDB is running
# Windows: Services → MongoDB should be "Running"
# Or start it:
net start MongoDB
```

### 2. Install MQTT Broker (if not installed)

**Option A: Mosquitto (Recommended)**
- Download: https://mosquitto.org/download/
- Install and start: `net start mosquitto`

**Option B: Quick MQTT broker**
```powershell
npm install -g mosca
mosca -v  # Run in separate terminal
```

### 3. Install Dependencies

```powershell
# Backend
cd C:\Users\admin\Desktop\Java_practice\final\track2\backend
npm install

# Frontend
cd ..\frontend
npm install

# Shopfloors
cd ..\shopfloors
npm install
```

### 4. Start Everything

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```
✅ Should see: `🚀 MES-ERP Backend running on http://localhost:4000`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```
✅ Should open: `http://localhost:3001`

**Terminal 3 - All Shopfloors:**
```powershell
cd shopfloors
npm run all
```
✅ Should see heartbeats from all 3 shopfloors

## 👥 Test the System

### Step 1: Register Users (2 minutes)

Go to `http://localhost:3001` and register:

**1. ERP Owner:**
- Role: ERP Owner
- Username: `erp_admin`
- Email: `erp@test.com`
- Password: `erp123`

**2. MES Manager:**
- Role: MES Manager
- Username: `mes_manager`
- Email: `mes@test.com`
- Password: `mes123`

**3. Shopfloor Worker:**
- Role: Shopfloor Worker (User)
- Shopfloor: Shopfloor-1
- Username: `worker1`
- Email: `worker1@test.com`
- Password: `worker123`

### Step 2: Create Order (1 minute)

1. Login as `erp_admin`
2. Fill order form:
   - Description: "Cola Bottles 500ml"
   - Quantity: 10000
   - Material: "PET Plastic"
3. Click "Create Order"
4. Note the Order ID (e.g., `ORD-1234567890`)

### Step 3: Watch the Magic! (30 seconds)

**In Shopfloor Terminals:**
```
💓 Shopfloor-1 heartbeat sent
📥 Shopfloor-1 received instruction: { OrderID: 'ORD-...', Assigned: 3333 }
🔨 Shopfloor-1 starting production...
✅ Shopfloor-1 completed order!
```

**In Frontend:**
- ERP Dashboard: See order status change to "Completed"
- MES Manager: See reports coming in
- Shopfloor Worker: See your orders and stats

### Step 4: View Results (1 minute)

**As ERP Owner:**
- Scroll to "Production Reports from MES"
- View analytics charts
- See production by shopfloor

**As MES Manager:**
- Logout and login as `mes_manager`
- View all orders
- Check heartbeats (all green)
- See real-time capacities

**As Shopfloor Worker:**
- Logout and login as `worker1`
- See heartbeat pulse animation
- View your orders only
- Check production stats

## 🎯 What You'll See

### ERP Dashboard
- ✅ Order creation form
- ✅ All orders list
- ✅ Production reports
- ✅ Analytics charts (bar + pie)
- ✅ Summary metrics

### MES Manager Dashboard
- ✅ Shopfloor capacities (editable)
- ✅ Real-time heartbeats (green/red)
- ✅ All orders with distribution
- ✅ All production reports

### Shopfloor User Dashboard
- ✅ Heartbeat status with pulse
- ✅ Production statistics
- ✅ My orders (only assigned shopfloor)
- ✅ Real-time updates

## 🔗 Integration with Digital Twin

The MES-ERP button in your Digital Twin landing page now redirects to:
`http://localhost:3001`

**To test:**
1. Start Digital Twin: `cd track1/my-app && npm start` (Port 3000)
2. Start MES-ERP: `cd track2/frontend && npm start` (Port 3001)
3. Go to `http://localhost:3000`
4. Click "Access MES-ERP" button
5. Should redirect to MES-ERP login

## 📊 System Ports

- **Digital Twin Frontend**: http://localhost:3000
- **Digital Twin Backend**: http://localhost:5000
- **MES-ERP Frontend**: http://localhost:3001
- **MES-ERP Backend**: http://localhost:4000
- **MQTT Broker**: mqtt://localhost:1883
- **MongoDB**: mongodb://localhost:27017

## 🐛 Quick Troubleshooting

**Backend Error:**
```powershell
# Check MongoDB
net start MongoDB

# Check port 4000
netstat -ano | findstr :4000
```

**Frontend Error:**
```powershell
# Clear and reinstall
cd frontend
rm -rf node_modules
npm install
```

**No Heartbeats:**
```powershell
# Check MQTT broker
net start mosquitto

# Restart shopfloors
cd shopfloors
npm run all
```

## ✨ Features Implemented

✅ Role-based authentication (user, mes_manager, erp_owner)
✅ Google OAuth integration
✅ Order creation with auto-generated IDs
✅ Capacity-based order distribution
✅ Real-time heartbeat monitoring
✅ Production reports and analytics
✅ Dark theme UI with animations
✅ Real-time updates (5-10 second refresh)
✅ MongoDB storage
✅ MQTT communication
✅ Shopfloor simulators with heartbeats
✅ Charts and visualizations
✅ Role-based page access control

## 📚 Next Steps

1. **Customize Capacities**: Login as MES Manager and adjust shopfloor capacities
2. **Create More Orders**: Test with different quantities and materials
3. **Add More Workers**: Register workers for Shopfloor-2 and Shopfloor-3
4. **Monitor Production**: Watch real-time updates across all dashboards
5. **View Analytics**: Check production trends and defect rates

## 🎉 Success Checklist

- [ ] MongoDB running
- [ ] MQTT broker running
- [ ] Backend started (port 4000)
- [ ] Frontend started (port 3001)
- [ ] Shopfloors running (all 3)
- [ ] Users registered (ERP, MES, Worker)
- [ ] First order created
- [ ] Order completed by shopfloors
- [ ] Reports visible in ERP dashboard
- [ ] Heartbeats showing green
- [ ] Analytics charts displaying

## 📞 Need Help?

Check `README.md` for detailed documentation and troubleshooting.

---

**🚀 Your complete MES-ERP system is ready!**

Start by registering users, create an order, and watch it flow through the entire manufacturing process!
