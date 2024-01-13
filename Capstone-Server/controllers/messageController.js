"use strict";
const Models = require("../models");

// Get messages for a group
const getMessages = (req, res) => {
  const { groupId, requesterId } = req.params;

  // Find the group based on ID and requester's membership
  Models.Group.findById({ _id: groupId, users: requesterId })
    .then((foundGroup) => {
      if (!foundGroup) {
        return res.status(404).send({ result: 404, error: "Group not found" });
      }

      // Retrieve the latest 50 messages from the group
      const messages = foundGroup.messages.slice(-50);

      res.status(200).send({ result: 200, data: messages });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Create a new message for a group
const createMessage = (req, res) => {
  const { groupId, requesterId } = req.params;
  const { message } = req.body;
  const { senderId, text } = message;

  // Ensure requester is the sender of the message
  const cleanedRequesterId = requesterId.trim();
  const cleanedSenderId = senderId.trim();

  if (cleanedRequesterId !== cleanedSenderId) {
    return res
      .status(403)
      .send({ result: 403, error: "User not authorized to send this message" });
  }

  // Find the group based on ID
  Models.Group.findById(groupId)
    .then((foundGroup) => {
      if (!foundGroup) {
        return res.status(404).send({ result: 404, error: "Group not found" });
      }

      // Create a new message
      const newMessage = {
        senderId,
        text,
        sentAt: Date.now(),
      };

      // Add the new message to the group's messages array
      foundGroup.messages.push(newMessage);

      // Save the updated group with the new message
      return foundGroup.save();
    })
    .then((savedGroup) => {
      // Retrieve the last added message from the saved group
      const responseMessage =
        savedGroup.messages[savedGroup.messages.length - 1];
      console.log(responseMessage);
      res.status(200).send({ result: 200, data: responseMessage });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

// Delete a message from a group
const deleteMessage = (req, res) => {
  const { groupId, requesterId, id } = req.params;

  // Find the group and update it to remove the specified message
  Models.Group.findOneAndUpdate(
    { _id: groupId, users: requesterId },
    { $pull: { messages: { _id: id, senderId: requesterId } } },
    { new: true }
  )
    .then((updatedGroup) => {
      if (!updatedGroup) {
        return res
          .status(404)
          .send({ result: 404, error: "Message or Group not found" });
      }
      res.status(200).send({ result: 200, data: updatedGroup });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ result: 500, error: err.message });
    });
};

module.exports = {
  getMessages,
  createMessage,
  deleteMessage,
};
