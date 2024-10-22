import React, { useRef, useEffect } from 'react'

interface WaveformVisualizerProps {
  audioBuffer: AudioBuffer
  width: number
  height: number
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ audioBuffer, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = 'rgb(200, 200, 200)'

        const data = audioBuffer.getChannelData(0)
        const step = Math.ceil(data.length / width)
        const amp = height / 2

        ctx.beginPath()
        for (let i = 0; i < width; i++) {
          const min = Math.min(...data.slice(i * step, (i + 1) * step))
          const max = Math.max(...data.slice(i * step, (i + 1) * step))
          ctx.moveTo(i, (1 + min) * amp)
          ctx.lineTo(i, (1 + max) * amp)
        }
        ctx.stroke()
      }
    }
  }, [audioBuffer, width, height])

  return <canvas ref={canvasRef} width={width} height={height} />
}