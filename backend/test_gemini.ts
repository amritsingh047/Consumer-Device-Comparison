import { findBestDevices } from './src/services/geminiService';

async function test() {
  console.log("Starting test...");
  try {
    const result = await findBestDevices(50000, 'gaming');
    console.log("Result:", result);
  } catch (e) {
    console.log("Error:", e);
  }
}

test();
