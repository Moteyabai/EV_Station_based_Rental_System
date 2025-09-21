import React from 'react';

const VideoBackground = ({ src, fallbackImage }) => {
  return (
    <div className="video-background">
      {src ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="video-element"
        >
          <source src={src} type="video/mp4" />
          <img src={fallbackImage} alt="Background" className="fallback-image" />
        </video>
      ) : (
        <div 
          className="fallback-image" 
          style={{
            backgroundImage: `url(${fallbackImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      )}
    </div>
  );
};

export default VideoBackground;