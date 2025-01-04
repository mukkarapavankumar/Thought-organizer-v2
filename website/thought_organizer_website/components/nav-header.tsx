'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LightbulbIcon as BulbOutlined } from 'lucide-react'
import { motion } from 'framer-motion'
import { WindowsIcon } from '@/components/icons'
import { BASE_PATH, getDownloadPageUrl } from '@/lib/constants'

export function NavHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 10)
    })
  }

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 w-full">
        <nav className="flex items-center justify-between w-full max-w-[2000px] mx-auto">
          <Link href={BASE_PATH} className="flex items-center space-x-2">
            <BulbOutlined className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Thought Organizer</span>
          </Link>
          <div className="flex items-center gap-6">
            <Button variant="default" size="default" className="text-base font-medium" asChild>
              <Link href={getDownloadPageUrl()} className="flex items-center gap-2">
                <WindowsIcon className="h-5 w-5" />
                Download Now
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </motion.header>
  )
}

