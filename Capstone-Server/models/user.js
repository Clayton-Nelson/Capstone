const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: { type: String, trim: true, required: true },
  emailId: { type: String, trim: true, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'group' }],
  pendingRequests: [{ type: Schema.Types.ObjectId, ref: 'user' }]
},{
  versionKey: false
});

module.exports = mongoose.model("user", userSchema);