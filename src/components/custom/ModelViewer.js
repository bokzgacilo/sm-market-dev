// components/ModelViewer.js
'use client';
import '@google/model-viewer';
import { useEffect } from 'react';

export default function ModelViewer(props) {
  useEffect(() => {
    // Ensure the custom element is defined on client
    import('@google/model-viewer');
  }, []);

  return (
    <model-viewer
      {...props}
      style={{ width: '100%', height: '600px', backgroundColor: '#c0c0c0' }}
    />
  );
}
