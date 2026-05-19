const liveService = require('../services/live.service');

exports.getDashboard = async (req, res) => {

  try {

    const data = await liveService.getLiveData(
      req.params.siteId
    );

    res.json(data);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};