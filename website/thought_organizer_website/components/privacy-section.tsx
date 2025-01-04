'use client'

import { motion } from 'framer-motion'
import { Lock, Shield, Server } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const privacyFeatures = [
  {
    icon: Server,
    title: "Local Processing",
    description: "Run AI models locally on your machine, keeping your data under your control",
  },
  {
    icon: Lock,
    title: "Your Data Stays Yours",
    description: "No cloud storage, no data sharing, complete privacy for your thoughts and ideas",
  },
  {
    icon: Shield,
    title: "Choose Your Models",
    description: "Select from various AI models based on your privacy requirements",
  },
]

export function PrivacySection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Your Ideas, Your Privacy
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            We take your privacy seriously. That's why everything stays on your computer.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {privacyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

