const packageService = require("../../services/vendor/package.service");


exports.createPackage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const packageData = req.body;

    const newPackage = await packageService.createPackage({
      userId,
      packageData,
    });
    res.status(201).json(newPackage);
  } catch (error) {
    if (error.message === "Vendor not found for the given user") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

exports.getPackages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const packages = await packageService.getPackages(userId);
    res.status(200).json(packages);
  } catch (error) {
    if (error.message === "Vendor not found for the given user") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const packageData = req.body;

    const updatedPackage = await packageService.updatePackage({
      userId,
      packageId: id,
      packageData,
    });
    res.status(200).json(updatedPackage);
  } catch (error) {
    if (error.message === "Package not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Unauthorized to update this package") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Vendor not found for the given user") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await packageService.deletePackage({ userId, packageId: id });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Package not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Unauthorized to delete this package") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Vendor not found for the given user") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
