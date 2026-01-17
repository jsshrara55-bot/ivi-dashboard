import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Helper function to convert undefined to null
const n = (val) => val === undefined ? null : val;

async function main() {
  console.log('Connecting to database...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Loading seed data...');
  const seedDataPath = path.join(__dirname, '../client/public/data/seed_data.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
  
  console.log(`Found ${seedData.corporateClients.length} corporate clients`);
  console.log(`Found ${seedData.members.length} members`);
  console.log(`Found ${seedData.providers.length} providers`);
  console.log(`Found ${seedData.claims.length} claims`);
  console.log(`Found ${seedData.insurancePreAuths.length} pre-auths`);
  console.log(`Found ${seedData.calls.length} calls`);
  console.log(`Found ${seedData.iviScores.length} IVI scores`);
  
  // Clear existing data
  console.log('\nClearing existing data...');
  await connection.execute('DELETE FROM ivi_scores');
  await connection.execute('DELETE FROM call_center_calls');
  await connection.execute('DELETE FROM insurance_pre_auths');
  await connection.execute('DELETE FROM claims');
  await connection.execute('DELETE FROM members');
  await connection.execute('DELETE FROM providers');
  await connection.execute('DELETE FROM corporate_clients');
  
  // Insert corporate clients
  console.log('Inserting corporate clients...');
  const clientValues = seedData.corporateClients.map(client => [
    n(client.contNo), n(client.companyName), n(client.sector), n(client.region), 
    n(client.employeeCount) || 0, 
    client.policyStartDate ? client.policyStartDate.split('T')[0] : null, 
    client.policyEndDate ? client.policyEndDate.split('T')[0] : null, 
    n(client.premiumAmount) || 0, client.isActive !== false
  ]);
  await connection.query(
    `INSERT INTO corporate_clients (contNo, companyName, sector, region, employeeCount, contractStart, contractEnd, premiumAmount, isActive) VALUES ?`,
    [clientValues]
  );
  console.log(`✓ Inserted ${seedData.corporateClients.length} corporate clients`);
  
  // Insert members in batches
  console.log('Inserting members...');
  const memberValues = seedData.members.map(member => [
    n(member.mbrNo), n(member.contNo), n(member.gender), n(member.age) || 30, 
    n(member.nationality) || 'Saudi', n(member.city) || 'Riyadh', 
    member.isActive !== false ? 'Active' : 'Suspended'
  ]);
  const memberBatchSize = 500;
  for (let i = 0; i < memberValues.length; i += memberBatchSize) {
    const batch = memberValues.slice(i, i + memberBatchSize);
    await connection.query(
      `INSERT INTO members (mbrNo, contNo, gender, age, nationality, city, memberStatus) VALUES ?`,
      [batch]
    );
    console.log(`  Inserted ${Math.min(i + memberBatchSize, memberValues.length)}/${memberValues.length} members`);
  }
  console.log(`✓ Inserted ${seedData.members.length} members`);
  
  // Insert providers
  console.log('Inserting providers...');
  const providerValues = seedData.providers.map(provider => [
    n(provider.provCode), n(provider.providerName), n(provider.network) || 'VIP', 
    n(provider.providerType), n(provider.region), n(provider.city), provider.isActive !== false
  ]);
  await connection.query(
    `INSERT INTO providers (provCode, provName, providerNetwork, providerPractice, providerRegion, providerTown, isActive) VALUES ?`,
    [providerValues]
  );
  console.log(`✓ Inserted ${seedData.providers.length} providers`);
  
  // Insert claims in batches
  console.log('Inserting claims...');
  const claimValues = seedData.claims.map(claim => {
    let status = 'Pending';
    if (claim.status === 'Approved' || claim.status === 'approved') status = 'Approved';
    else if (claim.status === 'Rejected' || claim.status === 'rejected') status = 'Rejected';
    else if (claim.status === 'Partially Approved' || claim.status === 'partial') status = 'Partially Approved';
    
    return [
      n(claim.claimNo), n(claim.mbrNo), n(claim.contNo), n(claim.provCode), 
      claim.serviceDate ? claim.serviceDate.split('T')[0] : (claim.claimDate ? claim.claimDate.split('T')[0] : null), 
      n(claim.diagnosisCode), n(claim.claimedAmount) || 0, n(claim.approvedAmount) || 0, 
      status, n(claim.rejectionReason)
    ];
  });
  const claimBatchSize = 500;
  for (let i = 0; i < claimValues.length; i += claimBatchSize) {
    const batch = claimValues.slice(i, i + claimBatchSize);
    await connection.query(
      `INSERT INTO claims (claimId, mbrNo, contNo, provCode, claimDate, icdCode, claimedAmount, approvedAmount, claimStatus, rejectionReason) VALUES ?`,
      [batch]
    );
    console.log(`  Inserted ${Math.min(i + claimBatchSize, claimValues.length)}/${claimValues.length} claims`);
  }
  console.log(`✓ Inserted ${seedData.claims.length} claims`);
  
  // Insert pre-auths
  console.log('Inserting pre-authorizations...');
  const preAuthValues = seedData.insurancePreAuths.map(preAuth => {
    let status = 'Pending';
    if (preAuth.status === 'Approved' || preAuth.status === 'approved') status = 'Approved';
    else if (preAuth.status === 'Rejected' || preAuth.status === 'rejected') status = 'Rejected';
    
    return [
      n(preAuth.preAuthNo), n(preAuth.mbrNo), n(preAuth.contNo), n(preAuth.provCode), 
      n(preAuth.serviceType), n(preAuth.estimatedCost) || 0, 
      preAuth.requestDate ? preAuth.requestDate.split('T')[0] : null, 
      status, 
      preAuth.decisionDate ? preAuth.decisionDate.split('T')[0] : null, 
      n(preAuth.rejectionReason)
    ];
  });
  await connection.query(
    `INSERT INTO insurance_pre_auths (preauthId, mbrNo, contNo, provCode, medicationCategory, estimatedCost, requestDate, preauthStatus, decisionDate, rejectionReason) VALUES ?`,
    [preAuthValues]
  );
  console.log(`✓ Inserted ${seedData.insurancePreAuths.length} pre-authorizations`);
  
  // Insert calls
  console.log('Inserting calls...');
  const callValues = seedData.calls.map(call => {
    let status = 'CLOSED';
    if (call.resolved === false) status = 'OPENED';
    
    return [
      n(call.callId), n(call.mbrNo), n(call.contNo), n(call.callType), 
      call.callDate ? new Date(call.callDate) : null, 
      status, 0, n(call.satisfactionScore) || 0
    ];
  });
  await connection.query(
    `INSERT INTO call_center_calls (callId, mbrNo, contNo, callType, crtDate, callStatus, resolutionTimeHours, satisfactionScore) VALUES ?`,
    [callValues]
  );
  console.log(`✓ Inserted ${seedData.calls.length} calls`);
  
  // Insert IVI scores
  console.log('Inserting IVI scores...');
  const iviValues = seedData.iviScores.map(score => {
    let riskCategory = 'Medium';
    if (score.riskCategory === 'High' || score.riskCategory === 'high') riskCategory = 'High';
    else if (score.riskCategory === 'Low' || score.riskCategory === 'low') riskCategory = 'Low';
    
    return [
      n(score.contNo), n(score.companyName), null, null, null, null, null, null,
      n(score.hScore) || 0, n(score.eScore) || 0, n(score.uScore) || 0, 
      n(score.iviScore) || 0, riskCategory
    ];
  });
  await connection.query(
    `INSERT INTO ivi_scores (contNo, companyName, sector, region, employeeCount, totalClaims, totalClaimed, totalApproved, hScore, eScore, uScore, iviScore, riskCategory) VALUES ?`,
    [iviValues]
  );
  console.log(`✓ Inserted ${seedData.iviScores.length} IVI scores`);
  
  console.log('\n✅ All data loaded successfully!');
  
  // Verify data
  console.log('\nVerifying data...');
  const [clients] = await connection.execute('SELECT COUNT(*) as count FROM corporate_clients');
  const [membersCount] = await connection.execute('SELECT COUNT(*) as count FROM members');
  const [providersCount] = await connection.execute('SELECT COUNT(*) as count FROM providers');
  const [claimsCount] = await connection.execute('SELECT COUNT(*) as count FROM claims');
  const [preauths] = await connection.execute('SELECT COUNT(*) as count FROM insurance_pre_auths');
  const [calls] = await connection.execute('SELECT COUNT(*) as count FROM call_center_calls');
  const [ivi] = await connection.execute('SELECT COUNT(*) as count FROM ivi_scores');
  
  console.log(`Corporate Clients: ${clients[0].count}`);
  console.log(`Members: ${membersCount[0].count}`);
  console.log(`Providers: ${providersCount[0].count}`);
  console.log(`Claims: ${claimsCount[0].count}`);
  console.log(`Pre-Authorizations: ${preauths[0].count}`);
  console.log(`Calls: ${calls[0].count}`);
  console.log(`IVI Scores: ${ivi[0].count}`);
  
  await connection.end();
}

main().catch(console.error);
