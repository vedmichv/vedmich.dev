// Talk recordings and transcripts live on YouTube or on a conference platform (InfoQ). Buttons
// name the platform; only YouTube recordings get the embedded player.
const PLATFORMS: Record<string, string> = {
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'infoq.com': 'InfoQ',
};

export function platformOf(url: string): { name: string; embeddable: boolean } {
  const host = new URL(url).hostname.replace(/^(www|m)\./, '');
  const name = PLATFORMS[host] ?? host;
  return { name, embeddable: name === 'YouTube' };
}
