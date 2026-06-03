const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { verifyAdminHR, verifyAdmin } = require("../middleware/auth");
const { 
  Role, RoleValidation, 
  Position, PositionValidation, 
  Department, DepartmentValidation, 
  Portal, PortalValidation, 
  Project, ProjectValidation,
  Employee 
} = require("../models/index");

// ==========================
// ROLE
// ==========================
router.get("/role", verifyAdminHR, (req, res) => {
  Role.find().populate("company").exec(function (err, role) {
    res.send(role);
  });
});

router.post("/role", verifyAdminHR, (req, res) => {
  Joi.validate(req.body, RoleValidation, (err, result) => {
    if (err) {
      res.status(400).send(err.details[0].message);
    } else {
      let newRole = { RoleName: req.body.RoleName, company: req.body.CompanyID };
      Role.create(newRole, function (err, role) {
        if (err) res.send("error");
        else res.send(role);
      });
    }
  });
});

router.put("/role/:id", verifyAdminHR, (req, res) => {
  Joi.validate(req.body, RoleValidation, (err, result) => {
    if (err) {
      res.status(400).send(err.details[0].message);
    } else {
      let updateRole = { RoleName: req.body.RoleName, company: req.body.CompanyID };
      Role.findByIdAndUpdate(req.params.id, updateRole, function (err, role) {
        if (err) res.send("error");
        else res.send(updateRole);
      });
    }
  });
});

router.delete("/role/:id", verifyAdminHR, (req, res) => {
  Employee.find({ role: req.params.id }, function (err, r) {
    if (err) { res.send(err); } 
    else {
      if (r.length == 0) {
        Role.findByIdAndRemove({ _id: req.params.id }, function (err, role) {
          if (!err) res.send(role);
          else res.send("err");
        });
      } else {
        res.status(403).send("This role is associated with Employee so you can not delete this");
      }
    }
  });
});

// ==========================
// POSITION
// ==========================
router.get("/position", verifyAdminHR, (req, res) => {
  Position.find().populate("company").exec(function (err, role) { res.send(role); });
});

router.post("/position", verifyAdminHR, (req, res) => {
  Joi.validate(req.body, PositionValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newPosition = { PositionName: req.body.PositionName, company: req.body.CompanyID };
      Position.create(newPosition, function (err, position) {
        if (err) res.send("error");
        else res.send(position);
      });
    }
  });
});

router.put("/position/:id", verifyAdminHR, (req, res) => {
  Joi.validate(req.body, PositionValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let updatePosition = { PositionName: req.body.PositionName, company: req.body.CompanyID };
      Position.findByIdAndUpdate(req.params.id, updatePosition, function (err, position) {
        if (err) res.send("error");
        else res.send(updatePosition);
      });
    }
  });
});

router.delete("/position/:id", verifyAdminHR, (req, res) => {
  Employee.find({ position: req.params.id }, function (err, p) {
    if (err) res.send(err);
    else {
      if (p.length == 0) {
        Position.findByIdAndRemove({ _id: req.params.id }, function (err, position) {
          if (!err) res.send(position);
          else res.send("err");
        });
      } else {
        res.status(403).send("This Position is associated with Employee so you can not delete this");
      }
    }
  });
});

// ==========================
// DEPARTMENT
// ==========================
router.get("/department", verifyAdminHR, (req, res) => {
  Department.find().populate("company").exec(function (err, employees) { res.send(employees); });
});

router.post("/department", verifyAdminHR, (req, res) => {
  Joi.validate(req.body, DepartmentValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newDepartment = { DepartmentName: req.body.DepartmentName, company: req.body.CompanyID };
      Department.create(newDepartment, function (err, department) {
        if (err) res.send("error");
        else res.send(department);
      });
    }
  });
});

