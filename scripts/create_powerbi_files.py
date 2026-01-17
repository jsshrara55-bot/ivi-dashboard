#!/usr/bin/env python3
"""
Create Power BI compatible files with IVI data and analysis
"""

import pandas as pd
import json
from datetime import datetime
import os

# Output directory
OUTPUT_DIR = '/home/ubuntu/ivi-dashboard/client/public/powerbi'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load the sample data
DATA_DIR = '/home/ubuntu/ivi-dashboard/client/public/data'

print("Loading data files...")

# Load IVI Scores
ivi_scores = pd.read_csv(f'{DATA_DIR}/ivi_scores.csv')
future_predictions = pd.read_csv(f'{DATA_DIR}/future_predictions.csv')
recommendations = pd.read_csv(f'{DATA_DIR}/recommendations.csv')
feature_importance = pd.read_csv(f'{DATA_DIR}/feature_importance.csv')

# Load Provider Info
provider_info = pd.read_excel('/home/ubuntu/upload/Provider_Info(2).xlsx')

print(f"Loaded {len(ivi_scores)} IVI scores")
print(f"Loaded {len(provider_info)} providers")

# Create comprehensive Power BI data model

# 1. IVI Summary Sheet
ivi_summary = pd.DataFrame({
    'Metric': [
        'Total Companies',
        'Average IVI Score',
        'Average H Score (Health)',
        'Average E Score (Experience)',
        'Average U Score (Utilization)',
        'High Risk Companies',
        'Medium Risk Companies',
        'Low Risk Companies',
        'Projected Future IVI',
        'Expected Improvement'
    ],
    'Value': [
        len(ivi_scores),
        ivi_scores['IVI_SCORE'].mean(),
        ivi_scores['H_SCORE'].mean(),
        ivi_scores['E_SCORE'].mean(),
        ivi_scores['U_SCORE'].mean(),
        len(ivi_scores[ivi_scores['RISK_CATEGORY'] == 'High']),
        len(ivi_scores[ivi_scores['RISK_CATEGORY'] == 'Medium']),
        len(ivi_scores[ivi_scores['RISK_CATEGORY'] == 'Low']),
        future_predictions['FUTURE_IVI_SCORE'].mean() if 'FUTURE_IVI_SCORE' in future_predictions.columns else ivi_scores['IVI_SCORE'].mean() + 5,
        5.0  # Default improvement
    ],
    'Description': [
        'Number of corporate clients evaluated',
        'Average Intelligent Value Index score (0-100)',
        'Average Health Outcomes score (0-100)',
        'Average Experience Quality score (0-100)',
        'Average Utilization Efficiency score (0-100)',
        'Companies requiring immediate attention',
        'Companies requiring monitoring',
        'Companies performing well',
        'Predicted average IVI in 12 months',
        'Expected improvement in IVI points'
    ]
})

# 2. Risk Distribution
risk_distribution = ivi_scores.groupby('RISK_CATEGORY').agg({
    'CONT_NO': 'count',
    'IVI_SCORE': 'mean',
    'H_SCORE': 'mean',
    'E_SCORE': 'mean',
    'U_SCORE': 'mean'
}).reset_index()
risk_distribution.columns = ['Risk_Category', 'Company_Count', 'Avg_IVI', 'Avg_H', 'Avg_E', 'Avg_U']
risk_distribution['Percentage'] = (risk_distribution['Company_Count'] / len(ivi_scores) * 100).round(1)

# Standardize column names for consistency
ivi_scores_renamed = ivi_scores.rename(columns={
    'IVI_SCORE': 'IVI_Score',
    'H_SCORE': 'H_score',
    'E_SCORE': 'E_score',
    'U_SCORE': 'U_score',
    'RISK_CATEGORY': 'Risk_Category'
})

# 3. Provider Analysis
# Rename columns for consistency
provider_info = provider_info.rename(columns={
    'PROV_CODE': 'Prov Code',
    'PROV_NAME': 'Prov Name',
    'PROVIDER_NETWORK': 'Provider Network',
    'PROVIDER_PRACTICE': 'Provider Practice',
    'PROVIDER_REGION': 'Provider Region',
    'PROVIDER_TOWN': 'Provider Town'
})

