const Address = require("../models/address");

exports.getAllAddresses = async (req, res) => {
  Address.findAll()
    .then((addresses) => {
      res.status(200).json({
        "addresses": addresses,
      });
    })
    .catch((err) => {
      console.error("Error fetching addresses:", err);
      res.status(500).json({
        message: "Error fetching addresses",
        error: err,
      });
    });
};

