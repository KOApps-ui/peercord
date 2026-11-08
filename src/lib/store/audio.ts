/**
 * PeerCord — Ses yönetimi (VAD, akışlar, ekran paylaşımı)
 * getUserMedia, AnalyserNode RMS, setLocalStream/RemoteStream entegrasyonu
 */
import type { P2PTransport } from '@/lib/p2p/contracts'

/* ------------------------------ Tipler ------------------------------- */

export interface AudioManager {
  localStream: MediaStream | null
  localScreenStream: MediaStream | null
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  vadInterval: ReturnType<typeof setInterval> | null
  transport: P2PTransport | null
  channelId: string | null
  onLevelChange: ((level: number) => void) | null
  onSpeakingChange: ((speaking: boolean) => void) | null
  init: (transport: P2PTransport, channelId: string) => Promise<void>
  startCapture: (constraints?: MediaStreamConstraints) => Promise<MediaStream>
  stopCapture: () => void
  startScreenShare: () => Promise<MediaStream>
  stopScreenShare: () => void
  setLevelCallbacks: (callbacks: {
    onLevelChange?: (level: number) => void
    onSpeakingChange?: (speaking: boolean) => void
  }) => void
  toggleMute: () => boolean
  toggleDeafen: () => boolean
  getMuted: () => boolean
  getDeafened: () => boolean
  destroy: () => void
}

/* ---------------------------- VAD Ayarları ---------------------------- */

const VAD_CONFIG = {
  intervalMs: 100,
  smoothingFactor: 0.3,
  speechThreshold: 0.015,
  silenceFrames: 5,
}

/* ---------------------------- AudioManager ---------------------------- */

