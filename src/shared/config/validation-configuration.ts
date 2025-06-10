import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().required(),
  GLOBAL_TIMEOUT_MS: Joi.number().required(),
  MONGO_URI: Joi.string().uri().required(),
  MONGO_FAQ_COLLECTION: Joi.string().required(),
  MONGO_QUERY_TIMEOUT: Joi.number().required(),
  MONGO_EMBEDDINGS_INDEX: Joi.string().required(),
  MONGO_EMBEDDINGS_FIELD: Joi.string().required(),
  MONGO_EMBEDDINGS_RESULT: Joi.number().required(),
  MONGO_EMBEDDINGS_CANDIDATES: Joi.number().required(),
  MONGO_EMBEDDINGS_LIMIT: Joi.number().required(),
  REST_TIMEOUT: Joi.number().required(),
  AI_API_KEY: Joi.string().required(),
  AI_ENDPOINT_EMBEDDING:Joi.string().uri().required(),
  AI_MODEL_EMBEDDING:Joi.string().required(),
});
