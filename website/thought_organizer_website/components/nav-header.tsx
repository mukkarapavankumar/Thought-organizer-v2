'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LightbulbIcon as BulbOutlined } from 'lucide-react'
import { motion } from 'framer-motion'

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
      <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 w-full">
        <nav className="flex items-center justify-between w-full max-w-[2000px] mx-auto">
          <Link href="/" className="flex items-center space-x-3">
            <BulbOutlined className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold">Thought Organizer</span>
          </Link>
          <div className="flex items-center gap-8">
            <Button variant="default" size="lg" className="text-lg font-medium">Download Now</Button>
          </div>
        </nav>
      </div>
    </motion.header>
  )
}

