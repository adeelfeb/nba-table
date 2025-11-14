import mongoose from 'mongoose';

function normalizeOrigin(value) {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return '';
    }
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port ? `:${parsed.port}` : '';
    return `${protocol}//${hostname}${port}`;
  } catch {
    return '';
  }
}

const AllowedOriginSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedOrigin: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AllowedOriginSchema.statics.normalizeOrigin = normalizeOrigin;

AllowedOriginSchema.pre('validate', function setNormalizedOrigin(next) {
  const normalized = normalizeOrigin(this.origin);
  if (!normalized) {
    this.invalidate('origin', 'Origin must be a valid HTTP or HTTPS URL (e.g., https://example.com)');
    return next(new Error('Invalid origin URL'));
  }
  this.normalizedOrigin = normalized;
  this.origin = normalized;
  return next();
});

const AllowedOrigin =
  mongoose.models.AllowedOrigin || mongoose.model('AllowedOrigin', AllowedOriginSchema);

export default AllowedOrigin;


