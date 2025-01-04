'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

const workflowExamples = [
  {
    title: "Business Strategy",
    steps: ["Market Analysis", "Business Plan", "Implementation Steps"],
  },
  {
    title: "Academic Research",
    steps: ["Literature Review", "Analysis", "Paper Structure"],
  },
  {
    title: "Trading Strategies",
    steps: ["Market Analysis", "Strategy Development", "Code Generation"],
  },
  {
    title: "Content Creation",
    steps: ["Research", "Script", "Publishing Plan"],
  },
]

export function WorkflowExamples() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Workflows for Every Field
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            See how Thought Organizer adapts to various industries and use cases
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {workflowExamples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{example.title}</h3>
                  <div className="flex items-center space-x-4">
                    {example.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center">
                        <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                          {step}
                        </div>
                        {stepIndex < example.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

