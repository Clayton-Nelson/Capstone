const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  text: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const groupSchema = new Schema({
  groupName: { type:String, required: true },
  messages: [messageSchema],
  users: [{ type: Schema.Types.ObjectId, ref: 'user', required: true }],
  groupAdmins: [{ type: Schema.Types.ObjectId, ref: 'user', required: true }],
  createdAt: { type: Date, default: Date.now },
},{
  versionKey: false
});

module.exports = mongoose.model("group", groupSchema);
