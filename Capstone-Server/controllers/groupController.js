"use strict";
const Models = require("../models");

// Get groups for a specific user
const getGroups = (req, res) => {
  const { userId } = req.params;

  Models.Group.find({ users: userId })
    .then((groups) => {
      res.status(200).send({ result: 200, data: groups });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Get all groups for a user (async/await syntax)
const getAllGroupsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userGroups = await Models.Group.find({ users: userId });

    res.status(200).json({ result: 200, data: userGroups });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ result: 500, error: "Internal Server Error" });
  }
};

// Get brief information about groups for a user
const getBriefGroups = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userGroups = await Models.Group.find({ users: userId });

    // Transform detailed group information into brief format
    const briefGroups = userGroups.map((group) => ({
      _id: group._id.toHexString(),
      groupName: group.groupName,
      users: group.users.map((user) => user.toHexString()),
      groupAdmins: group.groupAdmins.map((admin) => admin.toHexString()),
      messages: group.messages.slice(-10),
      createdAt: group.createdAt,
    }));

    res.status(200).json({ result: 200, data: briefGroups });
  } catch (error) {
    console.error("Error fetching brief groups:", error);

    if (error.name === "CastError") {
      console.error("Invalid user ID format");
    }

    res.status(500).json({ result: 500, error: "Internal Server Error" });
  }
};

// Create a new group
const createGroup = (req, res) => {
  try {
    const { groupName, users, admins } = req.body;

    // Create a new group instance
    const newGroup = new Models.Group({
      groupName: groupName,
      users: users,
      groupAdmins: admins,
    });

    // Save the new group to the database
    newGroup
      .save()
      .then((data) => res.status(200).json({ result: 200, data }))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ result: 500, error: err.message });
      });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ result: 500, error: "Internal Server Error" });
  }
};

// Delete a group
const deleteGroup = (req, res) => {
  const { groupId } = req.params;
  const { requesterId } = req.body;

  // Find and delete a group based on ID and requester's admin rights
  Models.Group.findOneAndDelete({ _id: groupId, groupAdmins: requesterId })
    .then((deletedGroup) => {
      if (!deletedGroup) {
        return res
          .status(404)
          .send({ result: 404, error: "Group not found or unauthorized" });
      }
      res.status(200).send({ result: 200, data: deletedGroup });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Add a user to a group
const addUserToGroup = (req, res) => {
  const { groupId, userId } = req.params;
  const { requesterId } = req.body;

  // Find and update a group to add a user, checking admin rights
  Models.Group.findOneAndUpdate(
    { _id: groupId, groupAdmins: requesterId },
    { $addToSet: { users: userId } },
    { new: true }
  )
    .then((updatedGroup) => {
      if (!updatedGroup) {
        return res
          .status(404)
          .send({ result: 404, error: "Group not found or unauthorized" });
      }
      res.status(200).send({ result: 200, data: updatedGroup });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Remove a user from a group
const removeUserFromGroup = (req, res) => {
  const { groupId, userId } = req.params;
  const { requesterId } = req.body;

  // Find and update a group to remove a user, checking admin rights
  Models.Group.findOneAndUpdate(
    { _id: groupId, groupAdmins: requesterId },
    { $pull: { users: userId } },
    { new: true }
  )
    .then((updatedGroup) => {
      if (!updatedGroup) {
        return res
          .status(404)
          .send({ result: 404, error: "Group not found or unauthorized" });
      }
      res.status(200).send({ result: 200, data: updatedGroup });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Add a user as admin to a group
const addUserAdmin = (req, res) => {
  const { groupId, userId } = req.params;
  const { requesterId } = req.body;

  // Find and update a group to add a user as admin, checking admin rights
  Models.Group.findByIdAndUpdate(
    { _id: groupId, groupAdmins: requesterId },
    { $addToSet: { groupAdmins: userId } },
    { new: true }
  )
    .then((updatedGroup) => {
      if (!updatedGroup) {
        return res
          .status(404)
          .send({ result: 404, error: "Group not found or unauthorized" });
      }
      res.status(200).send({ result: 200, data: updatedGroup });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Remove a user's admin status from a group
const removeUserAdmin = (req, res) => {
  const { groupId, userId } = req.params;
  const { requesterId } = req.body;

  // Find and update a group to remove a user's admin status, checking admin rights
  Models.Group.findByIdAndUpdate(
    { _id: groupId, groupAdmins: requesterId },
    { $pull: { groupAdmins: userId } },
    { new: true }
  )
    .then((updatedGroup) => {
      if (!updatedGroup) {
        return res
          .status(404)
          .send({ result: 404, error: "Group not found or unauthorized" });
      }
      res.status(200).send({ result: 200, data: updatedGroup });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

module.exports = {
  getGroups,
  getAllGroupsForUser,
  getBriefGroups,
  createGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup,
  addUserAdmin,
  removeUserAdmin,
};
