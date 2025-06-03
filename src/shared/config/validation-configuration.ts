import * as Joi from 'joi';

export const validationSchema = Joi.object({
  MONGO_URI: Joi.string().uri().required(),
  GROQ_API_KEY: Joi.string().required(),
  MONGO_FAQ_COLLECTION: Joi.string().required(),
  MONGO_QUERY_TIMEOUT: Joi.number().required(),
  GLOBAL_TIMEOUT_MS: Joi.number().required(),
});
