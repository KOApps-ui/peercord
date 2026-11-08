const urls = [
 'wss://relay.damus.io','wss://nos.lol','wss://relay.nostr.band','wss://nostr.mom',
 'wss://relay.primal.net','wss://relay.snort.social','wss://nostr.wine','wss://relay.nostr.bg',
 'wss://nostr-pub.wellorder.net','wss://relay.0xchat.com','wss://relay.nostr.net'
]
const test = (u) => new Promise((res) => {
  let done = false
  const t = setTimeout(() => { if(!done){done=true;res([u,'TIMEOUT'])} }, 7000)
  try {
    const ws = new WebSocket(u)
    ws.onopen = () => { clearTimeout(t); if(!done){done=true; ws.close(); res([u,'OK'])} }
    ws.onerror = () => { clearTimeout(t); if(!done){done=true;res([u,'ERR'])} }
  } catch { clearTimeout(t); if(!done){done=true;res([u,'THROW'])} }
})
const out = await Promise.all(urls.map(test))
out.forEach(([u,s]) => console.log(s.padEnd(8), u))
