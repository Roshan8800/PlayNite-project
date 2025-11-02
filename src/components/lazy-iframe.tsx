'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import DOMPurify from 'dompurify';

interface LazyIframeProps {
  srcDoc: string;
  title: string;
  className?: string;
  width?: string;
  height?: string;
}

export function LazyIframe({ srcDoc, title, className, width = '100%', height = '100%' }: LazyIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px',
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sanitizedSrcDoc = useMemo(() => {
    try {
      return DOMPurify.sanitize(srcDoc, {
        ALLOWED_TAGS: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'video', 'source', 'iframe', 'script', 'style'],
        ALLOWED_ATTR: ['src', 'href', 'class', 'id', 'style', 'width', 'height', 'type', 'controls', 'autoplay', 'muted', 'loop', 'poster'],
        ALLOW_DATA_ATTR: false,
      });
    } catch (err) {
      console.error('Error sanitizing iframe content:', err);
      setError('Failed to load video content securely');
      return '';
    }
  }, [srcDoc]);

  useEffect(() => {
    if (inView && !isLoaded && !error) {
      setIsLoaded(true);
    }
  }, [inView, isLoaded, error]);

  return (
    <div
      ref={inViewRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {error ? (
        <div className="w-full h-full bg-black flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-lg mb-2">⚠️ Content Error</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        </div>
      ) : isLoaded ? (
        <iframe
          ref={iframeRef}
          srcDoc={sanitizedSrcDoc}
          title={title}
          width={width}
          height={height}
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="w-full h-full"
          onError={() => setError('Failed to load video content')}
        />
      ) : (
        <div className="w-full h-full bg-black flex items-center justify-center text-white">
          Loading video...
        </div>
      )}
    </div>
  );
}