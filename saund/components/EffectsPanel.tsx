import React from 'react'
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAudioContext } from '../contexts/AudioContext'

export const EffectsPanel: React.FC = () => {
  const { selectedTrack, updateTrackEffect } = useAudioContext()

  if (!selectedTrack) {
    return null
  }

  return (
    <div className="p-4 bg-muted">
      <Tabs defaultValue="audio">
        <TabsList>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>
        <TabsContent value="audio">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm">Pre-Gain</label>
              <Slider
                value={[selectedTrack.effects.preGain]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'preGain', value)}
                max={100}
                step={1}
              />
            </div>
            <div>
              <label className="text-sm">Clarity</label>
              <Slider
                value={[selectedTrack.effects.clarity]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'clarity', value)}
                max={100}
                step={1}
              />
            </div>
            <div>
              <label className="text-sm">Pan</label>
              <Slider
                value={[selectedTrack.effects.pan]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'pan', value)}
                min={-50}
                max={50}
                step={1}
              />
            </div>
            <div>
              <label className="text-sm">Volume</label>
              <Slider
                value={[selectedTrack.volume]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'volume', value)}
                max={100}
                step={1}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="effects">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm">Reverb</label>
              <Slider
                value={[selectedTrack.effects.reverb]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'reverb', value)}
                max={100}
                step={1}
              />
            </div>
            <div>
              <label className="text-sm">Delay</label>
              <Slider
                value={[selectedTrack.effects.delay]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'delay', value)}
                max={100}
                step={1}
              />
            </div>
            <div>
              <label className="text-sm">Compression</label>
              <Slider
                value={[selectedTrack.effects.compression]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'compression', value)}
                max={100}
                step={1}
              />
            </div>
            <div>
              <label className="text-sm">EQ</label>
              <Slider
                value={[selectedTrack.effects.eq]}
                onValueChange={([value]) => updateTrackEffect(selectedTrack.id, 'eq', value)}
                max={100}
                step={1}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}