import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema(
  {
    compliance_id: { type: String, unique: true, required: true, trim: true },
    vendor_id: { type: String, required: true, trim: true },
    license_number: { type: String, trim: true },
    license_expiry: { type: Date },
    insurance_policy: { type: String, trim: true },
    insurance_expiry: { type: Date },
    insurance_coverage: { type: Number, min: 0 },
    wcb_number: { type: String, trim: true },
    status: {
      type: String,
      enum: ['compliant', 'at_risk', 'non_compliant', 'needs_review'],
      default: 'needs_review',
      index: true,
    },
    ai_confidence: { type: Number, min: 0, max: 100 },
    missing_items: { type: [String], default: [] },
    rationale: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

export default Vendor;


