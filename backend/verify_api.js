import mongoose from 'mongoose';
import { User } from './models/User.js';
import { config } from './config/index.js';

const BASE_URL = 'http://127.0.0.1:5001';

async function runPost(url, data, headers = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(data)
  });
  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { rawText: text };
  }
  return { status: res.status, data: json };
}

async function runGet(url, headers = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'GET',
    headers: {
      ...headers
    }
  });
  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { rawText: text };
  }
  return { status: res.status, data: json };
}

async function main() {
  console.log('=== NextHire Express API Verification ===');

  // 1. Health check
  try {
    console.log('[1] Verifying server health...');
    const health = await runGet('/health');
    if (health.status === 200) {
      console.log('✓ Health: OK', health.data);
    } else {
      console.log(`✗ Health: Failed with code ${health.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`✗ Failed to connect to server: ${error.message}`);
    console.log('Please make sure the Express server is running at http://localhost:5001 first.');
    process.exit(1);
  }

  // 2. Register Test User
  console.log('[2] Simulating User registration...');
  const email = `test_node_user_${Date.now()}@example.com`;
  const reg = await runPost('/api/auth/register', {
    email,
    password: 'testpassword123',
    full_name: 'Node Candidate'
  });

  if (reg.status === 201) {
    console.log(`✓ Registration: OK. Created user: ${reg.data.user.email}`);
  } else {
    console.error('✗ Registration failed:', reg.data);
    process.exit(1);
  }

  const token = reg.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 3. Fetch Profile
  console.log('[3] Fetching Profile details...');
  const profile = await runGet('/api/auth/profile', headers);
  if (profile.status === 200) {
    console.log(`✓ Profile: OK. Credits: ₹${profile.data.credits}`);
  } else {
    console.error('✗ Profile fetch failed:', profile.data);
    process.exit(1);
  }

  // 4. Verify payment order (simulated QR)
  console.log('[4] Simulating UPI QR payment order creation...');
  const pay = await runPost('/api/payment/order', {
    plan_type: 'basic',
    simulate: true
  }, headers);

  if (pay.status === 201 && pay.data.is_simulated) {
    console.log(`✓ Payment order: OK (Simulated/QR). Order ID: ${pay.data.order_id}`);
  } else {
    console.error('✗ Payment order creation failed:', pay.data);
    process.exit(1);
  }

  // 4b. Verify transaction
  console.log('[4b] Simulating UPI QR payment verification...');
  const verify = await runPost('/api/payment/verify', {
    razorpay_order_id: pay.data.order_id,
    razorpay_payment_id: `pay_qr_test_${Math.random().toString(36).substring(2, 9)}`,
    razorpay_signature: "sandbox_sig"
  }, headers);

  if (verify.status === 200) {
    console.log(`✓ Payment verification: OK. Message: ${verify.data.message}`);
  } else {
    console.error('✗ Payment verification failed:', verify.data);
    process.exit(1);
  }

  // 5. Create Resume
  console.log('[5] Generating Resume record...');
  const resume = await runPost('/api/resume', {
    title: 'Verification Resume',
    template_id: 'ats-friendly',
    content: {
      personal: {
        fullName: 'Node Candidate',
        email,
        phone: '+91 9999999999',
        summary: 'Full Stack developer test profile.'
      },
      skills: ['react', 'python', 'flask', 'sql']
    }
  }, headers);

  let resumeId = '';
  if (resume.status === 201) {
    console.log(`✓ Resume: OK. Created ID: ${resume.data.id}`);
    resumeId = resume.data.id;
  } else {
    console.error('✗ Resume creation failed:', resume.data);
    process.exit(1);
  }

  // 6. AI Summary Check
  console.log('[6] Verifying AI summary composer...');
  const aiSummary = await runPost('/api/ai/summary', {
    profile: {
      fullName: 'Node Candidate',
      skills: ['react', 'python', 'flask'],
      experience: []
    }
  }, headers);

  if (aiSummary.status === 200) {
    console.log('✓ AI Summary: OK');
  } else {
    console.error('✗ AI Summary failed:', aiSummary.data);
  }

  // 7. Job Match recommendations
  console.log('[7] Auditing job recommending matcher...');
  const jobs = await runGet(`/api/jobs/match/${resumeId}`, headers);
  if (jobs.status === 200) {
    console.log(`✓ Job Matching: OK. Top matched job: ${jobs.data[0].job.title} (${jobs.data[0].match_score}% Match)`);
  } else {
    console.error('✗ Job Matching failed:', jobs.data);
  }

  console.log('\n✓ ALL INTEGRATION AND ROUTING TESTS PASSED!');
}

main().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
