"use strict";
const Models = require("../models");

// Get user by email and password
const getUsers = (req, res) => {
  const { emailId, password } = req.params;

  // Find user by email
  Models.User.findOne({ emailId })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ result: 404, error: "Email not found" });
      }

      // Check if the provided password matches the user's password
      if (user.password !== password) {
        return res
          .status(401)
          .send({ result: 401, error: "Incorrect password" });
      }

      // Send user data if email and password are valid
      res.status(200).send({ result: 200, data: user });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Create a new user
const createUser = (req, res) => {
  const userData = req.body;

  // Save the new user to the database
  new Models.User(userData)
    .save()
    .then((data) => res.status(200).send({ result: 200, data: data }))
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Update user details
const updateUser = (req, res) => {
  if (req.body._id === req.params.id) {
    // Update user information based on ID
    Models.User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .then((data) => {
        if (!data) {
          return res.status(404).send({ result: 404, error: "User not found" });
        }
        res.status(200).send({ result: 200, data: data });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ result: 500, error: err.message });
      });
  } else {
    // Unauthorized access
    res.status(403).send({ result: 403, error: "Unauthorized" });
  }
};

// Update user groups
const updateUserGroups = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { groups } = req.body;

    // Update user groups
    await Models.User.findByIdAndUpdate(userId, { $set: { groups } });

    res
      .status(200)
      .json({ result: 200, message: "User groups updated successfully." });
  } catch (error) {
    console.error("Error updating user groups:", error);
    res.status(500).json({ result: 500, error: "Internal Server Error" });
  }
};

// Delete user
const deleteUser = (req, res) => {
  if (req.body._id === req.params.id) {
    // Delete user based on ID
    Models.User.findByIdAndDelete(req.params.id)
      .then((data) => {
        if (!data) {
          return res.status(404).send({ result: 404, error: "User not found" });
        }
        res.status(200).send({ result: 200, data: data });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ result: 500, error: err.message });
      });
  } else {
    res.status(403).send({ result: 403, error: "Unauthorized" });
  }
};

// Search users by IDs
const searchUsersByIds = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find users by provided IDs
    const users = await Models.User.find({ _id: userId });

    // Extract relevant user data for response
    const usersWithUsernames = users.map((user) => ({
      _id: user._id,
      userName: user.userName,
    }));

    res.status(200).json({ result: 200, data: usersWithUsernames });
  } catch (error) {
    console.error("Error searching users by IDs:", error);
    res.status(500).json({ result: 500, error: "Internal Server Error" });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  updateUserGroups,
  deleteUser,
  searchUsersByIds,
};
