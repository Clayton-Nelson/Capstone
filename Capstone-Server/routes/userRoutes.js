const express = require("express");
const router = express.Router();
const Controllers = require("../controllers");

// Get user by email and password
router.get("/:emailId/:password", Controllers.userController.getUsers);

// Search users by IDs
router.get("/:userId", Controllers.userController.searchUsersByIds);

// Create a new user
router.post("/create", Controllers.userController.createUser);

// Update user details
router.put("/update/:id", Controllers.userController.updateUser);

// Delete user
router.delete("/delete/:id", Controllers.userController.deleteUser);

// Update user groups
router.patch("/groups/:userId", Controllers.userController.updateUserGroups);

module.exports = router;
