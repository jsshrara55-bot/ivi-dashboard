# IVI Dashboard - User Guide (English)

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Key Features](#key-features)
5. [How to Edit and Customize](#how-to-edit-and-customize)
6. [PDF Export Guide](#pdf-export-guide)
7. [Technical Requirements](#technical-requirements)

---

## Introduction

The **Intelligent Value Index (IVI) Dashboard** is a comprehensive analytics platform designed for insurance companies to evaluate corporate clients based on three key pillars:
- **Health Outcomes (H)** - Member health status and preventive care
- **Experience Quality (E)** - Customer service and satisfaction
- **Cost Sustainability (U)** - Utilization efficiency and cost management

### IVI Formula
```
IVI = (H × 0.35) + (E × 0.30) + (U × 0.35)
```

### Risk Categories
| IVI Score | Category | Color |
|-----------|----------|-------|
| 70-100 | Low Risk | Green |
| 35-69 | Medium Risk | Yellow |
| 0-34 | High Risk | Red |

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Extract the ZIP file**
   ```bash
   unzip ivi-dashboard.zip
   cd ivi-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

---

## Dashboard Overview

### Main Navigation
The sidebar contains all main sections:

| Section | Description |
|---------|-------------|
| Dashboard | Executive overview with KPIs and predictions |
| Clients | List of all corporate clients |
| Analytics | Detailed analytics and charts |
| Predictions | IVI forecasting and trends |
| Smart Pre-Auth | Pre-authorization analysis |
| Scenarios | Create and compare IVI scenarios |
| ROI Calculator | Calculate return on investment |
| Category Analysis | Compare SME vs Key Account vs Providers |
| Presentation | Generate PDF reports for committee |
| Before/After | Compare impact of recommendations |

### Language Toggle
Click the globe icon (🌐) in the header to switch between Arabic and English.

---

## Key Features

### 1. IVI Predictions KPIs
Located on the main dashboard, showing:
- Expected IVI improvement over 12 months
- Risk category transition forecasts
- Companies likely to improve/decline
- Early warning indicators

### 2. Smart Alerts
Real-time notifications when companies approach risk thresholds:
- Upgrade alerts (approaching higher IVI)
- Downgrade alerts (approaching lower IVI)

### 3. Scenario Management
Create custom scenarios by adjusting H, E, U parameters:
- Save scenarios for comparison
- View linked recommendations
- Export scenario reports

### 4. ROI Calculator
Calculate expected return on investment:
- Input: Company, adjustments, timeline, premium
- Output: Cost estimation, savings projection, ROI metrics

### 5. Category Analysis
Compare performance across company types:
- SME (Small & Medium Enterprises)
- Key Accounts (Large corporations)
- Healthcare Providers

### 6. Nordic Philosophy Integration
Innovative concepts inspired by Scandinavian culture:
- **Lagom** - Smart utilization (not too much, not too little)
- **Hygge** - Comfort and ease in customer experience
- **Friluftsliv** - Proactive and preventive care

---

## How to Edit and Customize

### Project Structure
```
ivi-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and translations
│   │   └── contexts/      # React contexts (Language, Theme)
├── server/                 # Backend API
│   ├── routers.ts         # tRPC API routes
│   └── db.ts              # Database queries
├── drizzle/               # Database schema
└── shared/                # Shared types and constants
```

### Editing Translations
File: `client/src/lib/translations.ts`

```typescript
// Add new translation key
export const translations = {
  en: {
    myNewKey: "English text",
  },
  ar: {
    myNewKey: "النص العربي",
  }
};
```

### Adding a New Page
1. Create file in `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add sidebar link in `client/src/components/DashboardLayout.tsx`

### Modifying IVI Formula
File: `client/src/pages/Dashboard.tsx`

```typescript
// Current formula weights
const H_WEIGHT = 0.35;
const E_WEIGHT = 0.30;
const U_WEIGHT = 0.35;

// Calculate IVI
const ivi = (h * H_WEIGHT) + (e * E_WEIGHT) + (u * U_WEIGHT);
```

### Customizing Charts
Charts use Recharts library. Example:
```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={data}>
  <Line dataKey="ivi" stroke="#10b981" />
  <XAxis dataKey="month" />
  <YAxis />
</LineChart>
```

---

## PDF Export Guide

### Method 1: Quick Export (Any Page)
1. Navigate to any dashboard page
2. Click the **PDF** button in the top-right
3. The browser will open print dialog
4. Select "Save as PDF" as destination
5. Click Save

### Method 2: Detailed Report Page
1. Go to **PDF Report** from sidebar
2. Select sections to include:
   - Executive Summary
   - Risk Analysis
   - Predictions
   - Recommendations
   - Evaluation Criteria
3. Click **Generate PDF Report**
4. Save the generated PDF

### Method 3: Presentation Report
1. Go to **Presentation** from sidebar
2. Select sections for committee presentation:
   - Project Overview
   - Nordic Philosophy
   - Innovative Ideas
   - Executive Summary Quote
   - Key Metrics
3. Click **Export Presentation PDF**

### PDF Export Tips
- Use Chrome or Edge for best PDF quality
- Set page size to A4 or Letter
- Enable "Background graphics" for colored charts
- Use landscape orientation for wide charts

---

## Technical Requirements

### Minimum Requirements
- Node.js 18.0+
- 4GB RAM
- 1GB disk space
- Modern browser with JavaScript enabled

### Recommended
- Node.js 20.0+
- 8GB RAM
- SSD storage
- Chrome or Firefox latest version

### Database
- MySQL 8.0+ or TiDB
- Connection via DATABASE_URL environment variable

### Environment Variables
```env
DATABASE_URL=mysql://user:pass@host:port/database
JWT_SECRET=your-secret-key
VITE_APP_TITLE=IVI Dashboard
```

---

## Support

For technical support or questions:
- Review the code comments
- Check the todo.md file for feature status
- Refer to the README.md for additional documentation

---

*Last updated: January 2026*
