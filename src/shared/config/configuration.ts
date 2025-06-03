export default () => ({
    globalTimeoutMs: parseInt(process.env.GLOBAL_TIMEOUT_MS ?? '3000', 10),
    mongoUri: process.env.MONGO_URI,
    groqApiKey: process.env.GROQ_API_KEY,
    mongoFaqCollectionName: process.env.MONGO_FAQ_COLLECTION,
    mongoQueryTimeout: parseInt(process.env.MONGO_QUERY_TIMEOUT ?? '2000', 10),
});
