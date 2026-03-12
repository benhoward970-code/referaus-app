import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', borderRadius: 7, position: 'relative' }}>
      <span style={{ color: 'white', fontSize: 18, fontWeight: 900, fontFamily: 'system-ui' }}>R</span>
      <div style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'white', fontSize: 7, fontWeight: 900 }}>?</span>
      </div>
    </div>,
    { ...size }
  );
}