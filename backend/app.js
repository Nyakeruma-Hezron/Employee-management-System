const express = require("express");
const cors = require("cors");
require("./models/index"); 

// Import Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const hrRoutes = require("./routes/hr");               // <--- NEW
const employeeRoutes = require("./routes/employee");   // <--- NEW

const app = express();

app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Wire up the routes!
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", hrRoutes);           // <--- NEW
app.use("/api", employeeRoutes);     // <--- NEW

const port = process.env.PORT || 4000;
app.listen(port, process.env.IP, () => {
  console.log(`Started application on port ${port}!`);
});