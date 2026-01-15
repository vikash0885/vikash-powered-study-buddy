import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const apiKey = process.env.GROK_API_KEY;
