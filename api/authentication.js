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

    // customer_name / customer_email are only used here, for the
    // confirmation email — they're never forwarded to LegitApp.
    await sendConfirmationEmail({
      to: req.body.customer_email,
      name: req.body.customer_name,
      referenceId: response.data.authentication_id,
    });

    res.status(200).json(response.data);
  } catch (error) {
    sendError(res, error);
  }
};
