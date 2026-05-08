#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deploying Firebase Security Rules...');
console.log('📁 Project ID: medcare-88ab2');

try {
  // Check if firebase CLI is installed
  execSync('firebase --version', { stdio: 'inherit' });
  
  // Deploy firestore rules
  console.log('📋 Deploying Firestore security rules...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  
  console.log('✅ Firebase security rules deployed successfully!');
  
} catch (error) {
  console.error('❌ Error deploying Firebase rules:', error.message);
  console.log('\n📝 Manual deployment instructions:');
  console.log('1. Install Firebase CLI: npm install -g firebase-tools');
  console.log('2. Login to Firebase: firebase login');
  console.log('3. Deploy rules: firebase deploy --only firestore:rules');
  console.log('4. Or deploy via Firebase Console → Firestore → Rules tab');
}
