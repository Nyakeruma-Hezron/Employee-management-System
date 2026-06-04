const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcryptjs"); // <--- 1. Import bcryptjs
const { Employee } = require("../models/index");
const { jwtKey } = require("../config/env");

router.post("/login", (req, res) => {
  Joi.validate(
    req.body,
    Joi.object().keys({
      email: Joi.string().max(200).required(),
      password: Joi.string().max(100).required()
    }),
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.details[0].message);
      } else {
        Employee.findOne(
          { Email: req.body.email },
          "Password _id Account FirstName LastName",
          function (err, document) {
            if (err || document == null) {
              res.send("false");
            } else {
              // 2. Use bcrypt to securely compare the passwords
              bcrypt.compare(req.body.password, document.Password, (bcryptErr, isMatch) => {
                if (isMatch) {
                  let emp = {
                    _id: document._id,
                    Account: document.Account,
                    FirstName: document.FirstName,
                    LastName: document.LastName
                  };
                  var token = jwt.sign(emp, jwtKey);
                  res.send(token);
                } else {
                  // If password fails, send the 400 (or ideally a 401 Unauthorized)
                  res.sendStatus(400); 
                }
              });
            }
          }
        );
      }
    }
  );
});

module.exports = router;