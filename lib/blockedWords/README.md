# Blocked words (content moderation)

Word lists used by `lib/contentModeration.js` to detect vulgar, spammy, or reportable text.

- **en.js** – English terms (vulgar, obscene, common spam phrases).
- **romanUrdu.js** – Roman Urdu / chat Urdu (Latin script, e.g. WhatsApp style).

## Editing lists

- One term per array entry, lowercase.
- Add or remove terms as needed; the app uses these lists without restart.
- Word-boundary matching is used (e.g. "classic" won’t match "ass").

## Where moderation runs

- **Valentine links (create/update):** recipient name, email subject, email body, welcome text, main message, button text, second button text, reply prompt label. All are checked before save; if any contain a blocked term, the request is rejected.
- **Valentine reply (public page):** the reply message text is checked before saving.
- **New Year resolutions:** title and description (create/update).
- **API:** `POST /api/moderation/check` (auth required) for client-side checks; response does not reveal which words were found.
