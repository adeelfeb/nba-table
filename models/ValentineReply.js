import mongoose from 'mongoose';

const MAX_REPLIES_PER_SESSION = 5;
const DEFAULT_MESSAGE_MAX_LENGTH = 500;

const ValentineReplySchema = new mongoose.Schema(
  {
    valentineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ValentineUrl',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
      trim: true,
      maxlength: 128,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false, versionKey: false }
);

ValentineReplySchema.index({ valentineId: 1, sessionId: 1 });
ValentineReplySchema.index({ valentineId: 1, createdAt: -1 });

const ValentineReply =
  mongoose.models.ValentineReply || mongoose.model('ValentineReply', ValentineReplySchema);
export default ValentineReply;
export { MAX_REPLIES_PER_SESSION, DEFAULT_MESSAGE_MAX_LENGTH };
