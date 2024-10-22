import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ProjectSelection } from './components/ProjectSelection'
import { Workspace } from './components/Workspace'
import { AudioProvider, useAudioContext } from './contexts/AudioContext'
import { MIDIController } from './components/MIDIController'
import { Button } from "@/components/ui/button"

const AppContent: React.FC = () => {
  const [projectType, setProjectType] = useState<string | null>(null)
  const { saveProject, loadProject } = useAudioContext()

  useEffect(() => {
    const savedProject = localStorage.getItem('soundtrapCloneProject')
    if (savedProject) {
      loadProject(JSON.parse(savedProject))
    }
  }, [loadProject])

  if (!projectType) {
    return <ProjectSelection onSelectProject={setProjectType} />
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        <header className="flex justify-between items-center p-4 bg-background border-b border-border">
          <h1 className="text-2xl font-bold">Soundtrap Clone</h1>
          <div className="flex items-center gap-4">
            <Button onClick={saveProject}>Save Project</Button>
            <Button onClick={() => loadProject(JSON.parse(localStorage.getItem('soundtrapCloneProject') || '{}'))}>Load Project</Button>
          </div>
        </header>
        <Workspace projectType={projectType} />
        <MIDIController />
      </div>
    </DndProvider>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  )
}