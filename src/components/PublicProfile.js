import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  SnowEffect, 
  RainEffect, 
  StarsEffect, 
  ParticlesEffect, 
  LeavesEffect,
  AuroraEffect,
  FireworksEffect,
  MatrixEffect,
  ConfettiEffect,
  NebulaEffect
} from './Effects';
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '../utils/youtube';
import './PublicProfile.css';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // Get YouTube video ID (before early returns)
  const youtubeVideoId = profile?.musicUrl ? getYouTubeVideoId(profile.musicUrl) : null;

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Normalize username to lowercase for query
        const normalizedUsername = username.toLowerCase().trim();
        console.log('Fetching profile for username:', normalizedUsername);
        
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('username', '==', normalizedUsername));
        const querySnapshot = await getDocs(q);
        
        console.log('Query result:', querySnapshot.empty ? 'Empty' : `Found ${querySnapshot.size} profiles`);
        
        if (querySnapshot.empty) {
          setError('Không tìm thấy hồ sơ này');
        } else {
          const profileData = querySnapshot.docs[0].data();
          console.log('Profile data found:', profileData);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Lỗi khi tải hồ sơ: ' + error.message);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfile();
    } else {
      setError('Username không hợp lệ');
      setLoading(false);
    }
  }, [username]);

  // Load YouTube IFrame API - Only initialize once
  useEffect(() => {
    if (!youtubeVideoId) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let player;
    let checkYT;
    
    const initPlayer = () => {
      if (window.YT && window.YT.Player && !window.youtubePlayer) {
        clearInterval(checkYT);
        player = new window.YT.Player('youtube-player', {
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: youtubeVideoId,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            mute: 0
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume);
              setIsPlaying(true);
              window.youtubePlayer = event.target;
            }
          }
        });
      }
    };

    // Check if YT API is ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      checkYT = setInterval(initPlayer, 100);
    }

    return () => {
      if (checkYT) {
        clearInterval(checkYT);
      }
      if (player && window.youtubePlayer === player) {
        try {
          player.destroy();
          window.youtubePlayer = null;
        } catch (e) {}
      }
    };
  }, [youtubeVideoId]); // Removed volume from dependencies

  // Update volume when changed - Separate effect to avoid reinitializing player
  useEffect(() => {
    if (window.youtubePlayer) {
      try {
        window.youtubePlayer.setVolume(volume);
        if (volume === 0) {
          window.youtubePlayer.mute();
        } else {
          window.youtubePlayer.unMute();
        }
      } catch (e) {
        console.error('Error setting volume:', e);
      }
    }
  }, [volume]);

  function toggleMusic() {
    if (!window.youtubePlayer) return;
    
    try {
      if (isPlaying) {
        window.youtubePlayer.pauseVideo();
        setIsPlaying(false);
      } else {
        window.youtubePlayer.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Error toggling music:', e);
    }
  }

  function handleVolumeChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
  }

  // Apply custom cursor if available and user is Premium
  // This must be before early returns to follow React Hooks rules
  useEffect(() => {
    if (!profile) return;
    
    // Check if user has premium
    const isPremium = profile.isPremium && profile.premiumExpiresAt?.toDate ? 
      profile.premiumExpiresAt.toDate() > new Date() : 
      (profile.isPremium && profile.premiumExpiresAt ? new Date(profile.premiumExpiresAt) > new Date() : false);
    
    if (profile.customCursor && isPremium) {
      // Apply cursor to the entire document body when on this page
      document.body.style.cursor = `url(${profile.customCursor}), auto`;
      // Also apply to all elements in public-profile
      const style = document.createElement('style');
      style.id = 'custom-cursor-style';
      style.textContent = `
        .public-profile * {
          cursor: url(${profile.customCursor}), auto !important;
        }
        .public-profile button,
        .public-profile a,
        .public-profile input[type="range"] {
          cursor: url(${profile.customCursor}), pointer !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.body.style.cursor = '';
        const existingStyle = document.getElementById('custom-cursor-style');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [profile?.customCursor, profile?.isPremium, profile?.premiumExpiresAt]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-error">
        <h2>😕 {error || 'Không tìm thấy hồ sơ'}</h2>
        <p>Hồ sơ này không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  const socialLinks = profile.socialLinks || {};

  // Check if user has premium
  const isPremium = profile.isPremium && profile.premiumExpiresAt?.toDate ? 
    profile.premiumExpiresAt.toDate() > new Date() : 
    (profile.isPremium && profile.premiumExpiresAt ? new Date(profile.premiumExpiresAt) > new Date() : false);

  // Get background video ID
  const backgroundVideoId = profile.backgroundVideo ? getYouTubeVideoId(profile.backgroundVideo) : null;

  // Render effect based on profile.effect
  const renderEffect = () => {
    switch (profile.effect) {
      case 'snow':
        return <SnowEffect />;
      case 'rain':
        return <RainEffect />;
      case 'stars':
        return <StarsEffect />;
      case 'particles':
        return <ParticlesEffect />;
      case 'leaves':
        return <LeavesEffect />;
      case 'aurora':
        return isPremium ? <AuroraEffect /> : null;
      case 'fireworks':
        return isPremium ? <FireworksEffect /> : null;
      case 'matrix':
        return isPremium ? <MatrixEffect /> : null;
      case 'confetti':
        return isPremium ? <ConfettiEffect /> : null;
      case 'nebula':
        return isPremium ? <NebulaEffect /> : null;
      default:
        return null;
    }
  };

  return (
    <div 
      className="public-profile"
      style={{
        backgroundImage: profile.backgroundImage ? `url(${profile.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      {/* Website Logo */}
      <Link to="/" className="profile-logo">
        <div className="logo-icon">✈</div>
        <span className="logo-text">KonOne</span>
      </Link>

      {/* Background Video (Premium) */}
      {backgroundVideoId && isPremium && (
        <div className="background-video-container">
          <iframe
            src={`https://www.youtube.com/embed/${backgroundVideoId}?autoplay=1&loop=1&playlist=${backgroundVideoId}&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="background-video"
          />
          <div className="video-overlay"></div>
        </div>
      )}

      {/* Background Overlay */}
      {(profile.backgroundImage || backgroundVideoId) && (
        <div className="background-overlay"></div>
      )}

      {/* Effects */}
      {renderEffect()}

      {/* YouTube Music Player (Hidden) */}
      {youtubeVideoId && (
        <div 
          id="youtube-player" 
          style={{ 
            position: 'fixed',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1
          }}
        ></div>
      )}

      {/* Music Controls */}
      {youtubeVideoId && (
        <div 
          className="music-controls"
          onMouseEnter={() => setShowVolumeControl(true)}
          onMouseLeave={() => setShowVolumeControl(false)}
        >
          <div className="music-controls-wrapper">
            <button 
              onClick={toggleMusic}
              className="music-toggle-btn"
              title={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
            >
              {isPlaying ? '🔊' : '🔇'}
            </button>
            {showVolumeControl && (
              <div className="volume-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  title={`Âm lượng: ${volume}%`}
                />
                <span className="volume-value">{volume}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Content - Centered Card with 3D Effect */}
      <div className="profile-container">
        <div className="profile-card-3d">
          {/* Avatar inside card */}
          {profile.avatar && (
            <div className="profile-avatar-container">
              <img src={profile.avatar} alt={profile.displayName} className="profile-avatar" />
            </div>
          )}
          
          <h1 
            className="profile-name"
            style={{
              fontFamily: profile.textFontFamily || 'Arial',
              textShadow: profile.text3DEffect 
                ? `3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.2), 9px 9px 0px rgba(0,0,0,0.1)`
                : 'none',
              WebkitTextShadow: profile.text3DEffect 
                ? `3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.2), 9px 9px 0px rgba(0,0,0,0.1)`
                : 'none',
              borderWidth: profile.textBorderWidth ? `${profile.textBorderWidth}px` : '0',
              borderStyle: profile.textBorderStyle || 'solid',
              borderColor: profile.textBorderColor || 'transparent',
              transform: profile.text3DEffect ? 'perspective(500px) rotateX(5deg)' : 'none',
              transformStyle: profile.text3DEffect ? 'preserve-3d' : 'flat'
            }}
          >
            {profile.displayName || 'Chưa có tên'}
          </h1>
          {profile.bio && (
            <p 
              className="profile-bio"
              style={{
                fontFamily: profile.textFontFamily || 'Arial',
                borderWidth: profile.textBorderWidth ? `${profile.textBorderWidth}px` : '0',
                borderStyle: profile.textBorderStyle || 'solid',
                borderColor: profile.textBorderColor || 'transparent'
              }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* Social Links Icons */}
        {(socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || socialLinks.linkedin) && (
          <div className="social-icons-container">
            {socialLinks.facebook && (
              <a 
                href={socialLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon facebook"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {socialLinks.instagram && (
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon instagram"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {socialLinks.twitter && (
              <a 
                href={socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon twitter"
                title="Twitter"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            )}
            {socialLinks.linkedin && (
              <a 
                href={socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon linkedin"
                title="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

