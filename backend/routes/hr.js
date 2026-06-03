const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { verifyHR, verifyAdminHR } = require("../middleware/auth");
const { 
  Country, CountryValidation,
  State, StateValidation,
  City, CityValidation,
  Company, CompanyValidation
} = require("../models/index");

// ==========================
// COUNTRY
// ==========================
router.get("/country", verifyHR, (req, res) => {
  Country.find()
    .populate({ path: "states", populate: { path: "cities" } })
    .exec(function (err, country) {
      res.send(country);
    });
});

router.post("/country", verifyHR, (req, res) => {
  Joi.validate(req.body, CountryValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newCountry = { CountryName: req.body.CountryName };
      Country.create(newCountry, function (err, country) {
        if (err) res.send("error");
        else res.send(country);
      });
    }
  });
});

router.put("/country/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, CountryValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newCountry = { CountryName: req.body.CountryName };
      Country.findByIdAndUpdate(req.params.id, newCountry, function (err, country) {
        if (err) res.send("error");
        else res.send(newCountry);
      });
    }
  });
});

router.delete("/country/:id", verifyHR, (req, res) => {
  Country.findById(req.params.id, function (err, foundCountry) {
    if (err) res.send(err);
    else {
      if (!foundCountry.states.length == 0) {
        res.status(403).send("First Delete All The states in this country before deleting this country");
      } else {
        Country.findByIdAndRemove({ _id: req.params.id }, function (err, country) {
          if (!err) {
            State.deleteMany({ country: { _id: req.params.id } }, function (err) {
              if (err) res.send("error");
              else {
                City.deleteMany({ state: { country: { _id: req.params.id } } }, function (err) {
                  if (err) res.send("error");
                  else res.send(country);
                });
              }
            });
          } else {
            res.send("error");
          }
        });
      }
    }
  });
});

// ==========================
// STATE
// ==========================
router.get("/state", verifyHR, (req, res) => {
  State.find().populate("country citiesx").exec(function (err, country) {
    res.send(country);
  });
});

router.post("/state", verifyHR, (req, res) => {
  Joi.validate(req.body, StateValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newState = { StateName: req.body.StateName, country: req.body.CountryID };
      State.create(newState, function (err, state) {
        if (err) res.send("error");
        else {
          Country.findById(req.body.CountryID, function (err, country) {
            if (err) res.send("err");
            else {
              country.states.push(state);
              country.save(function (err, data) {
                if (err) res.send("err");
                else res.send(state);
              });
            }
          });
        }
      });
    }
  });
});

router.put("/state/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, StateValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newState = { StateName: req.body.StateName, country: req.body.CountryID };
      State.findByIdAndUpdate(req.params.id, newState, function (err, state) {
        if (err) res.send("error");
        else res.send(newState);
      });
    }
  });
});

router.delete("/state/:id", verifyHR, (req, res) => {
  State.findById(req.params.id, function (err, foundState) {
    if (err) res.send(err);
    else {
      if (!foundState.cities.length == 0) {
        res.status(403).send("First Delete All The cities in this state before deleting this state");
      } else {
        State.findByIdAndRemove({ _id: req.params.id }, function (err, state) {
          if (!err) {
            Country.update(
              { _id: state.country[0] },
              { $pull: { states: state._id } },
              function (err, numberAffected) { res.send(state); }
            );
          } else {
            res.send("error");
          }
        });
      }
    }
  });
});

// ==========================
// CITY
// ==========================
router.get("/city", verifyHR, (req, res) => {
  City.find().populate({ path: "state", populate: { path: "country" } }).exec(function (err, city) {
    res.send(city);
  });
});

router.post("/city", verifyHR, (req, res) => {
  Joi.validate(req.body, CityValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newCity = { CityName: req.body.CityName, state: req.body.StateID };
      City.create(newCity, function (err, city) {
        if (err) res.send("error");
        else {
          State.findById(req.body.StateID, function (err, state) {
            if (err) res.send("err");
            else {
              state.cities.push(city);
              state.save(function (err, data) {
                if (err) res.send("err");
                else res.send(city);
              });
            }
          });
        }
      });
    }
  });
});

router.put("/city/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, CityValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newCity = { CityName: req.body.CityName, state: req.body.StateID };
      City.findByIdAndUpdate(req.params.id, newCity, function (err, city) {
        if (err) res.send("error");
        else res.send(newCity);
      });
    }
  });
});

router.delete("/city/:id", verifyHR, (req, res) => {
  Company.find({ city: req.params.id }, function (err, country) {
    if (err) res.send(err);
    else {
      if (country.length == 0) {
        City.findByIdAndRemove({ _id: req.params.id }, function (err, city) {
          if (!err) {
            State.update(
              { _id: city.state[0] },
              { $pull: { cities: city._id } },
              function (err, numberAffected) { res.send(city); }
            );
          } else {
            res.send("error");
          }
        });
      } else {
        res.status(403).send("This city is associated with company so you can not delete this");
      }
    }
  });
});

// ==========================
// COMPANY
// ==========================
router.get("/company", verifyAdminHR, (req, res) => {
  Company.find()
    .populate({
      path: "city",
      populate: {
        path: "state",
        model: "State",
        populate: { path: "country", model: "Country" }
      }
    })
    .exec(function (err, company) {
      res.send(company);
    });
});

router.post("/company", verifyHR, (req, res) => {
  Joi.validate(req.body, CompanyValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newCompany = {
        CompanyName: req.body.CompanyName,
        Address: req.body.Address,
        city: req.body.CityID,
        PostalCode: req.body.PostalCode,
        Website: req.body.Website,
        Email: req.body.Email,
        ContactPerson: req.body.ContactPerson,
        ContactNo: req.body.ContactNo,
        FaxNo: req.body.FaxNo,
        PanNo: req.body.PanNo,
        GSTNo: req.body.GSTNo,
        CINNo: req.body.CINNo
      };
      Company.create(newCompany, function (err, company) {
        if (err) res.send("error");
        else res.send(newCompany);
      });
    }
  });
});

router.put("/company/:id", verifyHR, (req, res) => {
  Joi.validate(req.body, CompanyValidation, (err, result) => {
    if (err) res.status(400).send(err.details[0].message);
    else {
      let newCompany = {
        CompanyName: req.body.CompanyName,
        Address: req.body.Address,
        city: req.body.CityID,
        PostalCode: req.body.PostalCode,
        Website: req.body.Website,
        Email: req.body.Email,
        ContactPerson: req.body.ContactPerson,
        ContactNo: req.body.ContactNo,
        FaxNo: req.body.FaxNo,
        PanNo: req.body.PanNo,
        GSTNo: req.body.GSTNo,
        CINNo: req.body.CINNo
      };
      Company.findByIdAndUpdate(req.params.id, newCompany, function (err, company) {
        if (err) res.send("error");
        else res.send(newCompany);
      });
    }
  });
});
module.exports = router;