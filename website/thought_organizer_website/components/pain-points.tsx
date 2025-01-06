'use client'

import { motion } from 'framer-motion'
import { Bot, Lock, MessageSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { WindowsIcon } from '@/components/icons'
import { DOWNLOAD_URL } from '@/lib/constants'

const painPoints = [
  {
    icon: Search,
    question: "Tired of searching through endless chats for that one important thought?",
    solution: "Organize thoughts in custom sections you define",
  },
  {
    icon: MessageSquare,
    question: "Frustrated with AI not following your instructions?",
    solution: "Create precise workflows that AI models must follow",
  },
  {
    icon: Bot,
    question: "Want more control over AI interactions?",
    solution: "Choose different AI models for different steps",
  },
  {
    icon: Lock,
    question: "Worried about the privacy of your ideas?",
    solution: "Keep your thoughts private with local AI processing",
  },
]

export function PainPoints() {
  return (
    <section className="pt-32 min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-16 mb-16">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <point.icon className="w-12 h-12 text-blue-600" />
              <h2 className="text-xl font-bold">
                {point.question}
              </h2>
              <p className="text-lg text-blue-600 font-medium">
                {point.solution}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            The Answer to All These:{' '}
            <span className="text-blue-600">Thought Organizer</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Take control of your thoughts and ideas with customizable sections,
            defined workflows, and AI that follows your rules.
          </p>
          
          <div className="mt-12 mb-12 max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.youtube.com/embed/IS_UEG8cT1Q"
                title="Thought Organizer Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>

          <Button size="lg" className="text-lg mt-8 px-6 py-4" asChild>
            <Link href={DOWNLOAD_URL} target="_blank" className="flex items-center gap-2">
              <WindowsIcon className="h-6 w-6" />
              Start Organizing Your Thoughts
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

