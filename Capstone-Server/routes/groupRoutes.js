const express = require("express");
const router = express.Router();
const Controller = require("../controllers");

// Groups Routes
// Get all groups
router.get("/", Controller.groupController.getGroups);

// Get all groups for a specific user
router.get("/all/:userId", Controller.groupController.getAllGroupsForUser);

// Get brief information about groups for a specific user
router.get("/brief/:userId", Controller.groupController.getBriefGroups);

// Create a new group
router.post("/create", Controller.groupController.createGroup);

// Delete a group by ID
router.delete("/:id", Controller.groupController.deleteGroup);

// User-Group Association Routes

// Add a user to a group
router.post(
  "/users/:groupId/:userId",
  Controller.groupController.addUserToGroup
);

// Remove a user from a group
router.delete(
  "/users/:groupId/:userId",
  Controller.groupController.removeUserFromGroup
);

// Admin-Group Association Routes

// Add a user as an admin to a group
router.post("/admin/:groupId/:userId", Controller.groupController.addUserAdmin);

// Remove a user as an admin from a group
router.delete(
  "/admin/:groupId/:userId",
  Controller.groupController.removeUserAdmin
);

// Messages Routes

// Get messages for a group
router.get(
  "/messages/:groupId/:requesterId",
  Controller.messageController.getMessages
);

// Create a new message in a group
router.post(
  "/messages/create/:groupId/:requesterId",
  Controller.messageController.createMessage
);

// Delete a message by ID from a group
router.delete(
  "/messages/delete/:groupId/:requesterId/:id",
  Controller.messageController.deleteMessage
);

module.exports = router;
