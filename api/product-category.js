const { handlePreflight, legitApp, sendError } = require('./_lib');

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  try {
    const response = await legitApp.get('/product_category');
    res.status(200).json(response.data);
  } catch (error) {
    sendError(res, error);
  }
};
