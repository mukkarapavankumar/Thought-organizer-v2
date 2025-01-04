'use client'

import { motion } from 'framer-motion'
import { Bot, Code2, FileJson, FolderGit2, Lock, Share2 } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Flexible AI Integration',
    description:
      'Switch between different AI models and leverage local processing for enhanced privacy.',
  },
  {
    icon: FolderGit2,
    title: 'Customizable Workflows',
    description:
      'Create and save specialized workflows for any field with multi-step analysis pipelines.',
  },
  {
    icon: Code2,
    title: 'Code Generation',
    description:
      'Automatically generate code and scripts based on your workflow requirements.',
  },
  {
    icon: FileJson,
    title: 'Export Options',
    description:
      'Export your results in multiple formats and integrate with your existing tools.',
  },
  {
    icon: Lock,
    title: 'Privacy Focused',
    description:
      'Process sensitive data locally and maintain control over your information.',
  },
  {
    icon: Share2,
    title: 'Collaboration Ready',
    description:
      'Share workflows and results with team members to enhance productivity.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Powerful Features for Complex Workflows
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to organize thoughts, analyze data, and generate actionable results
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

