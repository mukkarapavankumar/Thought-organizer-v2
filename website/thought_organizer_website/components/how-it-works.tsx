'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const steps = [
  {
    title: 'Create Custom Sections',
    description: 'Set up specialized sections for your specific field or project type.',
  },
  {
    title: 'Define Workflow Steps',
    description: 'Create a structured process with customizable steps and AI integration points.',
  },
  {
    title: 'Add Thoughts and Ideas',
    description: 'Input your thoughts and let the AI help organize and enhance them.',
  },
  {
    title: 'Generate Results',
    description: 'Get AI-powered analysis, suggestions, and actionable outputs.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">
            Get started with Thought Organizer in four simple steps
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button size="lg" className="mt-8">
                Get Started Now
              </Button>
            </motion.div>
          </div>
          <div className="relative aspect-square">
            <Image
              src="/placeholder.svg"
              alt="Thought Organizer Interface"
              fill
              className="rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

