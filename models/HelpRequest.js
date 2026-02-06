import mongoose from 'mongoose';

const HelpRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

HelpRequestSchema.index({ user: 1, createdAt: -1 });

const HelpRequest =
  mongoose.models.HelpRequest ||
  mongoose.model('HelpRequest', HelpRequestSchema);

export default HelpRequest;
