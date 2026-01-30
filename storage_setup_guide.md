# Manual Storage Setup Guide (UI Method)

Since the SQL script is giving permission errors (likely due to role restrictions), you should set the permissions using the **Supabase Dashboard UI**. This is the safest way.

## Step 1: Create Bucket
1.  Go to **Storage** in your Supabase Dashboard.
2.  Click **"New Bucket"**.
3.  Name it: `avatars`
4.  **IMPORTANT**: Toggle **"Public Bucket"** to ON.
5.  Click Save.

## Step 2: Add Policies (Permissions)
1.  In the Storage view, click on the **Policies** tab (or "Configuration" -> "Policies").
2.  Find the `avatars` bucket under "Storage Policies".
3.  Click **"New Policy"** -> **"Get started quickly"** (templates).

### Policy A: Allow Viewing (Public)
1.  Choose template: **"Give people access to read any file in a bucket"** (SELECT).
2.  Ensure it applies to `avatars`.
3.  Click **Review** and **Save**.

### Policy B: Allow Uploading (Logged In Users)
1.  Click **"New Policy"** again -> **"For full customization"**.
2.  Name: `Authenticated Uploads`.
3.  Allowed Operation: Check **INSERT**.
4.  Target roles: check **Authenticated**.
5.  Click **Review** and **Save**.

## Step 3: Test
Go back to your localhost app, refresh, and try uploading your avatar again. It should work immediately!
