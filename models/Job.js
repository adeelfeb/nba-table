import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    job_id: { type: String, unique: true, required: true, trim: true },
    source: { type: String, enum: ['phone', 'webform', 'partner'], default: 'phone' },
    transcript_id: { type: String, default: null, trim: true },
    customer_name: { type: String, trim: true },
    customer_phone: { type: String, trim: true },
    customer_email: { type: String, trim: true },
    address_street: { type: String, trim: true },
    address_unit: { type: String, trim: true },
    address_city: { type: String, trim: true },
    address_postal: { type: String, trim: true },
    service_type: { type: String, enum: ['plumbing', 'hvac', 'restoration'] },
    subcategory: { type: String, trim: true },
    priority: { type: String, enum: ['emergency', 'same_day', 'scheduled'] },
    window_start: { type: Date },
    window_end: { type: Date },
    notes_scope: { type: String },
    compliance_only: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        'confirmed',
        'pending_approval',
        'approved_for_outreach',
        'dispatching',
        'assigned',
        'en_route',
        'complete',
        'canceled',
      ],
      default: 'pending_approval',
      index: true,
    },
    assigned_vendor_id: { type: String, trim: true },
    ai_confidence: { type: Number, min: 0, max: 1 },
    ai_json: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

export default Job;


