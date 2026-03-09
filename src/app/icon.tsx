import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2563EB', borderRadius: 6 }}>
      <span style={{ color: 'white', fontSize: 20, fontWeight: 900 }}>R</span>
    </div>,
    { ...size }
  );
}
