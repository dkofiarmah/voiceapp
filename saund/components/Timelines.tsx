import React, { useState, useRef, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Track, Clip } from '../types'
import { useAudioContext } from '../contexts/AudioContext'
import { WaveformVisualizer } from './WaveformVisualizer'

interface TimelineProps {
  tracks: Track[]
}

interface ClipItemProps {
  clip: Clip
  trackId: string
  zoom: number
}

const ClipItem: React.FC<ClipItemProps> = ({ clip, trackId, zoom }) => {
  const { moveClip } = useAudioContext()
  const [{ isDragging }, drag] = useDrag({
    type: 'CLIP',
    item: { id: clip.id, trackId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const handleDragEnd = (item: any, monitor: any) => {
    const dropResult = monitor.getDropResult()
    if (dropResult) {
      const newStart = Math.round(dropResult.x / (100 * zoom)) * (100 * zoom)
      moveClip(trackId, clip.id, newStart / (100 * zoom))
    }
  }

  return (
    <div
      ref={drag}
      className={`absolute top-0 h-full bg-blue-500 opacity-50 cursor-move ${isDragging ? 'opacity-25' : ''}`}
      style={{
        left: `${clip.start * 100 * zoom}px`,
        width: `${(clip.end - clip.start) * 100 * zoom}px`,
      }}
      onDragEnd={handleDragEnd}
    >
      <WaveformVisualizer audioBuffer={clip.audioBuffer} width={(clip.end - clip.start) * 100 * zoom} height={100} />
    </div>
  )
}

export const Timeline: React.FC<TimelineProps> = ({ tracks }) 
 => {
  const [zoom, setZoom] = useState(1)
  const [scrollPosition, setScrollPosition] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const { currentTime, setCurrentTime, duration } = useAudioContext()

  const [, drop] = useDrop({
    accept: 'CLIP',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset()
      return { x: offset!.x - timelineRef.current!.getBoundingClientRect().left }
    },
  })

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        setZoom(prevZoom => Math.max(0.5, Math.min(4, prevZoom + e.deltaY * -0.01)))
      }
    }

    const timeline = timelineRef.current
    if (timeline) {
      timeline.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (timeline) {
        timeline.removeEventListener('wheel', handleWheel)
      }
    }
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft)
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = timelineRef.current!.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    setCurrentTime(clickX / (100 * zoom))
  }

  return (
    <div className="flex-grow overflow-hidden border-t border-b border-border" ref={drop}>
      <div className="sticky top-0 bg-background z-10 flex border-b border-border">
        {[...Array(Math.ceil(duration / (0.25 / zoom)))].map((_, i) => (
          <div key={i} className="flex-shrink-0 p-2 text-center text-sm border-r border-border" style={{ width: `${25 * zoom}px` }}>
            {(i * 0.25 / zoom).toFixed(2)}
          </div>
        ))}
      </div>
      <div
        className="relative overflow-auto"
        style={{ height: 'calc(100% - 33px)' }}
        onScroll={handleScroll}
        onClick={handleTimelineClick}
        ref={timelineRef}
      >
        <div
          className="absolute top-0 h-full bg-red-500 w-px z-10"
          style={{ left: `${currentTime * 100 * zoom}px` }}
        />
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center border-b border-border" style={{ height: '100px' }}>
            <div className="sticky left-0 z-10 w-40 p-2 flex items-center gap-2 border-r border-border bg-background">
              <div className={`w-4 h-4 rounded-full ${track.color}`}></div>
              <span className="text-sm truncate">{track.name}</span>
            </div>
            <div className="flex-grow relative" style={{ width: `${duration * 100 * zoom}px` }}>
              {track.clips.map((clip) => (
                <ClipItem key={clip.id} clip={clip} trackId={track.id} zoom={zoom} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}