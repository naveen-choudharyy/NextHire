import { BadRequestError } from '../utils/errors.js';

export const validate = (schema) => (req, res, next) => {
  try {
    // Validate request components using Zod schema
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((err) => {
        const path = err.path.slice(1).join('.'); // Remove 'body', 'query', etc.
        return `${path ? `'${path}'` : 'Field'} ${err.message.toLowerCase()}`;
      });
      return next(new BadRequestError(`Validation failed: ${errorMessages.join('. ')}`));
    }

    // Replace request parts with validated and parsed data
    req.body = parsed.data.body || req.body;
    req.query = parsed.data.query || req.query;
    req.params = parsed.data.params || req.params;

    next();
  } catch (error) {
    next(error);
  }
};
