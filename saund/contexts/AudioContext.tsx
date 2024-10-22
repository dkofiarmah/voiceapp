import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { Track, Clip, Effect } from '../types'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'

interface AudioContextType {
  tracks: Track[]
  addTrack: (type: string) => void
  selectedTrack: Track | null
  setSelectedTrack: (track: Track | null) => void
  updateTrackEffect: (trackId: string, effect: keyof Effect, value: number) => void
  isPlaying: boolean
  togglePlayback: () => void
  stop: () => void
  currentTime: number
  setCurrentTime: (time: number) => void
  duration: number
  volume: number
  setVolume: (volume: number) => void
  bpm: number
  setBpm: (bpm: number) => void
  recordTrack: (trackId: string) => void
  stopRecording: () => void
  addClip: (trackId: string, start: number, end: number, audioBuffer: AudioBuffer) => void
  moveClip: (trackId: string, clipId: string, newStart: number) => void
  undo: () => void
  redo: () => void
  saveProject: () => void
  loadProject: (projectData: any) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider')
  }
  return context
}

export const AudioProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const [bpm, setBpm] = useState(120)

  const audioContextRef = useRef<AudioContext | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])

  const socketRef = useRef<SocketIOClient.Socket | null>(null)

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    socketRef.current = io('http://localhost:3001') // Replace with your server URL

    socketRef.current.on('updateProject', (updatedProject: any) => {
      loadProject(updatedProject)
    })

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const addTrack = useCallback((type: string) => {
    const newTrack: Track = {
      id: uuidv4(),
      name: `${type} ${tracks.length + 1}`,
      type,
      volume: 75,
      color: `bg-${['red', 'blue', 'green', 'yellow', 'purple', 'pink'][Math.floor(Math.random() * 6)]}-500`,
      clips: [],
      effects: {
        preGain: 50,
        clarity: 50,
        pan: 0,
        reverb: 0,
        delay: 0,
        compression: 0,
        eq: 50,
      },
    }
    setTracks((prevTracks) => [...prevTracks, newTrack])
    addToUndoStack({ action: 'addTrack', track: newTrack })
    socketRef.current?.emit('updateProject', { tracks: [...tracks, newTrack] })
  }, [tracks])

  const updateTrackEffect = useCallback((trackId: string, effect: keyof Effect, value: number) => {
    setTracks((prevTracks) => {
      const updatedTracks = prevTracks.map((track) =>
        track.id === trackId
          ? { ...track, effects: { ...track.effects, [effect]: value } }
          : track
      )
      addToUndoStack({ action: 'updateTrackEffect', trackId, effect, oldValue: prevTracks.find(t => t.id === trackId)?.effects[effect], newValue: value })
      socketRef.current?.emit('updateProject', { tracks: updatedTracks })
      return updatedTracks
    })
  }, [])

  const togglePlayback = useCallback(() => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }
    setIsPlaying((prev) => !prev)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  const recordTrack = useCallback((trackId: string) => {
    if (audioContextRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          recordingStreamRef.current = stream
          recordingRef.current = new MediaRecorder(stream)
          chunksRef.current = []

          recordingRef.current.ondataavailable = (e) => {
            chunksRef.current.push(e.data)
          }

          recordingRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' })
            const audioUrl = URL.createObjectURL(blob)
            const audio = new Audio(audioUrl)

            audio.addEventListener('loadedmetadata', () => {
              const duration = audio.duration
              audioContextRef.current!.decodeAudioData(blob.slice(0).buffer).then((audioBuffer) => {
                addClip(trackId, currentTime, currentTime + duration, audioBuffer)
              })
            })
          }

          recordingRef.current.start()
        })
    }
  }, [currentTime])

  const stopRecording = useCallback(() => {
    if (recordingRef.current && recordingRef.current.state !== 'inactive') {
      recordingRef.current.stop()
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach(track => track.stop())
    }
  }, [])

  const addClip = useCallback((trackId: string, start: number, end: number, audioBuffer: AudioBuffer) => {
    const newClip: Clip = {
      id: uuidv4(),
      start,
      end,
      audioBuffer
    }
    setTracks((prevTracks) => {
      const updatedTracks = prevTracks.map((track) =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, newClip] }
          : track
      )
      addToUndoStack({ action: 'addClip', trackId, clip: newClip })
      socketRef.current?.emit('updateProject', { tracks: updatedTracks })
      return updatedTracks
    })
  }, [])

  const moveClip = useCallback((trackId: string, clipId: string, newStart: number) => {
    setTracks((prevTracks) => {
      const updatedTracks = prevTracks.map((track) => {
        if (track.id === trackId) {
          const updatedClips = track.clips.map((clip) => {
            if (clip.id === clipId) {
              const oldStart = clip.start
              const duration = clip.end - clip.start
              addToUndoStack({ action: 'moveClip', trackId, clipId, oldStart, newStart })
              return { ...clip, start: newStart, end: newStart + duration }
            }
            return clip
          })
          return { ...track, clips: updatedClips }
        }
        return track
      })
      socketRef.current?.emit('updateProject', { tracks: updatedTracks })
      return updatedTracks
    })
  }, [])

  const addToUndoStack = (action: any) => {
    setUndoStack((prevStack) => [...prevStack, action])
    setRedoStack([])
  }

  const undo = useCallback(() => {
    if (undoStack.length > 0) {
      const action = undoStack[undoStack.length - 1]
      setUndoStack((prevStack) => prevStack.slice(0, -1))
      setRedoStack((prevStack) => [...prevStack, action])

      switch (action.action) {
        case 'addTrack':
          setTracks((prevTracks) => prevTracks.filter((track) => track.id !== action.track.id))
          break
        case 'updateTrackEffect':
          updateTrackEffect(action.trackId, action.effect, action.oldValue)
          break
        case 'addClip':
          setTracks((prevTracks) => prevTracks.map((track) => 
            track.id === action.trackId
              ? { ...track, clips: track.clips.filter((clip) => clip.id !== action.clip.id) }
              : track
          ))
          break
        case 'moveClip':
          moveClip(action.trackId, action.clipId, action.oldStart)
          break
      }
    }
  }, [undoStack, updateTrackEffect, moveClip])

  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const action = redoStack[redoStack.length - 1]
      setRedoStack((prevStack) => prevStack.slice(0, -1))
      setUndoStack((prevStack) => [...prevStack, action])

      switch (action.action) {
        case 'addTrack':
          setTracks((prevTracks) => [...prevTracks, action.track])
          break
        case 'updateTrackEffect':
          updateTrackEffect(action.trackId, action.effect, action.newValue)
          break
        case 'addClip':
          setTracks((prevTracks) => prevTracks.map((track) => 
            track.id === action.trackId
              ? { ...track, clips: [...track.clips, action.clip] }
              : track
          ))
          break
        case 'moveClip':
          moveClip(action.trackId, action.clipId, action.newStart)
          break
      }
    }
  }, [redoStack, updateTrackEffect, moveClip])

  const saveProject = useCallback(() => {
    const projectData = {
      tracks,
      bpm,
      volume
    }
    localStorage.setItem('soundtrapCloneProject', JSON.stringify(projectData))
  }, [tracks, bpm, volume])

  const loadProject = useCallback((projectData: any) => {
    setTracks(projectData.tracks)
    setBpm(projectData.bpm)
    setVolume(projectData.volume)
  }, [])

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prevTime + 0.1
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isPlaying, duration])

  useEffect(() => {
    const maxDuration = tracks.reduce((max, track) => {
      const trackDuration = track.clips.reduce((sum, clip) => Math.max(sum, clip.end), 0)
      return Math.max(max, trackDuration)
    }, 0)
    setDuration(maxDuration)
  }, [tracks])

  const value = {
    tracks,
    addTrack,
    selectedTrack,
    setSelectedTrack,
    updateTrackEffect,
    isPlaying,
    togglePlayback,
    stop,
    currentTime,
    setCurrentTime,
    duration,
    volume,
    setVolume,
    bpm,
    setBpm,
    recordTrack,
    stopRecording,
    addClip,
    moveClip,
    undo,
    redo,
    saveProject,
    loadProject,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}