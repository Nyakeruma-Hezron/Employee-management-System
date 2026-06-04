const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const { verifyHR, verifyEmployee, verifyHREmployee } = require("../middleware/auth");
const { 
  Employee, EmployeeValidation, EmployeeValidationUpdate, EmployeePersonalInfoValidation,
  Salary, SalaryValidation,
  Education, EducationValidation,
  FamilyInfo, FamilyInfoValidation,
  WorkExperience, WorkExperienceValidation,
  LeaveApplication, LeaveApplicationValidation, LeaveApplicationHRValidation
} = require("../models/index");

// ==========================
// EMPLOYEE CORE
// ==========================
router.get("/employee", verifyHR, (req, res) => {
  Employee.find()
    .populate({ path: "role position department" })
    .select("-salary -education -familyInfo -workExperience -Password")
    .exec(function (err, employee) { res.send(employee); });
});

router.post("/employee", verifyHR, (req, res) => {
  // 1. THE TERMINATE DATE FIX: Sanitize empty strings before Joi sees them
  if (req.body.TerminateDate === "") {
    delete req.body.TerminateDate;
  }

  Joi.validate(req.body, EmployeeValidation, (err, result) => {
    if (err) {
      res.status(400).send(err.details[0].message);
    } else {
      // 2. THE SECURITY FIX: Hash the password before saving to the database
      const hashedPassword = bcrypt.hashSync(req.body.Password, 10);

      let newEmployee = {
        Email: req.body.Email,
        Password: hashedPassword, // <--- Now securely hashed!
        role: req.body.RoleID,
        Account: req.body.Account,
        Gender: req.body.Gender,
        FirstName: req.body.FirstName,
        MiddleName: req.body.MiddleName,
        LastName: req.body.LastName,
        DOB: req.body.DOB,
        ContactNo: req.body.ContactNo,
        EmployeeCode: req.body.EmployeeCode,
        department: req.body.DepartmentID,
        position: req.body.PositionID,
        DateOfJoining: req.body.DateOfJoining,
        TerminateDate: req.body.TerminateDate
      };
      
      Employee.create(newEmployee, function (err, employee) {
        if (err) res.send("error");
        else res.send(employee);
      });
    }
  });
});

router.put("/employee/:id", verifyHR, (req, res) => {
  // Apply the same Terminate Date fix to the update route as well!
  if (req.body.TerminateDate === "") {
    delete req.body.TerminateDate;
  }

  Joi.validate(req.body, EmployeeValidationUpdate, (err, result) => {
    if (err) {
      res.status(400).send(err.details[0].message);
    } else {
      let newEmployee = {
        Email: req.body.Email,
        Account: req.body.Account,
        role: req.body.RoleID,
        Gender: req.body.Gender,
        FirstName: req.body.FirstName,
        MiddleName: req.body.MiddleName,
        LastName: req.body.LastName,
        DOB: req.body.DOB,
        ContactNo: req.body.ContactNo,
        EmployeeCode: req.body.EmployeeCode,
        department: req.body.DepartmentID,
        position: req.body.PositionID,
        DateOfJoining: req.body.DateOfJoining,
        TerminateDate: req.body.TerminateDate
      };
      
      Employee.findByIdAndUpdate(req.params.id, newEmployee, function (err, employee) {
        if (err) res.send("error");
        else res.send(newEmployee);
      });
    }
  });
});

router.delete("/employee/:id", verifyHR, (req, res) => {
  res.send("error");
});

// ==========================
// SALARY
// ==========================
router.get("/salary", verifyHR, (req, res) => {
  Employee.find().populate({ path: "salary" }).select("FirstName LastName MiddleName")
    .exec(function (err, company) {
      let filteredCompany = company.filter(data => data["salary"].length == 1);
      res.send(filteredCompany);
    });
});

