import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV files from public/data directory
const dataDir = path.join(__dirname, '..', 'client', 'public', 'data');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

async function loadData() {
  console.log('Loading data from CSV files...');
  
  // Load IVI Scores
  const iviScoresPath = path.join(dataDir, 'ivi_scores.csv');
  const iviScoresContent = fs.readFileSync(iviScoresPath, 'utf-8');
  const iviScores = parseCSV(iviScoresContent);
  console.log(`Loaded ${iviScores.length} IVI scores`);
  
  // Load Future Predictions
  const predictionsPath = path.join(dataDir, 'future_predictions.csv');
  const predictionsContent = fs.readFileSync(predictionsPath, 'utf-8');
  const predictions = parseCSV(predictionsContent);
  console.log(`Loaded ${predictions.length} predictions`);
  
  // Load Recommendations
  const recommendationsPath = path.join(dataDir, 'recommendations.csv');
  const recommendationsContent = fs.readFileSync(recommendationsPath, 'utf-8');
  const recommendations = parseCSV(recommendationsContent);
  console.log(`Loaded ${recommendations.length} recommendations`);
  
  // Load Feature Importance
  const featureImportancePath = path.join(dataDir, 'feature_importance.csv');
  const featureImportanceContent = fs.readFileSync(featureImportancePath, 'utf-8');
  const featureImportance = parseCSV(featureImportanceContent);
  console.log(`Loaded ${featureImportance.length} feature importance records`);
  
  // Generate sample corporate clients from IVI scores
  const corporateClients = iviScores.map((score, idx) => ({
    contNo: score.CONT_NO || `CONT${String(idx + 1).padStart(5, '0')}`,
    companyName: score.Company_Name || `Company ${idx + 1}`,
    sector: ['Healthcare', 'Technology', 'Finance', 'Manufacturing', 'Retail'][idx % 5],
    region: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'][idx % 5],
    employeeCount: Math.floor(Math.random() * 5000) + 100,
    policyStartDate: new Date(2024, 0, 1).toISOString(),
    policyEndDate: new Date(2025, 11, 31).toISOString(),
    premiumAmount: Math.floor(Math.random() * 5000000) + 500000,
    isActive: true,
  }));
  
  // Generate sample members
  const members = [];
  corporateClients.forEach((client, clientIdx) => {
    const memberCount = Math.min(client.employeeCount, 50); // Limit to 50 per company for demo
    for (let i = 0; i < memberCount; i++) {
      members.push({
        mbrNo: `MBR${String(clientIdx * 100 + i + 1).padStart(8, '0')}`,
        contNo: client.contNo,
        firstName: `Employee${i + 1}`,
        lastName: `Family${clientIdx + 1}`,
        dateOfBirth: new Date(1970 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        gender: Math.random() > 0.5 ? 'M' : 'F',
        relationshipType: i === 0 ? 'Principal' : ['Spouse', 'Child', 'Parent'][Math.floor(Math.random() * 3)],
        policyClass: ['VIP', 'A', 'B', 'C'][Math.floor(Math.random() * 4)],
        isActive: true,
      });
    }
  });
  
  // Generate sample claims
  const claims = [];
  const claimStatuses = ['Approved', 'Rejected', 'Pending', 'Under Review'];
  const benefitCodes = ['CONS', 'PHARM', 'LAB', 'RAD', 'HOSP', 'DENT', 'OPT'];
  
  members.slice(0, 500).forEach((member, idx) => {
    const claimCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < claimCount; i++) {
      const claimedAmount = Math.floor(Math.random() * 10000) + 100;
      const status = claimStatuses[Math.floor(Math.random() * claimStatuses.length)];
      claims.push({
        claimNo: `CLM${String(idx * 10 + i + 1).padStart(10, '0')}`,
        mbrNo: member.mbrNo,
        contNo: member.contNo,
        provCode: `PROV${String(Math.floor(Math.random() * 100) + 1).padStart(5, '0')}`,
        claimDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        serviceDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        benefitCode: benefitCodes[Math.floor(Math.random() * benefitCodes.length)],
        diagnosisCode: `ICD${Math.floor(Math.random() * 1000)}`,
        claimedAmount: claimedAmount,
        approvedAmount: status === 'Approved' ? claimedAmount * (0.7 + Math.random() * 0.3) : 0,
        status: status,
        processingDays: Math.floor(Math.random() * 14) + 1,
      });
    }
  });
  
  // Generate sample calls
  const calls = [];
  const callTypes = ['Inquiry', 'Complaint', 'Request', 'Feedback'];
  const callCategories = ['Claims', 'Coverage', 'Network', 'Billing', 'General'];
  
  members.slice(0, 200).forEach((member, idx) => {
    const callCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < callCount; i++) {
      calls.push({
        callId: `CALL${String(idx * 10 + i + 1).padStart(10, '0')}`,
        mbrNo: member.mbrNo,
        contNo: member.contNo,
        callDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        callType: callTypes[Math.floor(Math.random() * callTypes.length)],
        callCategory: callCategories[Math.floor(Math.random() * callCategories.length)],
        durationSeconds: Math.floor(Math.random() * 600) + 60,
        satisfactionScore: Math.floor(Math.random() * 5) + 1,
        resolved: Math.random() > 0.2,
        agentId: `AGT${String(Math.floor(Math.random() * 50) + 1).padStart(4, '0')}`,
      });
    }
  });
  
  // Generate sample providers
  const providers = [];
  const providerTypes = ['Hospital', 'Clinic', 'Pharmacy', 'Lab', 'Dental'];
  const networks = ['Premium', 'Standard', 'Basic'];
  const regions = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'];
  
  for (let i = 0; i < 100; i++) {
    providers.push({
      provCode: `PROV${String(i + 1).padStart(5, '0')}`,
      providerName: `Healthcare Provider ${i + 1}`,
      providerType: providerTypes[Math.floor(Math.random() * providerTypes.length)],
      network: networks[Math.floor(Math.random() * networks.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      city: regions[Math.floor(Math.random() * regions.length)],
      address: `Street ${i + 1}, Building ${Math.floor(Math.random() * 100) + 1}`,
      phone: `+966${Math.floor(Math.random() * 1000000000)}`,
      isActive: true,
    });
  }
  
  // Generate sample insurance pre-authorizations
  const insurancePreAuths = [];
  const preAuthStatuses = ['Approved', 'Rejected', 'Pending'];
  
  members.slice(0, 300).forEach((member, idx) => {
    if (Math.random() > 0.7) {
      const estimatedCost = Math.floor(Math.random() * 50000) + 1000;
      const status = preAuthStatuses[Math.floor(Math.random() * preAuthStatuses.length)];
      insurancePreAuths.push({
        preAuthNo: `PA${String(idx + 1).padStart(10, '0')}`,
        mbrNo: member.mbrNo,
        contNo: member.contNo,
        provCode: `PROV${String(Math.floor(Math.random() * 100) + 1).padStart(5, '0')}`,
        requestDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        serviceType: ['Surgery', 'Hospitalization', 'Medication', 'Procedure'][Math.floor(Math.random() * 4)],
        diagnosisCode: `ICD${Math.floor(Math.random() * 1000)}`,
        estimatedCost: estimatedCost,
        approvedAmount: status === 'Approved' ? estimatedCost * (0.8 + Math.random() * 0.2) : 0,
        status: status,
        validUntil: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      });
    }
  });
  
  // Generate IVI scores for database
  const iviScoresForDb = iviScores.map((score, idx) => ({
    contNo: score.CONT_NO || `CONT${String(idx + 1).padStart(5, '0')}`,
    companyName: score.Company_Name || `Company ${idx + 1}`,
    hScore: parseFloat(score.H_score) || Math.random() * 100,
    eScore: parseFloat(score.E_score) || Math.random() * 100,
    uScore: parseFloat(score.U_score) || Math.random() * 100,
    iviScore: parseFloat(score.IVI_Score) || Math.random() * 100,
    riskCategory: score.Risk_Category || ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    calculatedAt: new Date().toISOString(),
  }));
  
  // Output JSON for API consumption
  const output = {
    corporateClients,
    members: members.slice(0, 1000), // Limit for demo
    providers,
    claims: claims.slice(0, 2000), // Limit for demo
    insurancePreAuths,
    calls: calls.slice(0, 500), // Limit for demo
    iviScores: iviScoresForDb,
  };
  
  // Save to JSON file
  const outputPath = path.join(__dirname, '..', 'client', 'public', 'data', 'seed_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSeed data saved to ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`- Corporate Clients: ${corporateClients.length}`);
  console.log(`- Members: ${output.members.length}`);
  console.log(`- Providers: ${providers.length}`);
  console.log(`- Claims: ${output.claims.length}`);
  console.log(`- Insurance Pre-Auths: ${insurancePreAuths.length}`);
  console.log(`- Calls: ${output.calls.length}`);
  console.log(`- IVI Scores: ${iviScoresForDb.length}`);
}

loadData().catch(console.error);