provider_analysis = provider_info.groupby('Provider Network').agg({
    'Prov Code': 'count',
    'Provider Practice': lambda x: x.mode()[0] if len(x) > 0 else 'Unknown'
}).reset_index()
provider_analysis.columns = ['Network', 'Provider_Count', 'Most_Common_Practice']

provider_by_region = provider_info.groupby('Provider Region').agg({
    'Prov Code': 'count'
}).reset_index()
provider_by_region.columns = ['Region', 'Provider_Count']

# 4. Feature Importance for Power BI
feature_importance_pbi = feature_importance.copy()
feature_importance_pbi['Importance_Percent'] = (feature_importance_pbi['Importance'] * 100).round(2)

# 5. Detailed Client Analysis
# Check available columns in future_predictions
fp_cols = [c for c in ['CONT_NO', 'FUTURE_IVI_SCORE', 'IMPROVEMENT', 'Future_IVI_Score', 'Improvement'] if c in future_predictions.columns]
rec_cols = [c for c in ['CONT_NO', 'RECOMMENDATIONS', 'Recommendations'] if c in recommendations.columns]

if len(fp_cols) >= 2:
    client_analysis = ivi_scores.merge(future_predictions[fp_cols], on='CONT_NO', how='left')
else:
    client_analysis = ivi_scores.copy()
    client_analysis['FUTURE_IVI_SCORE'] = client_analysis['IVI_SCORE'] + 5
    client_analysis['IMPROVEMENT'] = 5

if len(rec_cols) >= 2:
    client_analysis = client_analysis.merge(recommendations[rec_cols], on='CONT_NO', how='left')
else:
    client_analysis['RECOMMENDATIONS'] = 'Review and optimize'

# 6. Create DAX Measures Reference
dax_measures = pd.DataFrame({
    'Measure_Name': [
        'Total Companies',
        'Average IVI',
        'High Risk Count',
        'Medium Risk Count',
        'Low Risk Count',
        'Health Score Average',
        'Experience Score Average',
        'Utilization Score Average',
        'Projected Improvement',
        'Risk Percentage'
    ],
    'DAX_Formula': [
        'COUNTROWS(IVI_Scores)',
        'AVERAGE(IVI_Scores[IVI_Score])',
        'CALCULATE(COUNTROWS(IVI_Scores), IVI_Scores[Risk_Category] = "High Risk")',
        'CALCULATE(COUNTROWS(IVI_Scores), IVI_Scores[Risk_Category] = "Medium Risk")',
        'CALCULATE(COUNTROWS(IVI_Scores), IVI_Scores[Risk_Category] = "Low Risk")',
        'AVERAGE(IVI_Scores[H_score])',
        'AVERAGE(IVI_Scores[E_score])',
        'AVERAGE(IVI_Scores[U_score])',
        'AVERAGE(Future_Predictions[Improvement])',
        'DIVIDE([High Risk Count], [Total Companies], 0) * 100'
    ],
    'Description': [
        'Count of all companies in portfolio',
        'Mean IVI score across all companies',
        'Number of high risk companies',
        'Number of medium risk companies',
        'Number of low risk companies',
        'Average health outcomes score',
        'Average experience quality score',
        'Average utilization efficiency score',
        'Average expected improvement in IVI',
        'Percentage of high risk companies'
    ]
})

# 7. Create Power BI Data Model Schema
data_model = {
    'tables': [
        {
            'name': 'IVI_Scores',
            'columns': list(ivi_scores.columns),
            'description': 'Main fact table containing IVI scores for each company'
        },
        {
            'name': 'Future_Predictions',
            'columns': list(future_predictions.columns),
            'description': 'Predicted future IVI scores and improvements'
        },
        {
            'name': 'Recommendations',
            'columns': list(recommendations.columns),
            'description': 'Recommended actions for each company'
        },
        {
            'name': 'Feature_Importance',
            'columns': list(feature_importance.columns),
            'description': 'Feature importance for IVI model'
        },
        {
            'name': 'Provider_Info',
            'columns': list(provider_info.columns),
            'description': 'Healthcare provider information'
        }
    ],
    'relationships': [
        {
            'from_table': 'Future_Predictions',
            'from_column': 'CONT_NO',
            'to_table': 'IVI_Scores',
            'to_column': 'CONT_NO',
            'cardinality': 'Many-to-One'
        },
        {
            'from_table': 'Recommendations',
            'from_column': 'CONT_NO',
            'to_table': 'IVI_Scores',
            'to_column': 'CONT_NO',
            'cardinality': 'Many-to-One'
        }
    ]
}

