# Supabase Storage Setup for Medical Documents

## Overview
The Medical Documents module now supports real file upload, download, and storage using Supabase Storage.

## Required Setup

### 1. Create Storage Bucket

In your Supabase project dashboard:

1. Navigate to **Storage** in the left sidebar
2. Click **New bucket**
3. Create a bucket with these settings:
   - **Name**: `medical-documents`
   - **Public**: Unchecked (private bucket for sensitive medical files)
   - **Allowed MIME types**: Leave empty or specify:
     - `application/pdf`
     - `image/jpeg`, `image/jpg`, `image/png`, `image/gif`
     - `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `text/plain`
   - **File size limit**: `10485760` (10MB)

### 2. Configure Bucket Policies

Set up Row Level Security (RLS) policies for the bucket:

#### Policy 1: Allow authenticated users to upload to their own folder
```sql
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Allow authenticated users to read their own files
```sql
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Allow authenticated users to delete their own files
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Environment Variables

Ensure these environment variables are set in your Supabase Edge Function:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (has full access)

## Features Implemented

### File Upload
- **Endpoint**: `POST /make-server-50d6a062/documents/upload`
- **Max file size**: 10MB
- **Supported formats**: PDF, Word docs, images (JPG, PNG, GIF), text files
- **Storage path**: `{user_id}/{uuid}.{extension}`
- **Validation**: File type and size validation on server-side

### File Download
- **Endpoint**: `GET /make-server-50d6a062/documents/:id/download`
- **Returns**: Signed URL valid for 60 seconds
- **Security**: Only file owner can download

### File Deletion
- **Endpoint**: `DELETE /make-server-50d6a062/documents/:id`
- **Behavior**: Deletes both database record and file from storage
- **Error handling**: Continues even if storage deletion fails

## UI Components

### Upload Interface
- File input with drag-and-drop support
- File size and type validation
- Upload progress indicator
- File preview showing name and size

### Download Interface
- Download button in document list (green icon)
- Download button in document view dialog
- Only shows for documents with attached files

### Visual Indicators
- Upload icon: Indicates file upload capability
- Download icon: Green color, shows file can be downloaded
- File size display: Shows in KB
- File name display: Shows original filename

## Security Considerations

1. **Private Storage**: All files stored in private bucket
2. **User Isolation**: Users can only access their own files via folder structure
3. **Signed URLs**: Downloads use temporary signed URLs (60s expiration)
4. **Service Role**: Backend uses service role key to bypass RLS for admin operations
5. **Validation**: File type and size validated before upload

## Testing Checklist

- [ ] Create storage bucket `medical-documents`
- [ ] Add RLS policies for the bucket
- [ ] Upload a PDF file
- [ ] Upload an image file
- [ ] Download a file
- [ ] Delete a document with attached file
- [ ] Verify file is removed from storage
- [ ] Try uploading file > 10MB (should fail)
- [ ] Try uploading unsupported file type (should fail)

## Data Model

### MedicalDocument Interface
```typescript
interface MedicalDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  provider: string;
  fileReference: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // File storage fields
  storagePath?: string;      // Path in Supabase Storage
  fileName?: string;          // Original filename
  fileSize?: number;          // Size in bytes
  fileType?: string;          // MIME type
  publicUrl?: string;         // Public URL (not used for private files)
}
```

## Troubleshooting

### Upload fails with "Failed to upload file"
- Check that bucket `medical-documents` exists
- Verify service role key is set correctly
- Check file size is under 10MB
- Verify file type is in allowed list

### Download fails with "Failed to generate download link"
- Check RLS policies are set correctly
- Verify storagePath exists in document record
- Check that file wasn't manually deleted from storage

### "Unauthorized" errors
- Verify Authorization header includes valid access token
- Check token hasn't expired
- Ensure user is authenticated

## Future Enhancements

- [ ] Virus scanning for uploaded files
- [ ] Image thumbnail generation
- [ ] PDF preview in browser
- [ ] Batch file upload
- [ ] File versioning
- [ ] Encrypted storage for extra security
- [ ] OCR for scanned documents
- [ ] File sharing between patient and provider
