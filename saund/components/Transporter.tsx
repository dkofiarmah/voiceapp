import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Volume2, Rewind, FastForward } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAudioContext } from '../contexts/AudioContext'

export const Transport: React.FC = () => {
  const { isPlaying, togglePlayback, stop, currentTime, setCurrentTime, duration, volume, setVolume, bpm, setBpm } = useAudioContext()

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 100)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center justify-between p-4 bg-background border-t border-border">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={togglePlayback}>
          {isPlaying ? <Pause /> : <Play />}
        </Button>
        <Button size="icon" variant="ghost" onClick={stop}>
          <Square />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}>
          <Rewind />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}>
          <FastForward />
        </Button>
        <span className="text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
      
      </div>
      <div className="flex items-center gap-2">
        <Volume2 size={18} />
        <Slider
          value={[volume]}
          onValueChange={([value]) => setVolume(value)}
          max={100}
          step={1}
          className="w-32"
        />
        <Select value={bpm.toString()} onValueChange={(value) => setBpm(parseInt(value))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[60, 90, 120, 150, 180].map((bpmValue) => (
              <SelectItem key={bpmValue} value={bpmValue.toString()}>{bpmValue} BPM</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}