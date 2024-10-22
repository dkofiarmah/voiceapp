import React from 'react'
import { Music, Mic } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ProjectSelectionProps {
  onSelectProject: (type: string) => void
}

export const ProjectSelection: React.FC<ProjectSelectionProps> = ({ onSelectProject }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
    <h1 className="text-2xl font-bold mb-8">New project</h1>
    <div className="flex gap-4">
      <Button onClick={() => onSelectProject('music')} className="w-40 h-40 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700">
        <Music size={48} />
        <span className="mt-2">Music</span>
      </Button>
      <Button onClick={() => onSelectProject('podcast')} className="w-40 h-40 flex flex-col items-center justify-center bg-pink-600 hover:bg-pink-700">
        <Mic size={48} />
        <span className="mt-2">Podcast</span>
      </Button>
    </div>
  </div>
)