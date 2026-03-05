let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let startTime = 0

export async function startRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 16000,
    },
  })

  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
  audioChunks = []
  startTime = Date.now()

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data)
    }
  }

  mediaRecorder.start(250) // collect chunks every 250ms
}

export async function stopRecording(): Promise<{ wavBuffer: ArrayBuffer; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('No recording in progress'))
      return
    }

    mediaRecorder.onstop = async () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000)
      const webmBlob = new Blob(audioChunks, { type: 'audio/webm' })

      try {
        const wavBuffer = await convertToWav16kMono(webmBlob)
        resolve({ wavBuffer, durationSeconds })
      } catch (err) {
        reject(err)
      }

      // Stop all tracks
      mediaRecorder!.stream.getTracks().forEach((t) => t.stop())
      mediaRecorder = null
      audioChunks = []
    }

    mediaRecorder.stop()
  })
}

export function isRecording(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === 'recording'
}

/**
 * Convert any audio blob to WAV 16kHz mono PCM — required format for whisper.cpp
 */
async function convertToWav16kMono(blob: Blob): Promise<ArrayBuffer> {
  const audioContext = new OfflineAudioContext(1, 1, 16000)
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  // Resample to 16kHz mono
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * 16000), 16000)
  const source = offlineCtx.createBufferSource()
  source.buffer = audioBuffer
  source.connect(offlineCtx.destination)
  source.start()

  const renderedBuffer = await offlineCtx.startRendering()
  const pcmData = renderedBuffer.getChannelData(0)

  return encodeWav(pcmData, 16000)
}

/**
 * Encode Float32 PCM data into a WAV file ArrayBuffer
 */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = samples.length * (bitsPerSample / 8)
  const headerSize = 44
  const buffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // PCM samples (float32 → int16)
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    const val = s < 0 ? s * 0x8000 : s * 0x7fff
    view.setInt16(offset, val, true)
    offset += 2
  }

  return buffer
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
