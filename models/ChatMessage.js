import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

// Compound index for listing messages between two users
ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
ChatMessageSchema.index({ recipient: 1, readAt: 1 });

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
export default ChatMessage;
