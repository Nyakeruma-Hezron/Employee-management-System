const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const seedDatabase = async () => {
  try {
    // 1. Pull the correct model name from your Mongoose registry
    const Employee = mongoose.model("Employee"); 

    // 2. Check for Master Admin (Account Level 1)
    const adminExists = await Employee.findOne({ Account: 1 });
    
    if (!adminExists) {
      console.log("No Admin found. Bootstrapping Admin account...");
      const adminPassword = await bcrypt.hash("admin", 10);
      
      // Injecting all the strict required:true fields from your schema
      await Employee.create({
        Email: "admin@nyxai.dev",
        Password: adminPassword,
        Account: 1,
        FirstName: "System",
        MiddleName: "Master",
        LastName: "Admin",
        Gender: "N/A",
        EmployeeCode: "ADMIN-001"
      });
      console.log("✅ Admin account successfully seeded.");
    } else {
      console.log("✅ Admin already exists! Skipping creation.");
    }

    // 3. Check for Master HR (Account Level 2)
    const hrExists = await Employee.findOne({ Account: 2 });
    
    if (!hrExists) {
      console.log("No HR found. Bootstrapping HR account...");
      const hrPassword = await bcrypt.hash("hr", 10);
      
      await Employee.create({
        Email: "hr@nyxai.dev",
        Password: hrPassword,
        Account: 2,
        FirstName: "Human",
        MiddleName: "Resources",
        LastName: "Director",
        Gender: "N/A",
        EmployeeCode: "HR-001"
      });
      console.log("✅ HR account successfully seeded.");
    } else {
      console.log("✅ HR already exists! Skipping creation.");
    }

  } catch (error) {
    console.error("❌ Failed to seed database:", error);
  }
};

module.exports = seedDatabase;