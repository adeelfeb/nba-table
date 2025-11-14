import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema(
  {
    candidate_id: { type: String, unique: true, required: true, trim: true, index: true },
    vendor_id: { type: String, trim: true, index: true }, // Maps to vendor_id
    source_system: { type: String, required: true, trim: true, index: true },
    source_ref: { type: String, trim: true, index: true },
    // Contact information
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true }, // E.164 format
    // Company information
    company_name: { type: String, trim: true }, // Maps to legal_name in Vendor
    // Service information
    service_type: { type: String, required: true, trim: true, index: true },
    sub_service: { type: String, trim: true }, // Maps to subcategory
    service_area: { type: String, trim: true }, // e.g., "Calgary, AB"
    // Address
    address: {
      street: { type: String, trim: true },
      unit: { type: String, trim: true },
      city: { type: String, trim: true },
      postal_code: { type: String, trim: true },
      province: { type: String, trim: true },
      country: { type: String, trim: true, default: 'CA' },
    },
    // Documents
    documents: [
      {
        type: { type: String, trim: true }, // 'wcb', 'coi', etc.
        url: { type: String, trim: true },
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    // Status
    onboard_status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected', 'onboarded'],
      default: 'pending',
      index: true,
    },
    // Notes
    notes: { type: String, trim: true },
    // Metadata
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now },
    // Additional fields for mapping to Vendor
    contact_name: { type: String, trim: true }, // From 'name'
    legal_name: { type: String, trim: true }, // From 'company_name'
    subcategory: { type: String, trim: true }, // From 'sub_service'
  },
  {
    versionKey: false,
  }
);

// Indexes for efficient queries
CandidateSchema.index({ source_system: 1, source_ref: 1 });
CandidateSchema.index({ onboard_status: 1, created_at: -1 });
CandidateSchema.index({ service_type: 1, service_area: 1 });

// Auto-update updated_at on save
CandidateSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);

export default Candidate;

