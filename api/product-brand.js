const { handlePreflight, legitApp, sendError } = require('./_lib');

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  try {
    const { category_id } = req.query;
    const response = await legitApp.get('/product_brand', {
      params: { category_id },
    });
    res.status(200).json(response.data);
  } catch (error) {
    sendError(res, error);
  }
};
