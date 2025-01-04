import { LightbulbIcon as BulbOutlined } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex items-center space-x-2">
            <BulbOutlined className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">Thought Organizer</span>
          </div>
          <p className="text-sm text-gray-600">
            Take control of your thoughts and ideas with AI that follows your rules.
          </p>
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Thought Organizer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

