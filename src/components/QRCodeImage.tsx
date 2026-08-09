import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeImageProps {
  value: string;
  size?: number;
  className?: string;
  onGenerated?: (url: string) => void;
}

export const QRCodeImage: React.FC<QRCodeImageProps> = ({ value, size = 120, className = '', onGenerated }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setDataUrl(url);
        if (onGenerated) onGenerated(url);
      })
      .catch((err) => console.error('QR generation error:', err));
  }, [value, size, onGenerated]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className={`bg-gray-100 animate-pulse rounded ${className}`} />;
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code: ${value}`}
      width={size}
      height={size}
      className={`rounded shadow-xs border border-gray-200 ${className}`}
    />
  );
};
