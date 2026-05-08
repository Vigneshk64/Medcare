# Firebase Debugging Guide

## Current Configuration
- **Project ID**: `medcare-88ab2`
- **Auth Domain**: `medcare-88ab2.firebaseapp.com`
- **Storage Bucket**: `medcare-88ab2.firebasestorage.app`

## Common Issues & Solutions

### 1. Permission Denied Errors
**Cause**: Missing or incorrect Firestore security rules.

**Solution**: Deploy the security rules:
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only firestore:rules
```

### 2. Authentication Issues
**Check**: 
- User is properly authenticated
- Auth token contains role claims
- Email is verified

**Debug**: Check browser console for Firebase auth logs.

### 3. Project Configuration Issues
**Verify**: 
- Firebase project exists at `medcare-88ab2`
- Firestore is enabled in the project
- Web app is configured with correct API key

## Security Rules Summary

The `firestore.rules` file provides:
- ✅ Users can read/write their own documents
- ✅ Admins have full access
- ✅ Doctors can manage prescriptions
- ✅ Pharmacists can process orders
- ✅ Patients can view their data

## Testing Steps

1. **Check Firebase Connection**:
   - Open browser console
   - Look for Firebase project ID logs
   - Verify authentication state

2. **Test Firestore Access**:
   - Click "Test Firestore Access" button in FirebaseTest component
   - Check for permission errors in console

3. **Verify User Roles**:
   - Ensure users have role claims in auth token
   - Check Firebase Auth custom claims

## Emergency Fix (Temporary)

If you need immediate access, use these permissive rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Next Steps

1. Deploy the security rules
2. Test authentication flow
3. Verify user roles in Firebase Auth
4. Check Firestore database structure
