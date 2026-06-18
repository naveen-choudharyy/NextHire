import mongoose from 'mongoose';
import { Resume } from './models/Resume.js';
import { config } from './config/index.js';

async function main() {
  await mongoose.connect(config.mongodbUri || 'mongodb://127.0.0.1:27017/nexthire');
  console.log('Connected to MongoDB');

  const resumeId = '52fc7a1b-c553-49bd-8e53-b676eb8dbc67';
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    console.log(`Resume not found for ID: ${resumeId}`);
    const all = await Resume.find().limit(5);
    console.log('Sample resumes in DB:', all.map(r => ({ id: r.id, title: r.title, fullName: r.content?.personal?.fullName })));
  } else {
    console.log('Resume found:');
    console.log(JSON.stringify(resume, null, 2));
  }

  await mongoose.disconnect();
}

main().catch(console.error);