router.post("/salary/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, SalaryValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      Employee.findById(req.params.id, function (err, employee) {
        if (err) res.send("err");
        else {
          if (employee.salary.length == 0) {
            let newSalary = {
              BasicSalary: req.body.BasicSalary,
              BankName: req.body.BankName,
              AccountNo: req.body.AccountNo,
              AccountHolderName: req.body.AccountHolderName,
              IFSCcode: req.body.IFSCcode,
              TaxDeduction: req.body.TaxDeduction
            };
            Salary.create(newSalary, function (err, salary) {
              if (err) res.send("error");
              else {
                employee.salary.push(salary);
                employee.save(function (err, data) {
                  if (err) res.send("err");
                  else res.send(salary);
                });
              }
            });
          } else {
            res.status(403).send("Salary Information about this employee already exits");
          }
        }
      });
    }
  });
});

router.put("/salary/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, SalaryValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newSalary = {
        BasicSalary: req.body.BasicSalary,
        BankName: req.body.BankName,
        AccountNo: req.body.AccountNo,
        AccountHolderName: req.body.AccountHolderName,
        IFSCcode: req.body.IFSCcode,
        TaxDeduction: req.body.TaxDeduction
      };
      Salary.findByIdAndUpdate(req.params.id, newSalary, function (err, salary) {
        if (err) res.send("error");
        else res.send(newSalary);
      });
    }
  });
});

router.delete("/salary/:id", verifyHR, (req, res) => {
  Employee.findById({ _id: req.params.id }, function (err, employee) {
    if (err) res.send("error");
    else {
      Salary.findByIdAndRemove({ _id: employee.salary[0] }, function (err, salary) {
        if (!err) {
          Employee.update(
            { _id: req.params.id },
            { $pull: { salary: employee.salary[0] } },
            function (err, numberAffected) { res.send(salary); }
          );
        } else {
          res.send("error");
        }
      });
    }
  });
});

// ==========================
// PERSONAL INFO
// ==========================
router.get("/personal-info/:id", verifyHREmployee, (req, res) => {
  Employee.findById(req.params.id).populate({ path: "role position department" })
    .select("-salary -education -familyInfo -workExperience")
    .exec(function (err, employee) { res.send(employee); });
});

router.put("/personal-info/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, EmployeePersonalInfoValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newEmployee = {
        BloodGroup: req.body.BloodGroup, ContactNo: req.body.ContactNo,
        DOB: req.body.DOB, Email: req.body.Email, EmergencyContactNo: req.body.EmergencyContactNo,
        Gender: req.body.Gender, Hobbies: req.body.Hobbies, PANcardNo: req.body.PANcardNo,
        PermanetAddress: req.body.PermanetAddress, PresentAddress: req.body.PresentAddress
      };
      Employee.findByIdAndUpdate(req.params.id, { $set: newEmployee }, function (err, numberAffected) {
        res.send(newEmployee);
      });
    }
  });
});

// ==========================
// EDUCATION
// ==========================
router.get("/education/:id", verifyHREmployee, (req, res) => {
  Employee.findById(req.params.id).populate({ path: "education" }).select("FirstName LastName MiddleName")
    .exec(function (err, employee) { res.send(employee); });
});

router.post("/education/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, EducationValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      Employee.findById(req.params.id, function (err, employee) {
        if (err) res.send("err");
        else {
          let newEducation = {
            SchoolUniversity: req.body.SchoolUniversity, Degree: req.body.Degree,
            Grade: req.body.Grade, PassingOfYear: req.body.PassingOfYear
          };
          Education.create(newEducation, function (err, education) {
            if (err) res.send("error");
            else {
              employee.education.push(education);
              employee.save(function (err, data) {
                if (err) res.send("err");
                else res.send(education);
              });
            }
          });
        }
      });
    }
  });
});

router.put("/education/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, EducationValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newEducation = {
        SchoolUniversity: req.body.SchoolUniversity, Degree: req.body.Degree,
        Grade: req.body.Grade, PassingOfYear: req.body.PassingOfYear
      };
      Education.findByIdAndUpdate(req.params.id, newEducation, function (err, education) {
        if (err) res.send("error");
        else res.send(newEducation);
      });
    }
  });
});

