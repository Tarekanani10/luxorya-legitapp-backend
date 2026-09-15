const { handlePreflight, legitApp, sendError } = require('./_lib');
const { sendConfirmationEmail } = require('./_email');

// Fields we accept from the storefront form and forward as-is to LegitApp.
// See: https://docs.legitapp.com/api-integration/server-api-v1
const ALLOWED_FIELDS = [
  'authentication_set_id',
  'category_id',
  'brand_id',
  'model_id',
  'product_sku',
  'product_sku_id',
  'turnaround_time_id',
  'service_extra_service_ids',
  'images',
  'product_source_type',
  'product_source_remark',
  'product_source_currency',
  'product_source_price',
  'user_custom_code',
  'user_remark',
  'certificate_owner_name',
];

// The storefront form doesn't send separate customer_name / customer_email
// fields — it packs both into user_custom_code as "Name <email@domain.com>".
// This pulls them back apart so we can use them for the confirmation email,
// while user_custom_code itself still goes to LegitApp unchanged.
function extractContactFromCustomCode(userCustomCode) {
  if (!userCustomCode) return { name: undefined, email: undefined };

  const match = userCustomCode.match(/^(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) return { name: undefined, email: undefined };

  const name = match[1].trim() || undefined;
  const email = match[2].trim() || undefined;
  return { name, email };
}

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const payload = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    const response = await legitApp.post('/authentication', payload);

    // customer_name / customer_email aren't sent separately by the form —
    // they're embedded in user_custom_code ("Name <email>"). We only use
    // them here for the confirmation email; they're never forwarded to
    // LegitApp on their own (user_custom_code itself already was, above,
    // as part of payload).
    // Falls back to req.body.customer_name / customer_email if the form
    // is ever updated later to send those directly.
    const extracted = extractContactFromCustomCode(req.body.user_custom_code);

    await sendConfirmationEmail({
      to: req.body.customer_email || extracted.email,
      name: req.body.customer_name || extracted.name,
      referenceId: response.data.authentication_id,
    });

    res.status(200).json(response.data);
  } catch (error) {
    sendError(res, error);
  }
};
