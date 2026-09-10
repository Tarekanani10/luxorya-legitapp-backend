const { handlePreflight, legitApp, sendError } = require('./_lib');

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  try {
    const { category_id, brand_id } = req.query;
    const response = await legitApp.get('/product_model', {
      params: { category_id, brand_id },
    });
    res.status(200).json(response.data);
  } catch (error) {
    sendError(res, error);
  }
};
