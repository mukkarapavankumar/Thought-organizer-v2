'use client'

import { Button } from '@/components/ui/button'
import { WindowsIcon } from '@/components/icons'
import { DOWNLOAD_URL } from '@/lib/constants'
import Link from 'next/link'

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Download Thought Organizer
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Download Instructions</h2>
          <div className="text-left space-y-4">
            <p>When you click the download button:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Google Drive will scan the file for viruses</li>
              <li>You'll see a message saying "Google Drive can't scan this file for viruses"</li>
              <li>Click "Download anyway" to proceed</li>
              <li>The file will begin downloading</li>
            </ol>
            <p className="text-sm text-gray-600">
              This is normal behavior for executable files hosted on Google Drive and ensures your safety.
            </p>
          </div>
          
          <Button size="lg" className="mt-6" asChild>
            <Link href={DOWNLOAD_URL} target="_blank" className="flex items-center gap-2">
              <WindowsIcon className="h-6 w-6" />
              Download for Windows (96MB)
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 