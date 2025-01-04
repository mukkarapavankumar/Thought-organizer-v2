'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Brain, ArrowRight } from 'lucide-react'

const workflowSteps = [
  {
    title: "Define Your Sections",
    description: "Create custom sections for different types of thoughts and ideas",
  },
  {
    title: "Set Your Steps",
    description: "Design the exact workflow steps for AI to follow",
  },
  {
    title: "Choose Your Models",
    description: "Select which AI model handles each step",
  },
  {
    title: "Control Context",
    description: "Specify what context to include for each interaction",
  },
]

export function WorkflowDemo() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Your Workflow, Your Rules
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Finally, an AI-powered tool that works exactly how you want it to
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="h-full p-6 bg-white">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-blue-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