router.delete("/education/:id/:id2", verifyEmployee, (req, res) => {
  Employee.findById({ _id: req.params.id }, function (err, employee) {
    if (err) res.send("error");
    else {
      Education.findByIdAndRemove({ _id: req.params.id2 }, function (err, education) {
        if (!err) {
          Employee.update({ _id: req.params.id }, { $pull: { education: req.params.id2 } }, function (err, numberAffected) {
            res.send(education);
          });
        } else res.send("error");
      });
    }
  });
});

// ==========================
// FAMILY INFO
// ==========================
router.get("/family-info/:id", verifyHREmployee, (req, res) => {
  Employee.findById(req.params.id).populate({ path: "familyInfo" }).select("FirstName LastName MiddleName")
    .exec(function (err, employee) { res.send(employee); });
});

router.post("/family-info/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, FamilyInfoValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      Employee.findById(req.params.id, function (err, employee) {
        if (err) res.send("err");
        else {
          let newFamilyInfo = {
            Name: req.body.Name, Relationship: req.body.Relationship,
            DOB: req.body.DOB, Occupation: req.body.Occupation
          };
          FamilyInfo.create(newFamilyInfo, function (err, familyInfo) {
            if (err) res.send("error");
            else {
              employee.familyInfo.push(familyInfo);
              employee.save(function (err, data) {
                if (err) res.send("err");
                else res.send(familyInfo);
              });
            }
          });
        }
      });
    }
  });
});

router.put("/family-info/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, FamilyInfoValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newFamilyInfo = {
        Name: req.body.Name, Relationship: req.body.Relationship,
        DOB: req.body.DOB, Occupation: req.body.Occupation
      };
      FamilyInfo.findByIdAndUpdate(req.params.id, newFamilyInfo, function (err, familyInfo) {
        if (err) res.send("error");
        else res.send(newFamilyInfo);
      });
    }
  });
});

router.delete("/family-info/:id/:id2", verifyEmployee, (req, res) => {
  Employee.findById({ _id: req.params.id }, function (err, employee) {
    if (err) res.send("error");
    else {
      FamilyInfo.findByIdAndRemove({ _id: req.params.id2 }, function (err, familyInfo) {
        if (!err) {
          Employee.update({ _id: req.params.id }, { $pull: { familyInfo: req.params.id2 } }, function (err, numberAffected) {
            res.send(familyInfo);
          });
        } else res.send("error");
      });
    }
  });
});

// ==========================
// WORK EXPERIENCE
// ==========================
router.get("/work-experience/:id", verifyHREmployee, (req, res) => {
  Employee.findById(req.params.id).populate({ path: "workExperience" }).select("FirstName LastName MiddleName")
    .exec(function (err, employee) { res.send(employee); });
});

router.post("/work-experience/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, WorkExperienceValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      Employee.findById(req.params.id, function (err, employee) {
        if (err) res.send("err");
        else {
          let newWorkExperience = {
            CompanyName: req.body.CompanyName, Designation: req.body.Designation,
            FromDate: req.body.FromDate, ToDate: req.body.ToDate
          };
          WorkExperience.create(newWorkExperience, function (err, workExperience) {
            if (err) res.send("error");
            else {
              employee.workExperience.push(workExperience);
              employee.save(function (err, data) {
                if (err) res.send("err");
                else res.send(workExperience);
              });
            }
          });
        }
      });
    }
  });
});

router.put("/work-experience/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, WorkExperienceValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newWorkExperience = {
        CompanyName: req.body.CompanyName, Designation: req.body.Designation,
        FromDate: req.body.FromDate, ToDate: req.body.ToDate
      };
      WorkExperience.findByIdAndUpdate(req.params.id, newWorkExperience, function (err, workExperience) {
        if (err) res.send("error");
        else res.send(newWorkExperience);
      });
    }
  });
});

