import urllib.request
import urllib.error
import json
import time

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

def run_put(url, data, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    req_data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}{url}", data=req_data, headers=headers, method="PUT")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def run_delete(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(f"{BASE_URL}{url}", headers=headers, method="DELETE")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def main():
    print("=== Testing Resume Limit & Self-Contained Name Lock ===")
    
    # 1. Register a test user with name "Original Name"
    email = f"abuse_test_{int(time.time())}@example.com"
    print(f"\n[1] Registering user: {email} with name 'Original Name'")
    code, res = run_post("/api/auth/register", {
        "email": email,
        "password": "testpassword123",
        "full_name": "Original Name"
    })
    assert code == 201, f"Failed registration: {res}"
    token = res["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Registered successfully.")

    # 2. Create the first resume (initial empty name in DB)
    print("\n[2] Creating first resume (should succeed)")
    code, res = run_post("/api/resume", {
        "title": "Resume 1",
        "template_id": "ats-friendly"
    }, headers=headers)
    assert code == 201, f"Failed creating resume: {res}"
    resume_id = res["id"]
    print(f"✓ Created first resume successfully. ID: {resume_id}")

    # 3. Save first resume with name 'Alice Smith' (different from profile 'Original Name')
    print("\n[3] Saving first resume with name 'Alice Smith' (different from profile name)")
    code, res = run_put(f"/api/resume/{resume_id}", {
        "content": {
            "personal": {
                "fullName": "Alice Smith"
            }
        }
    }, headers=headers)
    assert code == 200, f"Failed setting initial resume name: {res}"
    print("✓ Set resume name successfully. (Allowed to be different from profile name)")

    # 4. Attempt to update resume name to 'Bob Jones' (should be blocked)
    print("\n[4] Attempting to update resume name to 'Bob Jones' (should be blocked since name is now locked)")
    code, res = run_put(f"/api/resume/{resume_id}", {
        "content": {
            "personal": {
                "fullName": "Bob Jones"
            }
        }
    }, headers=headers)
    print(f"Response code: {code}, body: {res}")
    assert code == 400, "Should have blocked resume name change."
    assert "cannot change the name" in res["error"], f"Unexpected error: {res['error']}"
    print("✓ Resume renaming successfully blocked by backend.")

    # 5. Attempt to update name to something case/space insensitive matching 'alicesmith' (should succeed)
    print("\n[5] Attempting to update resume name to '  alice  smith  ' (should succeed due to insensitive matching)")
    code, res = run_put(f"/api/resume/{resume_id}", {
        "content": {
            "personal": {
                "fullName": "  alice  smith  "
            }
        }
    }, headers=headers)
    print(f"Response code: {code}, body: {res}")
    assert code == 200, f"Should have allowed insensitive rename match: {res}"
    print("✓ Insensitive rename check validated and approved successfully.")

    # 6. Attempt to delete the free resume slot (should be blocked since name is configured)
    print("\n[6] Attempting to delete free resume slot (should be blocked to prevent delete-and-recreate abuse)")
    code, res = run_delete(f"/api/resume/{resume_id}", headers=headers)
    print(f"Response code: {code}, body: {res}")
    assert code == 400, "Should have blocked delete of saved free resume."
    assert "cannot delete your free resume slot" in res["error"], f"Unexpected error: {res['error']}"
    print("✓ Deletion of active free resume slot successfully blocked.")

    # 7. Attempt to create a second resume (should exceed limit of 1)
    print("\n[7] Attempting to create a second resume (should exceed limit of 1)")
    code, res = run_post("/api/resume", {
        "title": "Resume 2",
        "template_id": "ats-friendly"
    }, headers=headers)
    print(f"Response code: {code}, body: {res}")
    assert code == 402, "Should have blocked second resume creation (402 Payment Required)."
    print("✓ Second resume creation successfully blocked (402 Payment Required).")

    print("\n✓ ALL ABUSE AND SECURITY LIMIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
