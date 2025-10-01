require("dotenv").config();
const mqtt = require("mqtt");
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors({ origin: ["http://localhost:3001", "http://localhost:3002"], credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mes_erp_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // set true on HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// MQTT Client
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || "mqtt://localhost:1883");

// MongoDB Setup
const mongoURL = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "mes_erp_db";

let mongoClient, db;
let usersCollection, ordersCollection, reportsCollection, capacitiesCollection, heartbeatsCollection;

MongoClient.connect(mongoURL, { useUnifiedTopology: true })
  .then((client) => {
    mongoClient = client;
    db = client.db(dbName);

    usersCollection = db.collection("users");
    ordersCollection = db.collection("orders");
    reportsCollection = db.collection("reports");
    capacitiesCollection = db.collection("capacities");
    heartbeatsCollection = db.collection("heartbeats");

    // Initialize default shopfloor capacities
    ["Shopfloor-1", "Shopfloor-2", "Shopfloor-3"].forEach((sf, i) => {
      capacitiesCollection.updateOne(
        { shopfloor: sf },
        { 
          $setOnInsert: { 
            shopfloor: sf, 
            capacity: 5000 + i * 1000,
            currentLoad: 0,
            updatedAt: new Date()
          } 
        },
        { upsert: true }
      );
    });

    console.log("✅ Connected to MongoDB (MES-ERP Database)");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await usersCollection.findOne({ email });

        if (!user) {
          // Create new user with default role
          user = {
            username: profile.displayName,
            email,
            role: "user", // Default role, can be changed by admin
            shopfloor: "Shopfloor-1", // Default shopfloor for users
            googleId: profile.id,
            createdAt: new Date(),
          };
          await usersCollection.insertOne(user);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// MQTT Message Handling
let latestHeartbeats = {};

mqttClient.on("connect", () => {
  console.log("✅ MES connected to MQTT broker");
  mqttClient.subscribe("mes/order");
  mqttClient.subscribe("shopfloor/report");
  mqttClient.subscribe("shopfloor/heartbeat");
});

mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (topic === "shopfloor/report") {
      console.log("📊 Received shopfloor report:", data);

      await reportsCollection.insertOne({
        orderID: data.OrderID,
        shopfloor: data.Shopfloor,
        assigned: data.Assigned || 0,
        produced: data.Produced,
        defective: data.Defective || 0,
        status: data.Status || "Completed",
        completedAt: new Date(),
      });

      // Update order status
      const allReports = await reportsCollection.find({ orderID: data.OrderID }).toArray();
      const order = await ordersCollection.findOne({ orderID: data.OrderID });
      
      if (order) {
        const totalProduced = allReports.reduce((sum, r) => sum + r.produced, 0);
        const allCompleted = allReports.every(r => r.status === "Completed");
        
        if (allCompleted || totalProduced >= order.quantity) {
          await ordersCollection.updateOne(
            { orderID: data.OrderID },
            { $set: { status: "Completed", completedAt: new Date() } }
          );
        }
      }

      // Update shopfloor current load
      await updateShopfloorLoad(data.Shopfloor);
    }

    if (topic === "shopfloor/heartbeat") {
      console.log(`💓 Heartbeat from ${data.shopfloor}`);
      latestHeartbeats[data.shopfloor] = {
        shopfloor: data.shopfloor,
        status: "online",
        timestamp: new Date(data.timestamp),
      };

      await heartbeatsCollection.updateOne(
        { shopfloor: data.shopfloor },
        { 
          $set: { 
            status: "online",
            timestamp: new Date(data.timestamp),
            updatedAt: new Date()
          } 
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("Error handling MQTT message:", err);
  }
});

// Helper: Update shopfloor current load
async function updateShopfloorLoad(shopfloor) {
  const inProgressReports = await reportsCollection
    .find({ shopfloor, status: "InProgress" })
    .toArray();
  
  const currentLoad = inProgressReports.reduce(
    (sum, r) => sum + (r.assigned - r.produced),
    0
  );

  await capacitiesCollection.updateOne(
    { shopfloor },
    { $set: { currentLoad, updatedAt: new Date() } }
  );
}

// Helper: Compute order distribution based on capacity
async function computeDistribution(totalQty) {
  const capacities = await capacitiesCollection.find({}).toArray();

  const available = capacities.map((c) => ({
    shopfloor: c.shopfloor,
    free: Math.max(c.capacity - (c.currentLoad || 0), 0),
  }));

  const totalFree = available.reduce((s, a) => s + a.free, 0) || 1;
  const distribution = {};

  available.forEach((a) => {
    distribution[a.shopfloor] = Math.floor((a.free / totalFree) * totalQty);
  });

  // Distribute remainder
  let sum = Object.values(distribution).reduce((s, v) => s + v, 0);
  let diff = totalQty - sum;
  const shopfloors = available.map((a) => a.shopfloor);
  let i = 0;
  while (diff > 0) {
    const sf = shopfloors[i % shopfloors.length];
    distribution[sf]++;
    diff--;
    i++;
  }

  return distribution;
}

// Middleware: Require authentication
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// Middleware: Require specific role
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// ==================== AUTH ROUTES ====================

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password, email, role = "user", shopfloor = "Shopfloor-1" } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: "Username, password, and email required" });
    }

    const existing = await usersCollection.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      password: hashedPassword,
      email,
      role,
      shopfloor: role === "user" ? shopfloor : null,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);
    res.json({ status: "ok", message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      shopfloor: user.shopfloor,
    };

    res.json({ status: "ok", user: req.session.user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3001" }),
  (req, res) => {
    req.session.user = {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      shopfloor: req.user.shopfloor,
    };
    res.redirect("http://localhost:3001");
  }
);

// Get current user
app.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json(req.session.user);
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ status: "ok", message: "Logged out" });
  });
});

