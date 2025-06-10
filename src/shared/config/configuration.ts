export default () => ({
    globalTimeoutMs: parseInt(process.env.GLOBAL_TIMEOUT_MS ?? '3000', 10),
    mongoUri: process.env.MONGO_URI,
    aiApiKey: process.env.AI_API_KEY,
    mongoFaqCollectionName: process.env.MONGO_FAQ_COLLECTION,
    mongoQueryTimeout: parseInt(process.env.MONGO_QUERY_TIMEOUT ?? '2000', 10),
    restTimeout: parseInt(process.env.REST_TIMEOUT ?? '2000', 10),
    aiEndpointEmbedding:process.env.AI_ENDPOINT_EMBEDDING,
    aiModelEmbedding:process.env.AI_MODEL_EMBEDDING,
});
