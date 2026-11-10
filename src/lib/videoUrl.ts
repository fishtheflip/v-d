export function toPlayerUrl(input?: string | null, provider?: string): string | null {
  if (!input) return null;
  const value = input.trim().replaceAll('&amp;', '&');
  const youtubeEmbed = (id: string) => /^[\w-]{11}$/.test(id)
    ? `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`
    : null;
  if (provider === 'youtube' || /^[\w-]{11}$/.test(value) && !/^\d+$/.test(value)) {
    if (!value.includes('/')) return youtubeEmbed(value);
  }
  if (/^\d+$/.test(value)) return `https://player.vimeo.com/video/${value}?playsinline=1`;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const parts = url.pathname.split('/').filter(Boolean);
    if (host === 'youtu.be') return youtubeEmbed(parts[0] || '');
    if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      return youtubeEmbed(url.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : '') || '');
    }
    if (host === 'player.vimeo.com' && /^\/video\/\d+$/.test(url.pathname)) return url.href;
    if (host === 'vimeo.com') {
      const id = parts[0] === 'video' ? parts[1] : parts[0];
      if (/^\d+$/.test(id || '')) {
        const embed = new URL(`https://player.vimeo.com/video/${id}`);
        const hash = url.searchParams.get('h') || (parts[0] !== 'video' ? parts[1] : undefined);
        if (hash) embed.searchParams.set('h', hash);
        embed.searchParams.set('playsinline', '1');
        return embed.href;
      }
    }
  } catch { /* Invalid URLs display the unavailable state. */ }
  return null;
}