// ==================== ORDER ROUTES (ERP) ====================

// Create new order (ERP Owner only)
app.post("/orders", requireRole(["erp_owner"]), async (req, res) => {
  try {
    const { description, quantity, material } = req.body;

    if (!description || !quantity || !material) {
      return res.status(400).json({ error: "Description, quantity, and material required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    const orderID = `ORD-${Date.now()}`;
    const distribution = await computeDistribution(quantity);

    const newOrder = {
      orderID,
      description,
      quantity,
      material,
      status: "InProgress",
      createdBy: req.session.user.username,
      createdAt: new Date(),
      distribution,
    };

    await ordersCollection.insertOne(newOrder);

    // Send instructions to shopfloors via MQTT
    for (const [shopfloor, qty] of Object.entries(distribution)) {
      if (qty > 0) {
        const instruction = {
          OrderID: orderID,
          Description: description,
          Material: material,
          Assigned: qty,
          Status: "InProgress",
        };
        mqttClient.publish(`${shopfloor}/instruction`, JSON.stringify(instruction));
        console.log(`📤 Sent instruction to ${shopfloor}:`, instruction);

        // Create initial report entry
        await reportsCollection.insertOne({
          orderID,
          shopfloor,
          assigned: qty,
          produced: 0,
          defective: 0,
          status: "InProgress",
          completedAt: null,
        });
      }
    }

    res.json({ status: "ok", orderID, distribution });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
app.get("/orders", requireAuth, async (req, res) => {
  try {
    const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific order
app.get("/orders/:id", requireAuth, async (req, res) => {
  try {
    const order = await ordersCollection.findOne({ orderID: req.params.id });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MES ROUTES ====================

// Get capacities
app.get("/capacities", requireAuth, async (req, res) => {
  try {
    const capacities = await capacitiesCollection.find({}).toArray();
    res.json(capacities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update capacity (MES Manager only)
app.post("/capacities", requireRole(["mes_manager"]), async (req, res) => {
  try {
    const { shopfloor, capacity } = req.body;

    if (!shopfloor || typeof capacity !== "number" || capacity < 0) {
      return res.status(400).json({ error: "Valid shopfloor and capacity required" });
    }

    await capacitiesCollection.updateOne(
      { shopfloor },
      { $set: { capacity, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reports
app.get("/reports", requireAuth, async (req, res) => {
  try {
    const reports = await reportsCollection.find({}).sort({ completedAt: -1 }).toArray();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get analytics (ERP Owner)
app.get("/analytics", requireRole(["erp_owner"]), async (req, res) => {
  try {
    const totalOrders = await ordersCollection.countDocuments({});
    const completedOrders = await ordersCollection.countDocuments({ status: "Completed" });
    const inProgressOrders = await ordersCollection.countDocuments({ status: "InProgress" });

    const totalProduced = await reportsCollection.aggregate([
      { $group: { _id: null, total: { $sum: "$produced" } } }
    ]).toArray();

    const totalDefective = await reportsCollection.aggregate([
      { $group: { _id: null, total: { $sum: "$defective" } } }
    ]).toArray();

    const productionByShopfloor = await reportsCollection.aggregate([
      { $group: { _id: "$shopfloor", produced: { $sum: "$produced" }, defective: { $sum: "$defective" } } }
    ]).toArray();

    res.json({
      totalOrders,
      completedOrders,
      inProgressOrders,
      totalProduced: totalProduced[0]?.total || 0,
      totalDefective: totalDefective[0]?.total || 0,
      productionByShopfloor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SHOPFLOOR ROUTES ====================

// Get orders for specific shopfloor (User only)
app.get("/shopfloor/:name/orders", requireRole(["user"]), async (req, res) => {
  try {
    const { name } = req.params;
    
    // Verify user is assigned to this shopfloor
    if (req.session.user.shopfloor !== name) {
      return res.status(403).json({ error: "Access denied to this shopfloor" });
    }

    const reports = await reportsCollection.find({ shopfloor: name }).sort({ completedAt: -1 }).toArray();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get heartbeats
app.get("/heartbeats", requireAuth, async (req, res) => {
  try {
    const heartbeats = await heartbeatsCollection.find({}).toArray();
    res.json(heartbeats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 MES-ERP Backend running on http://localhost:${PORT}`);
});
