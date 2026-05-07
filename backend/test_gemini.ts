import { searchDeviceWithGemini } from './src/services/geminiService';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log("Searching with Gemini...");
  const res = await searchDeviceWithGemini("iphone 16");
  console.log("Result:", JSON.stringify(res, null, 2));
}

test().catch(console.error);
