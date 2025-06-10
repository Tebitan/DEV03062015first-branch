import * as Joi from 'joi';

export const validationSchema = Joi.object({
  MONGO_URI: Joi.string().uri().required(),
  AI_API_KEY: Joi.string().required(),
  MONGO_FAQ_COLLECTION: Joi.string().required(),
  MONGO_QUERY_TIMEOUT: Joi.number().required(),
  GLOBAL_TIMEOUT_MS: Joi.number().required(),
  REST_TIMEOUT: Joi.number().required(),
  AI_ENDPOINT_EMBEDDING:Joi.string().uri().required(),
  AI_MODEL_EMBEDDING:Joi.string().required(),
});
