'use client';

interface ShareProps { url: string; title: string; }

export function ShareButtons({ url, title }: ShareProps) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* fallback */ }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 mr-1">Share:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-all text-xs" aria-label="Share on Facebook">f</a>
      <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-sky-100 text-gray-500 hover:text-sky-500 transition-all text-xs" aria-label="Share on X">𝕏</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition-all text-xs font-bold" aria-label="Share on LinkedIn">in</a>
      <button onClick={copy} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 transition-all text-xs" aria-label="Copy link">🔗</button>
    </div>
  );
}
