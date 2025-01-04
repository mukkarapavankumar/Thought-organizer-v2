'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Code, LineChart, Pencil } from 'lucide-react'

const workflowSteps = [
  { icon: Brain, text: 'Ideation' },
  { icon: Pencil, text: 'Organization' },
  { icon: Code, text: 'Analysis' },
  { icon: LineChart, text: 'Results' },
]

export function HeroSection() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="container">
        <div className="text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Transform Any Idea into an{' '}
            <span className="text-blue-600">Actionable Workflow</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Leverage AI to organize, analyze, and automate any type of project. From content creation
            to trading strategies, turn your thoughts into structured workflows.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg" className="text-lg">
              Download Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              View Demos
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {workflowSteps.map((step, index) => (
            <div
              key={step.text}
              className="relative p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-blue-200" />
              )}
              <step.icon className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="mt-2 text-sm font-medium text-center">{step.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

