import mongoose from 'mongoose';

const ValentineContestEntrySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    /** Set by admin when selecting the featured message for the page */
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

ValentineContestEntrySchema.index({ createdAt: -1 });

const ValentineContestEntry =
  mongoose.models.ValentineContestEntry ||
  mongoose.model('ValentineContestEntry', ValentineContestEntrySchema);

export default ValentineContestEntry;
