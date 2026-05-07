import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await axios.get(url);
    const models = res.data.models.map((m: any) => m.name);
    fs.writeFileSync('models.json', JSON.stringify(models, null, 2));
    console.log("Wrote models to models.json");
  } catch (err: any) {
    console.error("Error status:", err.response?.status);
  }
}

test().catch(console.error);
