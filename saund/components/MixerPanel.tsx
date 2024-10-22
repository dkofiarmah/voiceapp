import React from 'react'
import { Slider } from "@/components/ui/slider"
import { Track } from '../types'
import { useAudioContext } from '../contexts/AudioContext'

interface MixerPanelProps {
  tracks: Track[]
}

export const MixerPanel: React.FC<MixerPanelProps> = ({ tracks }) => {
  const { updateTrackEffect } = useAudioContext()

  return (
    <div className="flex-grow overflow-auto p-4 bg-background">
      <div className="flex gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="flex flex-col items-center w-24">
            <div className={`w-4 h-4 rounded-full ${track.color} mb-2`}></div>
            <Slider
              orientation="vertical"
              value={[track.volume]}
              onValueChange={([value]) => updateTrackEffect(track.id, 'volume', value)}
              max={100}
              step={1}
              className="h-64"
            />
            <div className="mt-2 text-center">
              <div className="text-sm font-semibold truncate">{track.name}</div>
              <div className="text-xs text-muted-foreground">{track.volume}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}