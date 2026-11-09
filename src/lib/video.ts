// Talk recordings live on YouTube or on a conference platform (InfoQ). Only YouTube links get
// the embedded player; the others get a link that names their platform.
const PLATFORMS: Record<string, string> = {
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'infoq.com': 'InfoQ',
};

export function videoPlatform(url: string): { name: string; embeddable: boolean } {
  const host = new URL(url).hostname.replace(/^(www|m)\./, '');
  const name = PLATFORMS[host] ?? host;
  return { name, embeddable: name === 'YouTube' };
}
