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
    <section className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-6">
        <div className="grid md:grid-cols-2 gap-20 mb-32">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <point.icon className="w-16 h-16 text-blue-600" />
              <h2 className="text-3xl font-bold">
                {point.question}
              </h2>
              <p className="text-2xl text-blue-600 font-medium">
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
          <h2 className="text-6xl md:text-6xl font-bold tracking-tight">
            The Answer to All These:{' '}
            <span className="text-blue-600">Thought Organizer</span>
          </h2>
          <p className="mt-6 text-3xl text-gray-600 max-w-3xl mx-auto">
            Take control of your thoughts and ideas with customizable sections,
            defined workflows, and AI that follows your rules.
          </p>
          <Button size="lg" className="text-2xl mt-10 px-8 py-6">
            Start Organizing Your Thoughts
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

