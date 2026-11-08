import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * Uzak ses akışları için gizli <audio> elementleri yönetir.
 * Her peerId için bir audio elementi oluşturur, ses seviyesini
 * outputVolume, localDeafened ve peerMuted durumuna göre ayarlar.
 */
export function useRemoteAudio(): void {
  const remoteStreams = useAppStore((s) => s.remoteStreams)
  const outputVolume = useAppStore((s) => s.settings.outputVolume)
  const localDeafened = useAppStore((s) => s.localDeafened)
  const voiceMembers = useAppStore((s) => s.voiceMembers)

  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const streamRefs = useRef<Map<string, MediaStream>>(new Map())

  useEffect(() => {
    const currentPeerIds = new Set(Object.keys(remoteStreams))
    const existingPeerIds = new Set(audioRefs.current.keys())

    // Artık olmayan akışları temizle
    for (const peerId of existingPeerIds) {
      if (!currentPeerIds.has(peerId)) {
        const audio = audioRefs.current.get(peerId)
        const stream = streamRefs.current.get(peerId)
        if (audio) {
          audio.pause()
          audio.srcObject = null
          audio.remove()
        }
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        audioRefs.current.delete(peerId)
        streamRefs.current.delete(peerId)
      }
    }

    // Yeni akışlar için audio elementleri oluştur
    for (const [peerId, stream] of Object.entries(remoteStreams)) {
      if (!audioRefs.current.has(peerId)) {
        const audio = document.createElement('audio')
        audio.autoplay = true
        audio.muted = false
        audio.style.display = 'none'
        audio.srcObject = stream
        document.body.appendChild(audio)
        audioRefs.current.set(peerId, audio)
        streamRefs.current.set(peerId, stream)

        const handleError = (err: ErrorEvent) => {
          console.error(`Ses oynatma hatası (${peerId}):`, err)
        }
        audio.addEventListener('error', handleError)

        // Cleanup listener on unmount or peer change
        return () => {
          audio.removeEventListener('error', handleError)
        }
      } else {
        // Mevcut audio elementinin stream'ini güncelle
        const audio = audioRefs.current.get(peerId)
        const oldStream = streamRefs.current.get(peerId)
        if (audio && stream !== oldStream) {
          if (oldStream) {
            oldStream.getTracks().forEach((track) => track.stop())
          }
          audio.srcObject = stream
          streamRefs.current.set(peerId, stream)
        }
      }
    }
  }, [remoteStreams])

  // Ses seviyesi ve mute/deafen durumlarını güncelle
  useEffect(() => {
    const memberMutedMap = new Map<string, boolean>()
    for (const member of voiceMembers) {
      memberMutedMap.set(member.peerId, member.muted)
    }

    for (const [peerId, audio] of audioRefs.current) {
      const peerMuted = memberMutedMap.get(peerId) ?? false
      const shouldMute = localDeafened || peerMuted
      audio.volume = shouldMute ? 0 : outputVolume
      audio.muted = shouldMute
    }
  }, [outputVolume, localDeafened, voiceMembers])

  // Temizlik
  useEffect(() => {
    return () => {
      for (const [peerId, audio] of audioRefs.current) {
        audio.pause()
        audio.srcObject = null
        audio.remove()
        const stream = streamRefs.current.get(peerId)
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
      audioRefs.current.clear()
      streamRefs.current.clear()
    }
  }, [])
}