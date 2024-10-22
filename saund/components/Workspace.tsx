import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { TrackControls } from './TrackControls'
import { Timeline } from './Timeline'
import { EffectsPanel } from './EffectsPanel'
import { Transport } from './Transport'
import { MixerPanel } from './MixerPanel'
import { useAudioContext } from '../contexts/AudioContext'

interface WorkspaceProps {
  projectType: string
}

export const Workspace: React.FC<WorkspaceProps> = ({ projectType }) => {
  const { tracks, addTrack } = useAudioContext()
  const [activeView, setActiveView] = useState<'timeline' | 'mixer'>('timeline')

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 bg-background border-b border-border">
        <Button variant="ghost" size="icon"><ArrowLeft /></Button>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setActiveView('timeline')}>Timeline</Button>
          <Button variant="outline" onClick={() => setActiveView('mixer')}>Mixer</Button>
          <Button variant="outline">Try for free</Button>
          <Button>Share</Button>
        </div>
      </header>
      <TrackControls onAddTrack={addTrack} projectType={projectType} />
      {activeView === 'timeline' ? (
        <Timeline tracks={tracks} />
      ) : (
        <MixerPanel tracks={tracks} />
      )}
      <EffectsPanel />
      <Transport />
    </div>
  )
}