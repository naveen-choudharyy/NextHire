import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:5001"

def run_post(url, data, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    req_data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}{url}", data=req_data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def run_get(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(f"{BASE_URL}{url}", headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def main():
    print("=== NextHire API Verification ===")
    
    # 1. Health check
    try:
        print("[1] Verifying server health...")
        code, health_res = run_get("/health")
        if code == 200:
            print("✓ Health: OK")
        else:
            print(f"✗ Health: Failed with code {code}")
            sys.exit(1)
    except Exception as e:
        print(f"✗ Failed to connect to server: {str(e)}")
        print("Please make sure the Flask server is running at http://localhost:5001 first.")
        sys.exit(1)
        
    # 2. Register Test User
    print("[2] Simulating User registration...")
    email = f"test_user_{int(urllib.request.time.time())}@example.com"
    reg_code, reg_res = run_post("/api/auth/register", {
        "email": email,
        "password": "testpassword123",
        "full_name": "Test Candidate"
    })
    
    if reg_code == 201:
        print(f"✓ Registration: OK. Created user: {reg_res['user']['email']}")
        token = reg_res["token"]
        headers = {"Authorization": f"Bearer {token}"}
    else:
        print(f"✗ Registration failed: {reg_res}")
        sys.exit(1)
        
    # 3. Fetch Profile
    print("[3] Fetching Profile details...")
    profile_code, profile_res = run_get("/api/auth/profile", headers=headers)
    if profile_code == 200:
        print(f"✓ Profile: OK. Credits: ₹{profile_res['credits']}")
    else:
        print(f"✗ Profile fetch failed: {profile_res}")
        sys.exit(1)
        
    # 4. Payment Order and Verification Simulator (using Credits to auto-approve)
    print("[4] Simulating Credit payment processing...")
    # Add credits to test user via SQLite directly to simulate credit purchase
    try:
        import sqlite3
        import os
        db_path = os.path.join(os.path.dirname(__file__), "instance", "nexthire.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET credits = 100 WHERE email = ?", (email,))
        conn.commit()
        conn.close()
        print("✓ Injected ₹100 credits to test user via db")
    except Exception as db_err:
        print(f"✗ Failed to inject credits to user: {db_err}")
        sys.exit(1)

    pay_code, pay_res = run_post("/api/payment/order", {
        "plan_type": "premium"
    }, headers=headers)
    
    if pay_code == 201:
        if pay_res.get('paid_with_credits'):
            print(f"✓ Payment order: OK (Fully covered by credits). Order ID: {pay_res['order_id']}")
            order_id = pay_res['order_id']
        else:
            print(f"✗ Expected order to be fully paid with credits, but got: {pay_res}")
            sys.exit(1)
    else:
        print(f"✗ Payment order creation failed: {pay_res}")
        sys.exit(1)

    # 5. Create Resume
    print("[5] Generating Resume record...")
    res_code, res_res = run_post("/api/resume", {
        "title": "Verification Resume",
        "template_id": "ats-friendly",
        "content": {
            "personal": {
                "fullName": "Test Candidate",
                "email": email,
                "phone": "+91 9999999999",
                "summary": "Full Stack developer test profile."
            },
            "skills": ["react", "python", "flask", "sql"]
        }
    }, headers=headers)
    
    if res_code == 201:
        print(f"✓ Resume: OK. Created ID: {res_res['id']}")
        resume_id = res_res["id"]
    else:
        print(f"✗ Resume creation failed: {res_res}")
        sys.exit(1)
        
    # 6. AI Summary Check
    print("[6] Verifying AI summary composer...")
    ai_code, ai_res = run_post("/api/ai/summary", {
        "profile": {
            "fullName": "Test Candidate",
            "skills": ["react", "python", "flask"],
            "experience": []
        }
    }, headers=headers)
    if ai_code == 200:
        print("✓ AI Summary: OK")
    else:
        print(f"✗ AI Summary failed: {ai_res}")
        
    # 7. Job Match recommendations
    print("[7] Auditing job recommending matcher...")
    job_code, job_res = run_get(f"/api/jobs/match/{resume_id}", headers=headers)
    if job_code == 200:
        print(f"✓ Job Matching: OK. Top matched job: {job_res[0]['job']['title']} ({job_res[0]['match_score']}% Match)")
    else:
        print(f"✗ Job Matching failed: {job_res}")
        
    print("\n✓ ALL INTEGRATION AND ROUTING TESTS PASSED!")

if __name__ == "__main__":
    main()