router.put("/department/:id", verifyAdminHR, (req, res) => {
  Joi.validate(req.body, DepartmentValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let updateDepartment = { DepartmentName: req.body.DepartmentName, company: req.body.CompanyID };
      Department.findByIdAndUpdate(req.params.id, updateDepartment, function (err, department) {
        if (err) res.send("error");
        else res.send(updateDepartment);
      });
    }
  });
});

router.delete("/department/:id", verifyAdminHR, (req, res) => {
  Employee.find({ department: req.params.id }, function (err, d) {
    if (err) res.send(err);
    else {
      if (d.length == 0) {
        Department.findByIdAndRemove({ _id: req.params.id }, function (err, department) {
          if (!err) res.send(department);
          else res.send("err");
        });
      } else {
        res.status(403).send("This department is associated with Employee so you can not delete this");
      }
    }
  });
});

// ==========================
// PORTAL
// ==========================
router.get("/admin/portal", verifyAdmin, (req, res) => {
  Portal.find().populate({ path: "projects" }).exec(function (err, portalData) {
      if (err) res.send("err");
      else res.send(portalData);
    });
});

router.post("/admin/portal", verifyAdmin, (req, res) => {
  Joi.validate(req.body, PortalValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newPortal = { PortalName: req.body.PortalName, Status: req.body.Status };
      Portal.create(newPortal, function (err, portalData) {
        if (err) res.send("error");
        else res.send(portalData);
      });
    }
  });
});

router.put("/admin/portal/:id", verifyAdmin, (req, res) => {
  Joi.validate(req.body, PortalValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let updatePortal = { PortalName: req.body.PortalName, Status: req.body.Status };
      Portal.findByIdAndUpdate(req.body._id, updatePortal, function (err, Portal) {
        if (err) res.send("error");
        else res.send(updatePortal);
      });
    }
  });
});

router.delete("/admin/portal/:id", verifyAdmin, (req, res) => {
  Portal.findByIdAndRemove({ _id: req.params.id }, function (err, portal) {
    if (!err) {
      res.send(portal);
      Project.deleteMany({ portals: { _id: portal._id } }, function (err) {});
    } else {
      res.send("err");
    }
  });
});

// ==========================
// PROJECT BID
// ==========================
router.get("/admin/project-bid", verifyAdmin, (req, res) => {
  Project.find().populate("portals").exec(function (err, project) {
      if (err) res.send("err");
      else res.send(project);
    });
});

router.post("/admin/project-bid", verifyAdmin, (req, res) => {
  Joi.validate(req.body, ProjectValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let project = {
        ProjectTitle: req.body.ProjectTitle,
        ProjectURL: req.body.ProjectURL,
        ProjectDesc: req.body.ProjectDesc,
        portals: req.body.Portal_ID,
        EstimatedTime: req.body.EstimatedTime,
        EstimatedCost: req.body.EstimatedCost,
        ResourceID: req.body.ResourceID,
        Status: req.body.Status,
        Remark: req.body.Remark
      };
      Project.create(project, function (err, project) {
        if (err) res.send("error");
        else res.send(project);
      });
    }
  });
});

router.put("/admin/project-bid/:id", verifyAdmin, (req, res) => {
  Joi.validate(req.body, ProjectValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let updateProject = {
        ProjectTitle: req.body.ProjectTitle,
        ProjectURL: req.body.ProjectURL,
        ProjectDesc: req.body.ProjectDesc,
        portals: req.body.Portal_ID,
        EstimatedTime: req.body.EstimatedTime,
        EstimatedCost: req.body.EstimatedCost,
        ResourceID: req.body.ResourceID,
        Status: req.body.Status,
        Remark: req.body.Remark
      };
      Project.findByIdAndUpdate(req.params.id, updateProject, function (err, Project) {
        if (err) res.send("error");
        else res.send(updateProject);
      });
    }
  });
});

router.delete("/admin/project-bid/:id", verifyAdmin, (req, res) => {
  Project.findByIdAndRemove({ _id: req.params.id }, function (err, project) {
    if (err) res.send("err");
    else res.send(project);
  });
});

module.exports = router;