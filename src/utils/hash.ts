/**
 * Generates a deterministic deduplication ID for a Facebook post.
 * Guaranteed to match regex ^[a-zA-Z0-9_\-]+$ and length <= 128.
 */
export function generatePostId(postUrl: string, content: string = ''): string {
  // Clean url
  const cleanUrl = postUrl.trim().toLowerCase();
  
  // Try to extract Facebook post / story ID
  // Examples:
  // facebook.com/groups/123/posts/987654321/
  // facebook.com/permalink.php?story_fbid=987654321
  // facebook.com/groups/123/permalink/987654321/
  const matchGroupPost = cleanUrl.match(/\/posts\/(\d+)/i) ||
    cleanUrl.match(/story_fbid=(\d+)/i) ||
    cleanUrl.match(/\/permalink\/(\d+)/i) ||
    cleanUrl.match(/\/photos\/[^/]+\/(\d+)/i);

  if (matchGroupPost && matchGroupPost[1]) {
    return `fb_post_${matchGroupPost[1]}`;
  }

  // Fallback to deterministic hash of canonical url + sample text
  const textSeed = `${cleanUrl}|${content.trim().slice(0, 150).replace(/\s+/g, ' ')}`;
  const hash = fnv1aHash(textSeed);
  const safeSnippet = cleanUrl
    .replace(/https?:\/\//g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 40);

  return `post_${safeSnippet}_${hash}`.slice(0, 120);
}

/**
 * 32-bit FNV-1a hash algorithm returning an 8-character hex string
 */
export function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
