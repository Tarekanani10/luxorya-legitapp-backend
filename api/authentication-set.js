const { handlePreflight, legitApp, sendError } = require('./_lib');

module.exports = async (req, res) => {
  if (handlePreflight(req, res)) return;

  try {
    const { category_id, brand_id, model_id } = req.query;
    const response = await legitApp.get('/authentication_set', {
      params: { category_id, brand_id, model_id },
    });
    res.status(200).json(response.data);
  } catch (error) {
    sendError(res, error);
  }
};
