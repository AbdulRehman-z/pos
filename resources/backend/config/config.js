require("dotenv").config();

const baseURI = process.env.MONGODB_URI || "mongodb://localhost:27017/pos-db";
const databaseURI = baseURI.endsWith('/') ? `${baseURI}pos-db` : (baseURI.includes('/', 10) ? baseURI : `${baseURI}/pos-db`);

const config = Object.freeze({
    port: process.env.PORT || 3000,
    databaseURI: databaseURI,
    nodeEnv: process.env.NODE_ENV || "development",
    accessTokenSecret: "khan",
});

module.exports = config;
