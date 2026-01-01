import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '', trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

RoleSchema.pre('save', function (next) {
  // Defensive check for next function
  if (!next || typeof next !== 'function') {
    this.updatedAt = new Date();
    return;
  }
  this.updatedAt = new Date();
  next();
});

RoleSchema.pre('findOneAndUpdate', function (next) {
  // Defensive check for next function
  if (!next || typeof next !== 'function') {
    this.set({ updatedAt: new Date() });
    return;
  }
  this.set({ updatedAt: new Date() });
  next();
});

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
export default Role;


