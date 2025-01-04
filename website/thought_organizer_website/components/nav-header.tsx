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
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BulbOutlined className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Thought Organizer</span>
          </Link>
          <Button variant="default">Download Now</Button>
        </nav>
      </div>
    </motion.header>
  )
}