router.delete("/Work-experience/:id/:id2", verifyEmployee, (req, res) => {
  Employee.findById({ _id: req.params.id }, function (err, employee) {
    if (err) res.send("error");
    else {
      WorkExperience.findByIdAndRemove({ _id: req.params.id2 }, function (err, workExperience) {
        if (!err) {
          Employee.update({ _id: req.params.id }, { $pull: { workExperience: req.params.id2 } }, function (err, numberAffected) {
            res.send(workExperience);
          });
        } else res.send("error");
      });
    }
  });
});

// ==========================
// LEAVE APPLICATION (EMPLOYEE)
// ==========================
router.get("/leave-application-emp/:id", verifyEmployee, (req, res) => {
  Employee.findById(req.params.id).populate({ path: "leaveApplication" }).select("FirstName LastName MiddleName")
    .exec(function (err, employee) {
      if (err) res.send("error");
      else res.send(employee);
    });
});

router.post("/leave-application-emp/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, LeaveApplicationValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      Employee.findById(req.params.id, function (err, employee) {
        if (err) res.send("err");
        else {
          let newLeaveApplication = {
            Leavetype: req.body.Leavetype, FromDate: req.body.FromDate,
            ToDate: req.body.ToDate, Reasonforleave: req.body.Reasonforleave,
            Status: req.body.Status, employee: req.params.id
          };
          LeaveApplication.create(newLeaveApplication, function (err, leaveApplication) {
            if (err) res.send("error");
            else {
              employee.leaveApplication.push(leaveApplication);
              employee.save(function (err, data) {
                if (err) res.send("err");
                else res.send(leaveApplication);
              });
            }
          });
        }
      });
    }
  });
});

router.put("/leave-application-emp/:id", verifyEmployee, (req, res) => {
  Joi.validate(req.body, LeaveApplicationValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newLeaveApplication = {
        Leavetype: req.body.Leavetype, FromDate: req.body.FromDate,
        ToDate: req.body.ToDate, Reasonforleave: req.body.Reasonforleave,
        Status: req.body.Status, employee: req.params.id
      };
      LeaveApplication.findByIdAndUpdate(req.params.id, newLeaveApplication, function (err, leaveApplication) {
        if (err) res.send("error");
        else res.send(newLeaveApplication);
      });
    }
  });
});

router.delete("/leave-application-emp/:id/:id2", verifyEmployee, (req, res) => {
  Employee.findById({ _id: req.params.id }, function (err, employee) {
    if (err) res.send("error");
    else {
      LeaveApplication.findByIdAndRemove({ _id: req.params.id2 }, function (err, leaveApplication) {
        if (!err) {
          Employee.update({ _id: req.params.id }, { $pull: { leaveApplication: req.params.id2 } }, function (err, numberAffected) {
            res.send(leaveApplication);
          });
        } else res.send("error");
      });
    }
  });
});

// ==========================
// LEAVE APPLICATION (HR VIEW)
// ==========================
router.get("/leave-application-hr", verifyHR, (req, res) => {
  LeaveApplication.find().populate({ path: "employee" })
    .exec(function (err, leaveApplication) {
      if (err) res.send("error");
      else res.send(leaveApplication);
    });
});

router.put("/leave-application-hr/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, LeaveApplicationHRValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newLeaveApplication = { Status: req.body.Status };
      LeaveApplication.findByIdAndUpdate(req.params.id, { $set: newLeaveApplication }, function (err, numberAffected) {
        res.send(newLeaveApplication);
      });
    }
  });
});

router.delete("/leave-application-hr/:id/:id2", verifyHR, (req, res) => {
  Employee.findById({ _id: req.params.id }, function (err, employee) {
    if (err) res.send("error");
    else {
      LeaveApplication.findByIdAndRemove({ _id: req.params.id2 }, function (err, leaveApplication) {
        if (!err) {
          Employee.update({ _id: req.params.id }, { $pull: { leaveApplication: req.params.id2 } }, function (err, numberAffected) {
            res.send(leaveApplication);
          });
        } else res.send("error");
      });
    }
  });
});
module.exports = router;