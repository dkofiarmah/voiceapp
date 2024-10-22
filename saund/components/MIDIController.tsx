import React, { useEffect, useState } from 'react'
import { useAudioContext } from '../contexts/AudioContext'

export const MIDIController: React.FC = () => {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null)
  const { addClip, selectedTrack } = useAudioContext()

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    }
  }, [])

  const onMIDISuccess = (midiAccess: WebMidi.MIDIAccess) => {
    setMidiAccess(midiAccess)
    for (const input of midiAccess.inputs.values()) {
      input.onmidimessage = onMIDIMessage
    }
  }

  const onMIDIFailure = () => {
    console.error('Could not access your MIDI devices.')
  }

  const onMIDIMessage = (message: WebMidi.MIDIMessageEvent) => {
    const [command, note, velocity] = message.data

    if (command === 144 && velocity > 0) {
      // Note on
      playNote(note, velocity)
    } else if (command === 128 || (command === 144 && velocity === 0)) {
      // Note off
      stopNote(note)
    }
  }

  const playNote = (note: number, velocity: number) => {
    if (selectedTrack) {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440 * Math.pow(2, (note - 69) / 12), audioContext.currentTime)
      gainNode.gain.setValueAtTime(velocity / 127, audioContext.currentTime)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5)

      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate)
      const channelData = buffer.getChannelData(0)
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 440 * Math.pow(2, (note - 69) / 12) * i / audioContext.sampleRate)
      }

      addClip(selectedTrack.id, audioContext.currentTime, audioContext.currentTime + 0.5, buffer)
    }
  }

  const stopNote = (note: number) => {
    // Implement note off logic if needed
  }

  return (
    <div>
      <h2>MIDI Controller</h2>
      <p>{midiAccess ? 'MIDI device connected' : 'No MIDI device connected'}</p>
    </div>
  )
}