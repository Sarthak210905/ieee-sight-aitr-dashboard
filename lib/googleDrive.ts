import { google } from 'googleapis'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
})

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
})

export interface UploadFileParams {
  fileName: string
  mimeType: string
  fileBuffer: Buffer
  folderId?: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: string
  webViewLink: string
  webContentLink: string
  createdTime: string
}

class GoogleDriveService {
  /**
   * Upload a file to Google Drive
   */
  async uploadFile({ fileName, mimeType, fileBuffer, folderId }: UploadFileParams): Promise<DriveFile> {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType,
          parents: folderId ? [folderId] : undefined,
        },
        media: {
          mimeType: mimeType,
          body: require('stream').Readable.from(fileBuffer),
        },
        fields: 'id, name, mimeType, size, webViewLink, webContentLink, createdTime',
      })

      return response.data as DriveFile
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error)
      throw error
    }
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await drive.files.delete({
        fileId: fileId,
      })
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error)
      throw error
    }
  }

  /**
   * Get file metadata
   */
  async getFile(fileId: string): Promise<DriveFile> {
    try {
      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, webViewLink, webContentLink, createdTime',
      })

      return response.data as DriveFile
    } catch (error) {
      console.error('Error getting file from Google Drive:', error)
      throw error
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string): Promise<DriveFile[]> {
    try {
      const query = folderId ? `'${folderId}' in parents and trashed=false` : 'trashed=false'
      
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, createdTime)',
        orderBy: 'createdTime desc',
      })

      return (response.data.files || []) as DriveFile[]
    } catch (error) {
      console.error('Error listing files from Google Drive:', error)
      throw error
    }
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      )

      return Buffer.from(response.data as ArrayBuffer)
    } catch (error) {
      console.error('Error downloading file from Google Drive:', error)
      throw error
    }
  }
}

export const googleDriveService = new GoogleDriveService()
