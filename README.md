## Environment Setup

### Firebase Configuration

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com) and create a new project.

2. **Enable Services**: Enable Firestore, Authentication, Storage, and Analytics in your Firebase project.

3. **Generate Service Account Key**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file and place it outside your project directory (e.g., `../firebase-keys/service-account.json`)
   - **NEVER commit this file to version control**

4. **Environment Variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration values
   - Set `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` to the absolute path of your service account JSON file
   - Example:
     ```
     FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/service-account.json
     FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
     ```

5. **Security Notes**:
   - `.env.local` is ignored by git and should never be committed
   - Service account keys grant full access to your Firebase project
   - Keep service account files outside your project directory
   - Rotate keys regularly and revoke unused ones

### Running the Application

```bash
npm install
npm run dev
