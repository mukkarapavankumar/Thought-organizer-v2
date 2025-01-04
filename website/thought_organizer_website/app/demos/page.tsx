import React from 'react';
import Image from 'next/image';

export default function DemosPage() {
  const demos = [
    {
      title: "Thought Organization",
      description: "Organize your thoughts into sections and use AI to analyze them for deeper insights.",
      image: "/screenshots/thought-organization.png",
    },
    {
      title: "AI Analysis",
      description: "Get AI-powered analysis of your thoughts with customizable workflows and multiple AI models.",
      image: "/screenshots/ai-analysis.png",
    },
    {
      title: "Custom Workflows",
      description: "Create custom analysis workflows with context-aware steps and model selection.",
      image: "/screenshots/custom-workflow.png",
    },
    {
      title: "Multiple AI Models",
      description: "Choose from various AI models including OpenAI, Perplexity, and Ollama for local execution.",
      image: "/screenshots/model-selection.png",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Feature Demonstrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {demos.map((demo, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={demo.image}
                alt={demo.title}
                width={800}
                height={450}
                className="object-contain"
                priority={index < 2}
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{demo.title}</h3>
              <p className="text-gray-600">{demo.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-8">Try It Yourself</h2>
        <div className="space-y-6">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download the desktop application to start organizing and analyzing your thoughts with AI assistance.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/mukkarapavankumar/Thought-organizer-v2/releases"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download for Windows
            </a>
            <a
              href="https://github.com/mukkarapavankumar/Thought-organizer-v2/releases"
              className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download for Mac
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 