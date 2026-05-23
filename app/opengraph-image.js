import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'devbug — Developer tools, right in your browser';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1a1a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="72" height="72" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#ffffff"
              d="M14,12H10V10H14M14,16H10V14H14M20,8H17.19C16.74,7.22 16.12,6.55 15.37,6.04L17,4.41L15.59,3L13.42,5.17C12.96,5.06 12.5,5 12,5C11.5,5 11.04,5.06 10.59,5.17L8.41,3L7,4.41L8.62,6.04C7.88,6.55 7.26,7.22 6.81,8H4V10H6.09C6.04,10.33 6,10.66 6,11V12H4V14H6V15C6,15.34 6.04,15.67 6.09,16H4V18H6.81C7.85,19.79 9.78,21 12,21C14.22,21 16.15,19.79 17.19,18H20V16H17.91C17.96,15.67 18,15.34 18,15V14H20V12H18V11C18,10.66 17.96,10.33 17.91,10H20V8Z"
            />
          </svg>
          <span style={{ fontSize: 80, fontWeight: 700, color: '#ffffff', letterSpacing: '-2px' }}>
            devbug
          </span>
        </div>

        <span style={{ fontSize: 28, color: '#a3a3a3', letterSpacing: '0px' }}>
          Developer tools, right in your browser
        </span>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {['Base64', 'JWT', 'JSON', 'CHMOD', 'Text', 'Chronometer'].map((tool) => (
            <div
              key={tool}
              style={{
                background: '#373737',
                color: '#d4d4d4',
                fontSize: 18,
                padding: '6px 16px',
                borderRadius: 6,
              }}
            >
              {tool}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
