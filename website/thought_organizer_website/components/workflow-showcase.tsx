'use client'

import { motion } from 'framer-motion'
import { Brain, Code, FileText, LineChart, Presentation } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const workflows = [
  {
    title: 'Content Creation',
    icon: Presentation,
    steps: ['Research', 'Script Writing', 'Publishing Plan'],
    description: 'Streamline your content creation process with AI-powered research and writing assistance.',
  },
  {
    title: 'Trading Strategies',
    icon: LineChart,
    steps: ['Market Analysis', 'Strategy Development', 'Code Generation'],
    description: 'Develop and backtest trading strategies with AI-enhanced market analysis.',
  },
  {
    title: 'Software Development',
    icon: Code,
    steps: ['Requirements', 'Architecture', 'Implementation'],
    description: 'Transform requirements into actionable development plans with AI guidance.',
  },
  {
    title: 'Academic Research',
    icon: FileText,
    steps: ['Literature Review', 'Analysis', 'Paper Structure'],
    description: 'Organize research findings and generate paper outlines with AI assistance.',
  },
]

export function WorkflowShowcase() {
  const [activeWorkflow, setActiveWorkflow] = useState(0)

  return (
    <section id="workflows" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Workflows for Every Field
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Customize and automate workflows for any type of project with AI-powered analysis and enhancement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            {workflows.map((workflow, index) => (
              <motion.div
                key={workflow.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    activeWorkflow === index
                      ? 'border-blue-500 shadow-lg'
                      : 'hover:border-blue-200'
                  }`}
                  onClick={() => setActiveWorkflow(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <workflow.icon className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg">{workflow.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-lg">
                {workflows[activeWorkflow].title} Workflow
              </h3>
            </div>
            <div className="space-y-4">
              {workflows[activeWorkflow].steps.map((step, index) => (
                <motion.div
                  key={step}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-grow p-4 rounded-lg bg-gray-50">
                    {step}
                  </div>
                </motion.div>
              ))}
            </div>
            <Button className="w-full mt-6">Try This Workflow</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

