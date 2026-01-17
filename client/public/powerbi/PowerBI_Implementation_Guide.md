# Power BI Implementation Guide for IVI Dashboard

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
