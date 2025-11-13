import mongoose from 'mongoose';

const TranscriptSchema = new mongoose.Schema(
  {
    transcript_id: { type: String, unique: true, required: true, trim: true },
    raw_text: { type: String },
    call_start: { type: Date },
    call_end: { type: Date },
    caller_number: { type: String, trim: true },
    agent_name: { type: String, trim: true },
    ai_parse_json: { type: String },
    parse_confidence: { type: Number, min: 0, max: 1 },
  },
  {
    versionKey: false,
  }
);

const Transcript =
  mongoose.models.Transcript || mongoose.model('Transcript', TranscriptSchema);

export default Transcript;


