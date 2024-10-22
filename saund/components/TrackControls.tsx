import React from 'react'
import { Plus, Import, Music, Mic } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TrackControlsProps {
  onAddTrack: (type: string) => void
  projectType: string
}

export const TrackControls: React.FC<TrackControlsProps> = ({ onAddTrack, projectType }) => {
  const trackTypes = projectType === 'music'
    ? ['Voice & Mic', 'Keys', 'Bass & 808', 'Guitar', 'Drums & Machines', 'Synth']
    : ['Host', 'Guest', 'Sound FX', 'Music Bed']

  return (
    <div className="flex items-center gap-4 p-4 bg-muted">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost"><Plus /></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new track</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {trackTypes.map((item) => (
              <Button key={item} onClick={() => onAddTrack(item)} className="h-24 flex flex-col items-center justify-center">
                {projectType === 'music' ? <Music size={24} /> : <Mic size={24} />}
                <span className="mt-2 text-sm">{item}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Button size="icon" variant="ghost"><Import /></Button>
      <Input type="text" placeholder="Search sounds..." className="max-w-sm" />
    </div>
  )
}