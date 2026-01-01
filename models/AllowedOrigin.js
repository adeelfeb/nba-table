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

// Use pre-save instead of pre-validate for better compatibility
AllowedOriginSchema.pre('save', function setNormalizedOrigin(next) {
  // Ensure next is a function (defensive check for Mongoose compatibility)
  if (!next || typeof next !== 'function') {
    // If next is not a function, handle synchronously
    try {
      if (this.origin) {
        const normalized = normalizeOrigin(this.origin);
        if (!normalized) {
          this.invalidate('origin', 'Origin must be a valid HTTP or HTTPS URL (e.g., https://example.com)');
          return;
        }
        this.normalizedOrigin = normalized;
        if (this.origin !== normalized) {
          this.origin = normalized;
        }
      }
    } catch (error) {
      // Silently handle error if next is not available
      console.error('Error in AllowedOrigin pre-save hook:', error);
    }
    return;
  }

  // Normal hook execution with next callback
  try {
    if (this.origin) {
      const normalized = normalizeOrigin(this.origin);
      if (!normalized) {
        this.invalidate('origin', 'Origin must be a valid HTTP or HTTPS URL (e.g., https://example.com)');
        return next(new Error('Invalid origin URL'));
      }
      this.normalizedOrigin = normalized;
      if (this.origin !== normalized) {
        this.origin = normalized;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const AllowedOrigin =
  mongoose.models.AllowedOrigin || mongoose.model('AllowedOrigin', AllowedOriginSchema);

export default AllowedOrigin;


