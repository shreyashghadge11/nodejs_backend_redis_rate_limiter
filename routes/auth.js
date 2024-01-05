const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { ValidateEmail, ValidatePassword } = require("../utils/helper");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { TOKEN_SECRET } = require("../config/index");

// Signup Route
router.post("/signup", (req, res) => {
  const { email, password } = req.body;
  // Validate the email and password
  if (!ValidateEmail(email)) {
    return res.status(400).json({
      message: "Invalid Email",
    });
  }
  if (!ValidatePassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

    // Check if the user already exists
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

        // Hash the password
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
            message: "Internal Server Error",
          });
        }
        const newUser = new User({
          email: email,
          password: hash,
        });
        // Save the user
        newUser
          .save()
          .then(() =>
            res.status(200).json({
              message: "User Created",
              email: email,
            })
          )
          .catch((err) =>
            res.status(500).json({
              error: err,
              message: "Internal Server Error",
            })
          );
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        message: "Internal Server Error",
      });
    });
});

// Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!ValidateEmail(email)) {
    return res.status(400).json({
      message: "Invalid Email",
    });
  }

  // Check if the user exists
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          message: "Email does not exist",
        });
      }

      // Compare the password
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err,
            message: "Internal Server Error",
          });
        }
        if (!result) {
          return res.status(400).json({
            message: "Invalid Password",
          });
        }

        // Create a token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          TOKEN_SECRET
        );

        res.status(200).json({
          message: "Login Successful",
          token: token,
        });
      });
    })
    .catch((err) =>
      res.status(500).json({
        error: err,
        message: "Internal Server Error",
      })
    );
});

module.exports = router;