export function createAudioManager(): AudioManager {
  let localStream: MediaStream | null = null
  let localScreenStream: MediaStream | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let vadInterval: ReturnType<typeof setInterval> | null = null
  let transport: P2PTransport | null = null
  let channelId: string | null = null
  let onLevelChange: ((level: number) => void) | null = null
  let onSpeakingChange: ((speaking: boolean) => void) | null = null
  let muted = false
  let deafened = false
  let speaking = false
  let silenceCount = 0
  let smoothedLevel = 0

  async function init(t: P2PTransport, chId: string): Promise<void> {
    transport = t
    channelId = chId

    // Uzak akışları dinle
    transport.onRemoteStream((peerId: string, stream: MediaStream) => {
      // Store remoteStreams'e eklemek için event fırlat
      window.dispatchEvent(new CustomEvent('peercord:remote-stream', { detail: { peerId, stream } }))
    })

    transport.onRemoteScreenStream((peerId: string, stream: MediaStream) => {
      window.dispatchEvent(new CustomEvent('peercord:remote-screen-stream', { detail: { peerId, stream } }))
    })
  }

  async function startCapture(constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1,
    },
    video: false,
  }): Promise<MediaStream> {
    try {
      localStream = await navigator.mediaDevices.getUserMedia(constraints)

      // AudioContext ve AnalyserNode kur
      audioContext = new AudioContext({ sampleRate: 48000 })
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = VAD_CONFIG.smoothingFactor

      const source = audioContext.createMediaStreamSource(localStream)
      source.connect(analyser)

      // Mute durumunu uygula
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted
      })

      // Transport'a yerel akışı ver
      if (transport) {
        await transport.setLocalStream(localStream)
      }

      // VAD başlat
      startVAD()

      return localStream
    } catch (error) {
      console.error('[Audio] Mikrofon erişimi reddedildi:', error)
      throw new Error('Mikrofon erişimi reddedildi. Lütfen izin verin ve tekrar deneyin.')
    }
  }

  function stopCapture(): void {
    stopVAD()

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      localStream = null
    }

    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
    analyser = null

    if (transport) {
      transport.setLocalStream(null)
    }
  }

  async function startScreenShare(): Promise<MediaStream> {
    try {
      localScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: true,
      })

      // Ekran paylaşımı bittiğinde otomatik durdur
      localScreenStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        stopScreenShare()
      })

      if (transport) {
        await transport.setLocalScreenStream(localScreenStream)
      }

      window.dispatchEvent(new CustomEvent('peercord:screen-share-start', { detail: { stream: localScreenStream } }))

      return localScreenStream
    } catch (error) {
      console.error('[Audio] Ekran paylaşımı başlatılamadı:', error)
      throw new Error('Ekran paylaşımı başlatılamadı. Lütfen izin verin.')
    }
  }

  function stopScreenShare(): void {
    if (localScreenStream) {
      localScreenStream.getTracks().forEach(track => track.stop())
      localScreenStream = null
    }

    if (transport) {
      transport.setLocalScreenStream(null)
    }

    window.dispatchEvent(new CustomEvent('peercord:screen-share-stop'))
  }

  function startVAD(): void {
    if (vadInterval) return

    vadInterval = setInterval(() => {
      if (!analyser || !audioContext) return

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)

      // RMS hesapla
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i]
      }
      const rms = Math.sqrt(sum / dataArray.length) / 255

      // Yumuşakla
      smoothedLevel = smoothedLevel * (1 - VAD_CONFIG.smoothingFactor) + rms * VAD_CONFIG.smoothingFactor

      const isSpeaking = smoothedLevel > VAD_CONFIG.speechThreshold

      if (isSpeaking) {
        silenceCount = 0
        if (!speaking) {
          speaking = true
          onSpeakingChange?.(true)
          // Voice state yayını
          if (transport && channelId) {
            transport.broadcast('voice', {
              channelId,
              muted,
              deafened,
              speaking: true,
              screensharing: !!localScreenStream,
              level: smoothedLevel,
            }).catch(console.error)
          }
        }
      } else {
        silenceCount++
        if (silenceCount >= VAD_CONFIG.silenceFrames && speaking) {
          speaking = false
          onSpeakingChange?.(false)
          if (transport && channelId) {
            transport.broadcast('voice', {
              channelId,
              muted,
              deafened,
              speaking: false,
              screensharing: !!localScreenStream,
              level: 0,
            }).catch(console.error)
          }
        }
      }

      onLevelChange?.(smoothedLevel)
    }, VAD_CONFIG.intervalMs)
  }

  function stopVAD(): void {
    if (vadInterval) {
      clearInterval(vadInterval)
      vadInterval = null
    }
    speaking = false
    silenceCount = 0
    smoothedLevel = 0
    onLevelChange?.(0)
    onSpeakingChange?.(false)
  }

  function setLevelCallbacks(callbacks: {
    onLevelChange?: (level: number) => void
    onSpeakingChange?: (speaking: boolean) => void
  }): void {
    onLevelChange = callbacks.onLevelChange ?? null
    onSpeakingChange = callbacks.onSpeakingChange ?? null
  }

  function toggleMute(): boolean {
    muted = !muted
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted
      })
    }
    // Voice state yayını
    if (transport && channelId) {
      transport.broadcast('voice', {
        channelId,
        muted,
        deafened,
        speaking,
        screensharing: !!localScreenStream,
        level: speaking ? smoothedLevel : 0,
      }).catch(console.error)
    }
    return muted
  }

  function toggleDeafen(): boolean {
    deafened = !deafened
    // Deafen: hem duymaz hem konuşmaz (mute yapar)
    if (deafened && localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = false
      })
    } else if (!deafened && localStream && !muted) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = true
      })
    }
    if (transport && channelId) {
      transport.broadcast('voice', {
        channelId,
        muted: deafened || muted,
        deafened,
        speaking: deafened ? false : speaking,
        screensharing: !!localScreenStream,
        level: 0,
      }).catch(console.error)
    }
    return deafened
  }

  function getMuted(): boolean {
    return muted
  }

  function getDeafened(): boolean {
    return deafened
  }

  function destroy(): void {
    stopCapture()
    stopScreenShare()
    transport = null
    channelId = null
    onLevelChange = null
    onSpeakingChange = null
  }

  return {
    get localStream() { return localStream },
    get localScreenStream() { return localScreenStream },
    get audioContext() { return audioContext },
    get analyser() { return analyser },
    get vadInterval() { return vadInterval },
    get transport() { return transport },
    get channelId() { return channelId },
    get onLevelChange() { return onLevelChange },
    get onSpeakingChange() { return onSpeakingChange },
    init,
    startCapture,
    stopCapture,
    startScreenShare,
    stopScreenShare,
    setLevelCallbacks,
    toggleMute,
    toggleDeafen,
    getMuted,
    getDeafened,
    destroy,
  }
}

/* --------------------------- Yardımcı Hook (React dışı) --------------------------- */

export function createAudioManagerForStore(): AudioManager {
  return createAudioManager()
}