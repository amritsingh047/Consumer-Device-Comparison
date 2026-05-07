import React, { useState } from 'react';
import './VideoEmbed.css';

interface Props { youtubeVideoId: string; reviewTitle: string; channelName: string; }

export const VideoEmbed: React.FC<Props> = ({ youtubeVideoId, reviewTitle, channelName }) => {
  const [loaded, setLoaded] = useState(false);
  const src = `https://www.youtube.com/embed/${youtubeVideoId}?rel=0`;
  return (
    <div className="video-embed-wrap">
      <div className="video-embed-meta">
        <span className="video-embed-channel">▶ {channelName}</span>
        <span className="video-embed-title">{reviewTitle}</span>
      </div>
      <div className="video-embed-container">
        {!loaded && (
          <div className="video-embed-skeleton skeleton">
            <span className="video-embed-loading">Loading review…</span>
          </div>
        )}
        <iframe
          src={src}
          title={`YouTube video review: ${reviewTitle}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      </div>
    </div>
  );
};