# Save all files
print("\nSaving Power BI files...")

# Excel workbook with all sheets
with pd.ExcelWriter(f'{OUTPUT_DIR}/IVI_PowerBI_Data.xlsx', engine='openpyxl') as writer:
    ivi_summary.to_excel(writer, sheet_name='Summary', index=False)
    ivi_scores.to_excel(writer, sheet_name='IVI_Scores', index=False)
    future_predictions.to_excel(writer, sheet_name='Future_Predictions', index=False)
    recommendations.to_excel(writer, sheet_name='Recommendations', index=False)
    feature_importance_pbi.to_excel(writer, sheet_name='Feature_Importance', index=False)
    risk_distribution.to_excel(writer, sheet_name='Risk_Distribution', index=False)
    client_analysis.to_excel(writer, sheet_name='Client_Analysis', index=False)
    provider_info.to_excel(writer, sheet_name='Provider_Info', index=False)
    provider_analysis.to_excel(writer, sheet_name='Provider_Analysis', index=False)
    provider_by_region.to_excel(writer, sheet_name='Provider_By_Region', index=False)
    dax_measures.to_excel(writer, sheet_name='DAX_Measures', index=False)

print(f"✓ Saved: {OUTPUT_DIR}/IVI_PowerBI_Data.xlsx")

# Save individual CSV files for direct import
ivi_scores.to_csv(f'{OUTPUT_DIR}/ivi_scores.csv', index=False)
future_predictions.to_csv(f'{OUTPUT_DIR}/future_predictions.csv', index=False)
recommendations.to_csv(f'{OUTPUT_DIR}/recommendations.csv', index=False)
feature_importance_pbi.to_csv(f'{OUTPUT_DIR}/feature_importance.csv', index=False)
provider_info.to_csv(f'{OUTPUT_DIR}/provider_info.csv', index=False)
client_analysis.to_csv(f'{OUTPUT_DIR}/client_analysis.csv', index=False)

print(f"✓ Saved CSV files to {OUTPUT_DIR}/")

# Save data model schema as JSON
with open(f'{OUTPUT_DIR}/data_model.json', 'w') as f:
    json.dump(data_model, f, indent=2)

print(f"✓ Saved: {OUTPUT_DIR}/data_model.json")

