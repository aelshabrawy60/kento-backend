import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    let errors = {};

    if (result.error instanceof ZodError) {
      // flatten() gives you field-based errors
      const flattened = result.error.flatten();
      errors = { ...flattened.fieldErrors }; // keys = field names
    } else {
      errors = { general: ["Invalid input"] };
    }

    return next(new ApiError(400, "Validation Error", errors));
  }

  req.validated = result.data;
  next();
};