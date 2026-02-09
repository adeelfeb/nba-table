import { applyCors } from '../../../utils';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';
import ValentineContestEntry from '../../../models/ValentineContestEntry';
import { checkText, getBlockedMessage } from '../../../lib/contentModeration';

const MIN_MESSAGE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 500;

export const config = {
  api: {
    bodyParser: { sizeLimit: '10kb' },
  },
};

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const db = await requireDB(res);
  if (!db) return;

  try {
    const body = req.body || {};
    let message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return jsonError(res, 400, 'Please write a message to enter the contest.');
    }
    if (message.length < MIN_MESSAGE_LENGTH) {
      return jsonError(res, 400, `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      message = message.slice(0, MAX_MESSAGE_LENGTH);
    }

    const moderation = checkText(message);
    if (moderation.blocked) {
      return jsonError(res, 400, getBlockedMessage(), 'CONTENT_BLOCKED');
    }

    await ValentineContestEntry.create({ message });
    return jsonSuccess(res, 201, 'Your message has been submitted! Thank you for entering the contest.');
  } catch (error) {
    console.error('Error submitting Valentine contest entry:', error);
    return jsonError(res, 500, 'Something went wrong. Please try again.', error.message);
  }
}
