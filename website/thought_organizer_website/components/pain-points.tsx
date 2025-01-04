'use client'

import { motion } from 'framer-motion'
import { Bot, Lock, MessageSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <section className="min-h-screen pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-24">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              className="space-y-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <point.icon className="w-16 h-16 text-blue-600" />
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {point.question}
                </h2>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-lg text-gray-500">The Solution</span>
                </div>
              </div>
              <p className="text-2xl text-center text-blue-600 font-semibold">
                {point.solution}
              </p>
            </motion.div>
          ))}

          <motion.div
            className="text-center space-y-8 pt-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              The Answer to All These:{' '}
              <span className="text-blue-600">Thought Organizer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Take control of your thoughts and ideas with customizable sections,
              defined workflows, and AI that follows your rules.
            </p>
            <Button size="lg" className="text-lg">
              Start Organizing Your Thoughts
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

