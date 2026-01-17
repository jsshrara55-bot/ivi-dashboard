"""
Generate realistic sample data based on the Data Dictionary
This script creates sample data for:
- Members (subscribers)
- Claims
- Pre-authorizations
- Call center interactions
- Providers
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json

np.random.seed(42)
random.seed(42)

# Load Provider Info
providers_df = pd.read_excel('/home/ubuntu/upload/Provider_Info(2).xlsx')
print(f"Loaded {len(providers_df)} providers")

# Generate Corporate Clients (25 companies)
corporate_clients = []
company_names = [
    "Saudi Aramco", "SABIC", "STC", "Al Rajhi Bank", "Saudi Airlines",
    "ACWA Power", "Ma'aden", "Almarai", "Jarir Bookstore", "Mobily",
    "Zain KSA", "Bank AlJazira", "Riyad Bank", "SNB", "SABB",
    "Elm Company", "Tasnee", "Yanbu Cement", "Saudi Electricity", "Sadara",
    "Petro Rabigh", "Saudi Kayan", "Sipchem", "Advanced Petrochemical", "Sahara Petrochemical"
]

sectors = ["Energy", "Banking", "Telecom", "Retail", "Manufacturing", "Technology", "Healthcare", "Transport"]
regions = ["Central", "Western", "Eastern", "Northern", "Southern"]
networks = ["NWM", "NW1", "NW2", "NW3", "NW4", "NW5", "NW6", "NW7"]

for i, name in enumerate(company_names):
    corporate_clients.append({
        "CONT_NO": f"CONT{2024}{str(i+1).zfill(4)}",
        "COMPANY_NAME": name,
        "SECTOR": random.choice(sectors),
        "REGION": random.choice(regions),
        "NETWORK": random.choice(networks),
        "EMPLOYEE_COUNT": random.randint(500, 15000),
        "CONTRACT_START": datetime(2024, 1, 1) + timedelta(days=random.randint(0, 180)),
        "CONTRACT_END": datetime(2025, 12, 31),
        "PREMIUM_AMOUNT": random.randint(5000000, 50000000)
    })

corporate_df = pd.DataFrame(corporate_clients)

# Generate Members (employees) - 500 members across companies
members = []
member_id = 1000

for _, company in corporate_df.iterrows():
    num_members = random.randint(50, 200)
    for j in range(num_members):
        age = random.randint(22, 65)
        gender = random.choice(["M", "F"])
        
        # Chronic conditions based on age
        has_chronic = random.random() < (0.1 + (age - 22) * 0.01)
        chronic_conditions = []
        if has_chronic:
            conditions = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Obesity"]
            chronic_conditions = random.sample(conditions, k=random.randint(1, 2))
        
        members.append({
            "MBR_NO": f"MBR{str(member_id).zfill(8)}",
            "CONT_NO": company["CONT_NO"],
            "COMPANY_NAME": company["COMPANY_NAME"],
            "GENDER": gender,
            "AGE": age,
            "MARITAL_STATUS": random.choice(["S", "M", "D", "W"]),
            "NATIONALITY": random.choice(["SA", "SA", "SA", "EG", "PK", "IN", "PH", "JO"]),
            "CITY": random.choice(["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah", "Khobar"]),
            "PLAN_NETWORK": company["NETWORK"],
            "HAS_CHRONIC": has_chronic,
            "CHRONIC_CONDITIONS": ", ".join(chronic_conditions) if chronic_conditions else None,
            "ENROLLMENT_DATE": company["CONTRACT_START"] + timedelta(days=random.randint(0, 30)),
            "STATUS": random.choices(["Active", "Suspended", "Terminated"], weights=[0.95, 0.03, 0.02])[0]
        })
        member_id += 1

members_df = pd.DataFrame(members)
print(f"Generated {len(members_df)} members")

# ICD-10 Codes for diagnoses
icd_codes = [
    ("A09", "Infectious gastroenteritis and colitis"),
    ("E11", "Type 2 diabetes mellitus"),
    ("I10", "Essential hypertension"),
    ("J06", "Acute upper respiratory infections"),
    ("J18", "Pneumonia"),
    ("K21", "Gastro-esophageal reflux disease"),
    ("M54", "Dorsalgia (back pain)"),
    ("N39", "Urinary tract infection"),
    ("R10", "Abdominal and pelvic pain"),
    ("Z00", "General examination"),
    ("E66", "Obesity"),
    ("J45", "Asthma"),
    ("I25", "Chronic ischemic heart disease"),
    ("F32", "Depressive episode"),
    ("K29", "Gastritis and duodenitis")
]

# Benefit codes
benefit_codes = [
    ("CON", "Consultation"),
    ("LAB", "Laboratory"),
    ("RAD", "Radiology"),
    ("PHR", "Pharmacy"),
    ("DEN", "Dental"),
    ("OPT", "Optical"),
    ("MAT", "Maternity"),
    ("INP", "Inpatient"),
    ("OUP", "Outpatient"),
    ("EMR", "Emergency"),
    ("PHY", "Physiotherapy"),
    ("PSY", "Psychiatric")
]

# Generate Claims
claims = []
claim_id = 100000

for _, member in members_df.iterrows():
    # Number of claims based on age and chronic status
    base_claims = 3 if member["HAS_CHRONIC"] else 1
    num_claims = random.randint(base_claims, base_claims + 5)
    
    for _ in range(num_claims):
        provider = providers_df.sample(1).iloc[0]
        icd = random.choice(icd_codes)
        benefit = random.choice(benefit_codes)
        
        claim_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 365))
        
        # Claim amount based on benefit type
        amount_ranges = {
            "CON": (100, 500),
            "LAB": (200, 2000),
            "RAD": (500, 5000),
            "PHR": (50, 3000),
            "DEN": (200, 5000),
            "OPT": (100, 2000),
            "MAT": (5000, 50000),
            "INP": (10000, 200000),
            "OUP": (100, 5000),
            "EMR": (500, 20000),
            "PHY": (200, 3000),
            "PSY": (300, 2000)
        }
        
        amount_range = amount_ranges.get(benefit[0], (100, 1000))
        claimed_amount = random.randint(*amount_range)
        
        # Approval logic
        status = random.choices(
            ["Approved", "Rejected", "Pending", "Partially Approved"],
            weights=[0.75, 0.10, 0.05, 0.10]
        )[0]
        
        approved_amount = claimed_amount if status == "Approved" else (
            0 if status == "Rejected" else (
                claimed_amount * random.uniform(0.5, 0.9) if status == "Partially Approved" else claimed_amount
            )
        )
        
        rejection_reason = None
        if status == "Rejected":
            rejection_reason = random.choice([
                "Not covered under plan",
                "Pre-authorization required",
                "Duplicate claim",
                "Exceeded annual limit",
                "Provider not in network"
            ])
        
        claims.append({
            "CLAIM_ID": f"CLM{str(claim_id).zfill(10)}",
            "MBR_NO": member["MBR_NO"],
            "CONT_NO": member["CONT_NO"],
            "COMPANY_NAME": member["COMPANY_NAME"],
            "PROV_CODE": provider["PROV_CODE"],
            "PROV_NAME": provider["PROV_NAME"],
            "PROVIDER_PRACTICE": provider["PROVIDER_PRACTICE"],
            "PROVIDER_REGION": provider["PROVIDER_REGION"],
            "CLAIM_DATE": claim_date,
            "ICD_CODE": icd[0],
            "DIAGNOSIS": icd[1],
            "BENEFIT_CODE": benefit[0],
            "BENEFIT_DESC": benefit[1],
            "CLAIMED_AMOUNT": claimed_amount,
            "APPROVED_AMOUNT": approved_amount,
            "STATUS": status,
            "REJECTION_REASON": rejection_reason,
            "PROCESSING_DAYS": random.randint(1, 14)
        })
        claim_id += 1

claims_df = pd.DataFrame(claims)
print(f"Generated {len(claims_df)} claims")

# Generate Pre-Authorizations
preauths = []
preauth_id = 50000

# Sensitive medications requiring pre-auth
sensitive_meds = [
    ("Ozempic", "Obesity", 5000),
    ("Wegovy", "Obesity", 6000),
    ("Humira", "Biological", 15000),
    ("Enbrel", "Biological", 12000),
    ("Remicade", "Biological", 20000),
    ("Growth Hormone", "Hormone", 8000),
    ("Infant Formula", "Pediatric", 500),
    ("Insulin Pump", "Diabetes", 25000)
]

for _, member in members_df.sample(frac=0.3).iterrows():
    med = random.choice(sensitive_meds)
    provider = providers_df.sample(1).iloc[0]
    
    request_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 365))
    
    # Documents submitted
    docs_required = ["Medical Report", "Lab Results", "BMI Certificate", "Prescription"]
    docs_submitted = random.sample(docs_required, k=random.randint(1, 4))
    docs_complete = len(docs_submitted) >= 3
    
    status = "Approved" if docs_complete and random.random() > 0.3 else (
        "Rejected" if not docs_complete else random.choice(["Approved", "Rejected", "Pending"])
    )
    
    preauths.append({
        "PREAUTH_ID": f"PA{str(preauth_id).zfill(8)}",
        "MBR_NO": member["MBR_NO"],
        "CONT_NO": member["CONT_NO"],
        "COMPANY_NAME": member["COMPANY_NAME"],
        "PROV_CODE": provider["PROV_CODE"],
        "PROV_NAME": provider["PROV_NAME"],
        "MEDICATION_NAME": med[0],
        "MEDICATION_CATEGORY": med[1],
        "ESTIMATED_COST": med[2],
        "REQUEST_DATE": request_date,
        "DOCS_SUBMITTED": ", ".join(docs_submitted),
        "DOCS_COMPLETE": docs_complete,
        "STATUS": status,
        "DECISION_DATE": request_date + timedelta(days=random.randint(1, 7)) if status != "Pending" else None,
        "REJECTION_REASON": random.choice([
            "Incomplete documentation",
            "Does not meet clinical criteria",
            "Alternative treatment available",
            "Exceeded coverage limit"
        ]) if status == "Rejected" else None
    })
    preauth_id += 1

preauths_df = pd.DataFrame(preauths)
print(f"Generated {len(preauths_df)} pre-authorizations")

# Generate Call Center Interactions
calls = []
call_id = 200000

call_categories = [
    ("AC", "Request", "Claim inquiry"),
    ("AP", "Complaint", "Claim rejection"),
    ("MT", "Request", "Medical inquiry"),
    ("AR", "Request", "Authorization status"),
    ("BC", "Request", "Benefits inquiry"),
    ("BP", "Complaint", "Benefits dispute"),
    ("PR", "Request", "Provider search"),
    ("XC", "Request", "Card replacement"),
    ("XP", "Complaint", "Card issue"),
    ("VP", "Request", "Verification")
]

for _, member in members_df.sample(frac=0.4).iterrows():
    num_calls = random.randint(1, 5)
    
    for _ in range(num_calls):
        cat = random.choice(call_categories)
        call_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 365))
        
        status = random.choices(["CLOSED", "OPENED", "WIP"], weights=[0.8, 0.1, 0.1])[0]
        
        calls.append({
            "CALL_ID": f"CALL{str(call_id).zfill(10)}",
            "MBR_NO": member["MBR_NO"],
            "CONT_NO": member["CONT_NO"],
            "COMPANY_NAME": member["COMPANY_NAME"],
            "CALL_CAT": cat[0],
            "CALL_TYPE": cat[1],
            "CALL_REASON": cat[2],
            "CRT_DATE": call_date,
            "UPD_DATE": call_date + timedelta(days=random.randint(0, 3)) if status != "OPENED" else None,
            "STATUS": status,
            "RESOLUTION_TIME_HOURS": random.randint(1, 72) if status == "CLOSED" else None,
            "SATISFACTION_SCORE": random.randint(1, 5) if status == "CLOSED" and random.random() > 0.3 else None
        })
        call_id += 1

calls_df = pd.DataFrame(calls)
print(f"Generated {len(calls_df)} call center interactions")

# Calculate IVI Scores for each company
ivi_scores = []

for _, company in corporate_df.iterrows():
    cont_no = company["CONT_NO"]
    
    # Get company data
    company_members = members_df[members_df["CONT_NO"] == cont_no]
    company_claims = claims_df[claims_df["CONT_NO"] == cont_no]
    company_preauths = preauths_df[preauths_df["CONT_NO"] == cont_no]
    company_calls = calls_df[calls_df["CONT_NO"] == cont_no]
    
    # Health Score (H) - 35%
    chronic_rate = company_members["HAS_CHRONIC"].mean() * 100 if len(company_members) > 0 else 0
    avg_claims_per_member = len(company_claims) / len(company_members) if len(company_members) > 0 else 0
    high_cost_claims = (company_claims["CLAIMED_AMOUNT"] > 10000).sum() / len(company_claims) * 100 if len(company_claims) > 0 else 0
    
    h_score = max(0, min(100, 100 - chronic_rate - (avg_claims_per_member * 5) - (high_cost_claims * 0.5)))
    
    # Experience Score (E) - 35%
    complaints = company_calls[company_calls["CALL_TYPE"] == "Complaint"]
    complaint_rate = len(complaints) / len(company_members) * 100 if len(company_members) > 0 else 0
    avg_satisfaction = company_calls["SATISFACTION_SCORE"].mean() if company_calls["SATISFACTION_SCORE"].notna().any() else 3
    rejection_rate = (company_claims["STATUS"] == "Rejected").sum() / len(company_claims) * 100 if len(company_claims) > 0 else 0
    preauth_approval = (company_preauths["STATUS"] == "Approved").sum() / len(company_preauths) * 100 if len(company_preauths) > 0 else 50
    
    e_score = max(0, min(100, (avg_satisfaction * 20) - complaint_rate * 2 - rejection_rate + (preauth_approval * 0.3)))
    
    # Utilization Score (U) - 30%
    total_claimed = company_claims["CLAIMED_AMOUNT"].sum()
    total_approved = company_claims["APPROVED_AMOUNT"].sum()
    loss_ratio = (total_approved / company["PREMIUM_AMOUNT"]) * 100 if company["PREMIUM_AMOUNT"] > 0 else 100
    
    u_score = max(0, min(100, 100 - (loss_ratio - 70) * 2))  # Target loss ratio ~70%
    
    # Overall IVI Score
    ivi_score = (h_score * 0.35) + (e_score * 0.35) + (u_score * 0.30)
    
    # Risk Category
    if ivi_score >= 70:
        risk_category = "Low"
    elif ivi_score >= 50:
        risk_category = "Medium"
    else:
        risk_category = "High"
    
    ivi_scores.append({
        "CONT_NO": cont_no,
        "COMPANY_NAME": company["COMPANY_NAME"],
        "SECTOR": company["SECTOR"],
        "REGION": company["REGION"],
        "EMPLOYEE_COUNT": len(company_members),
        "TOTAL_CLAIMS": len(company_claims),
        "TOTAL_CLAIMED": total_claimed,
        "TOTAL_APPROVED": total_approved,
        "H_SCORE": round(h_score, 2),
        "E_SCORE": round(e_score, 2),
        "U_SCORE": round(u_score, 2),
        "IVI_SCORE": round(ivi_score, 2),
        "RISK_CATEGORY": risk_category,
        "CHRONIC_RATE": round(chronic_rate, 2),
        "COMPLAINT_RATE": round(complaint_rate, 2),
        "REJECTION_RATE": round(rejection_rate, 2),
        "LOSS_RATIO": round(loss_ratio, 2)
    })

ivi_scores_df = pd.DataFrame(ivi_scores)
print(f"Calculated IVI scores for {len(ivi_scores_df)} companies")

# Save all data
output_dir = "/home/ubuntu/ivi-dashboard/client/public/data"
import os
os.makedirs(output_dir, exist_ok=True)

# Save as CSV
corporate_df.to_csv(f"{output_dir}/corporate_clients.csv", index=False)
members_df.to_csv(f"{output_dir}/members.csv", index=False)
claims_df.to_csv(f"{output_dir}/claims.csv", index=False)
preauths_df.to_csv(f"{output_dir}/preauthorizations.csv", index=False)
calls_df.to_csv(f"{output_dir}/calls.csv", index=False)
providers_df.to_csv(f"{output_dir}/providers.csv", index=False)
ivi_scores_df.to_csv(f"{output_dir}/ivi_scores.csv", index=False)

# Save as JSON for easier frontend consumption
corporate_df.to_json(f"{output_dir}/corporate_clients.json", orient="records", date_format="iso")
members_df.to_json(f"{output_dir}/members.json", orient="records", date_format="iso")
claims_df.to_json(f"{output_dir}/claims.json", orient="records", date_format="iso")
preauths_df.to_json(f"{output_dir}/preauthorizations.json", orient="records", date_format="iso")
calls_df.to_json(f"{output_dir}/calls.json", orient="records", date_format="iso")
providers_df.to_json(f"{output_dir}/providers.json", orient="records")
ivi_scores_df.to_json(f"{output_dir}/ivi_scores.json", orient="records")

# Create summary statistics
summary = {
    "total_companies": len(corporate_df),
    "total_members": len(members_df),
    "total_claims": len(claims_df),
    "total_preauths": len(preauths_df),
    "total_calls": len(calls_df),
    "total_providers": len(providers_df),
    "avg_ivi_score": round(ivi_scores_df["IVI_SCORE"].mean(), 2),
    "risk_distribution": ivi_scores_df["RISK_CATEGORY"].value_counts().to_dict(),
    "total_claimed_amount": int(claims_df["CLAIMED_AMOUNT"].sum()),
    "total_approved_amount": int(claims_df["APPROVED_AMOUNT"].sum()),
    "claim_approval_rate": round((claims_df["STATUS"] == "Approved").mean() * 100, 2),
    "preauth_approval_rate": round((preauths_df["STATUS"] == "Approved").mean() * 100, 2),
    "avg_satisfaction": round(calls_df["SATISFACTION_SCORE"].mean(), 2),
    "generated_at": datetime.now().isoformat()
}

with open(f"{output_dir}/summary.json", "w") as f:
    json.dump(summary, f, indent=2)

print("\n" + "=" * 60)
print("DATA GENERATION COMPLETE")
print("=" * 60)
print(f"Output directory: {output_dir}")
print(f"\nSummary:")
for key, value in summary.items():
    print(f"  {key}: {value}")

# Create Power BI compatible Excel file
with pd.ExcelWriter(f"{output_dir}/IVI_PowerBI_Data.xlsx", engine='openpyxl') as writer:
    corporate_df.to_excel(writer, sheet_name='Corporate_Clients', index=False)
    members_df.to_excel(writer, sheet_name='Members', index=False)
    claims_df.to_excel(writer, sheet_name='Claims', index=False)
    preauths_df.to_excel(writer, sheet_name='PreAuthorizations', index=False)
    calls_df.to_excel(writer, sheet_name='Calls', index=False)
    providers_df.to_excel(writer, sheet_name='Providers', index=False)
    ivi_scores_df.to_excel(writer, sheet_name='IVI_Scores', index=False)

print(f"\nPower BI Excel file created: {output_dir}/IVI_PowerBI_Data.xlsx")