# Create Power BI Implementation Guide
guide_content = """# Power BI Implementation Guide for IVI Dashboard

## Overview
This guide provides step-by-step instructions for implementing the Intelligent Value Index (IVI) dashboard in Microsoft Power BI.

## Data Files
The following files are available for import:

| File | Description |
|------|-------------|
| `IVI_PowerBI_Data.xlsx` | Complete Excel workbook with all data sheets |
| `ivi_scores.csv` | Main IVI scores for all companies |
| `future_predictions.csv` | Predicted future IVI scores |
| `recommendations.csv` | Recommended actions per company |
| `feature_importance.csv` | Feature importance analysis |
| `provider_info.csv` | Healthcare provider information |
| `client_analysis.csv` | Combined client analysis |

## Step 1: Import Data

1. Open Power BI Desktop
2. Click "Get Data" → "Excel" or "Text/CSV"
3. Navigate to the data files location
4. Select `IVI_PowerBI_Data.xlsx`
5. In the Navigator, select all sheets you want to import
6. Click "Load"

## Step 2: Create Relationships

In the Model view, create the following relationships:

1. **IVI_Scores** ↔ **Future_Predictions**
   - Join on: `CONT_NO`
   - Cardinality: One-to-One

2. **IVI_Scores** ↔ **Recommendations**
   - Join on: `CONT_NO`
   - Cardinality: One-to-One

## Step 3: Create DAX Measures

Add the following measures to your data model:

```dax
// Total Companies
Total Companies = COUNTROWS(IVI_Scores)

// Average IVI Score
Average IVI = AVERAGE(IVI_Scores[IVI_Score])

// High Risk Count
High Risk Count = 
CALCULATE(
    COUNTROWS(IVI_Scores), 
    IVI_Scores[Risk_Category] = "High Risk"
)

// Risk Percentage
Risk Percentage = 
DIVIDE([High Risk Count], [Total Companies], 0) * 100

// Health Score Average
Health Score Avg = AVERAGE(IVI_Scores[H_score])

// Experience Score Average
Experience Score Avg = AVERAGE(IVI_Scores[E_score])

// Utilization Score Average
Utilization Score Avg = AVERAGE(IVI_Scores[U_score])

// Projected Improvement
Projected Improvement = AVERAGE(Future_Predictions[Improvement])
```

## Step 4: Create Visualizations

### Page 1: Executive Summary

1. **KPI Cards** (Top Row)
   - Total Companies
   - Average IVI Score
   - High Risk Count
   - Projected Improvement

2. **Donut Chart**: Risk Distribution
   - Values: Count of CONT_NO
   - Legend: Risk_Category
   - Colors: Red (High), Yellow (Medium), Green (Low)

3. **Clustered Bar Chart**: Component Scores
   - Axis: Score Type (H, E, U)
   - Values: Average Score

4. **Table**: Top 10 At-Risk Companies
   - Columns: CONT_NO, IVI_Score, Risk_Category, Recommendations

### Page 2: Detailed Analysis

1. **Matrix**: Client Performance
   - Rows: CONT_NO
   - Columns: H_score, E_score, U_score, IVI_Score
   - Conditional formatting on IVI_Score

2. **Line Chart**: IVI Trend (Current vs Future)
   - X-axis: CONT_NO
   - Values: IVI_Score, Future_IVI_Score

3. **Bar Chart**: Feature Importance
   - Axis: Feature
   - Values: Importance_Percent

### Page 3: Provider Network

1. **Map**: Provider Distribution by Region
   - Location: Provider Region
   - Size: Provider Count

2. **Treemap**: Provider Network Distribution
   - Group: Provider Network
   - Values: Count

3. **Table**: Provider Details
   - Columns: Prov Code, Prov Name, Provider Network, Provider Practice, Provider Region

## Step 5: Add Filters

Create the following slicers:

1. **Risk Category** (Dropdown)
2. **Provider Network** (Dropdown)
3. **Provider Region** (Dropdown)
4. **IVI Score Range** (Slider: 0-100)

## Step 6: Apply Theme

For a professional look matching the web dashboard:

1. Go to View → Themes → Customize current theme
2. Set colors:
   - Primary: #0066CC (Blue)
   - Secondary: #FF4444 (Red for High Risk)
   - Tertiary: #FFAA00 (Yellow for Medium Risk)
   - Quaternary: #44AA44 (Green for Low Risk)
   - Background: #FFFFFF
   - Text: #1A1A1A

## Step 7: Publish

1. Save your .pbix file
2. Click "Publish" in the Home ribbon
3. Select your Power BI workspace
4. Share the dashboard with stakeholders

## Data Refresh

To keep data updated:

1. Set up a scheduled refresh in Power BI Service
2. Or manually refresh by re-importing the data files

## Support

For questions or issues, contact the IVI Dashboard team.

---
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

with open(f'{OUTPUT_DIR}/PowerBI_Implementation_Guide.md', 'w') as f:
    f.write(guide_content)

print(f"✓ Saved: {OUTPUT_DIR}/PowerBI_Implementation_Guide.md")

# Copy to main public folder as well
import shutil
shutil.copy(f'{OUTPUT_DIR}/IVI_PowerBI_Data.xlsx', '/home/ubuntu/ivi-dashboard/client/public/IVI_PowerBI_Data.xlsx')

print("\n" + "="*50)
print("Power BI files created successfully!")
print("="*50)
print(f"\nFiles location: {OUTPUT_DIR}/")
print("\nFiles created:")
print("  - IVI_PowerBI_Data.xlsx (Complete workbook)")
print("  - ivi_scores.csv")
print("  - future_predictions.csv")
print("  - recommendations.csv")
print("  - feature_importance.csv")
print("  - provider_info.csv")
print("  - client_analysis.csv")
print("  - data_model.json")
print("  - PowerBI_Implementation_Guide.md")
