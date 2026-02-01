import express from "express";
import logger from '#config/logger.js';
import './src/config/database.js'
import './src/app.js'
const app = express();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on post ${PORT}`);
});
