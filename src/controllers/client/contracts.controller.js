const { getContracts, createContract, getContractById } = require("../../services/client/contracts.service");
const { ApiError } = require("../../utils/apiError");

exports.getContracts = async (req, res) => {
    try {
        const contracts = await getContracts({ userId: req.user.id });
        res.status(200).json(contracts);
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
}

exports.createContract = async (req, res) => {
    try {
        const { vendorId, description, title, price, deposit, startDate, deliveryDate } = req.body;
        const contract = await createContract({ userId: req.user.id, vendorId, description, title, price, deposit, startDate, deliveryDate });
        res.status(200).json(contract);
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
}

exports.getContractById = async (req, res) => {
    try {
        const { contractId } = req.params;
        const contract = await getContractById({ contractId });
        res.status(200).json(contract);
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
}