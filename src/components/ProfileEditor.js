import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadToCloudinary } from '../config/cloudinary';
import { t } from '../translations';
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
import './ProfileEditor.css';

export default function ProfileEditor() {
  const { currentUser } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [activeSection, setActiveSection] = useState('customize');
  const [profileOpacity, setProfileOpacity] = useState(50);
  const [profileBlur, setProfileBlur] = useState(50);
  const [isPremium, setIsPremium] = useState(false);
  const [previewEffect, setPreviewEffect] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  // Premium text styling
  const [textFontFamily, setTextFontFamily] = useState('Arial');
  const [text3DEffect, setText3DEffect] = useState(false);
  const [textBorderWidth, setTextBorderWidth] = useState(0);
  const [textBorderColor, setTextBorderColor] = useState('#ffffff');
  const [textBorderStyle, setTextBorderStyle] = useState('solid');
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    avatar: '',
    coverImage: '',
    backgroundImage: '',
    backgroundVideo: '', // Premium: YouTube video as background
    musicUrl: '',
    customCursor: '', // Premium: Custom cursor image
    effect: 'none',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    }
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data();
          setProfileId(querySnapshot.docs[0].id);
          
          // Check premium status
          const premiumExpiresAt = profileData.premiumExpiresAt?.toDate ? 
            profileData.premiumExpiresAt.toDate() : 
            (profileData.premiumExpiresAt ? new Date(profileData.premiumExpiresAt) : null);
          const isPremiumActive = profileData.isPremium && premiumExpiresAt && premiumExpiresAt > new Date();
          setIsPremium(isPremiumActive);
          
          setFormData({
            username: profileData.username || '',
            displayName: profileData.displayName || '',
            bio: profileData.bio || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            website: profileData.website || '',
            avatar: profileData.avatar || '',
            coverImage: profileData.coverImage || '',
            backgroundImage: profileData.backgroundImage || '',
            backgroundVideo: profileData.backgroundVideo || '',
            musicUrl: profileData.musicUrl || '',
            customCursor: profileData.customCursor || '',
            effect: profileData.effect || 'none',
            socialLinks: profileData.socialLinks || {
              facebook: '',
              instagram: '',
              twitter: '',
              linkedin: ''
            }
          });
          
          // Load profile opacity and blur
          setProfileOpacity(profileData.profileOpacity || 50);
          setProfileBlur(profileData.profileBlur || 50);
          
          // Load Premium text styling
          setTextFontFamily(profileData.textFontFamily || 'Arial');
          setText3DEffect(profileData.text3DEffect || false);
          setTextBorderWidth(profileData.textBorderWidth || 0);
          setTextBorderColor(profileData.textBorderColor || '#ffffff');
          setTextBorderStyle(profileData.textBorderStyle || 'solid');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  async function handleImageUpload(file, type) {
    if (!file) return null;
    
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 10MB');
      return null;
    }
    
    setUploading(true);
    try {
      const folder = `profiles/${currentUser.uid}/${type}`;
      const url = await uploadToCloudinary(file, folder);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi khi tải ảnh lên Cloudinary: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user selected Premium effect without Premium
      const premiumEffects = ['aurora', 'fireworks', 'matrix', 'confetti', 'nebula'];
      if (premiumEffects.includes(formData.effect) && !isPremium) {
        const confirmUpgrade = window.confirm(
          '💎 Tính năng Premium!\n\n' +
          `Hiệu ứng "${formData.effect}" chỉ dành cho tài khoản Premium.\n\n` +
          'Bạn có muốn nâng cấp lên Premium để sử dụng hiệu ứng này không?'
        );
        if (confirmUpgrade) {
          navigate('/premium');
        }
        setLoading(false);
        return;
      }

      // Check if user selected background video without Premium
      if (formData.backgroundVideo && !isPremium) {
        const confirmUpgrade = window.confirm(
          ' Tính năng Premium!\n\n' +
          'Background Video chỉ dành cho tài khoản Premium.\n\n' +
          'Bạn có muốn nâng cấp lên Premium để sử dụng tính năng này không?'
        );
        if (confirmUpgrade) {
          navigate('/premium');
        }
        setLoading(false);
        return;
      }

      // Check if user selected custom cursor without Premium
      if (formData.customCursor && !isPremium) {
        const confirmUpgrade = window.confirm(
          ' Tính năng Premium!\n\n' +
          'Custom Cursor chỉ dành cho tài khoản Premium.\n\n' +
          'Bạn có muốn nâng cấp lên Premium để sử dụng tính năng này không?'
        );
        if (confirmUpgrade) {
          navigate('/premium');
        }
        setLoading(false);
        return;
      }

      const normalizedUsername = formData.username.toLowerCase().trim();
      
      const profileData = {
        ...formData,
        username: normalizedUsername,
        userId: currentUser.uid,
        profileOpacity,
        profileBlur,
        // Premium text styling
        textFontFamily,
        text3DEffect,
        textBorderWidth,
        textBorderColor,
        textBorderStyle,
        updatedAt: new Date()
      };

      if (profileId) {
        await updateDoc(doc(db, 'profiles', profileId), profileData);
        alert('Cập nhật hồ sơ thành công!');
      } else {
        const usernameCheck = query(
          collection(db, 'profiles'),
          where('username', '==', normalizedUsername)
        );
        const usernameSnapshot = await getDocs(usernameCheck);
        
        if (!usernameSnapshot.empty) {
          alert('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.');
          setLoading(false);
          return;
        }

        profileData.createdAt = new Date();
        await addDoc(collection(db, 'profiles'), profileData);
        alert('Tạo hồ sơ thành công!');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Lỗi khi lưu hồ sơ: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      const processedValue = name === 'username' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : value;
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  }

  async function handleImageChange(e, type) {
    const file = e.target.files[0];
    if (file) {
      const url = await handleImageUpload(file, type);
      if (url) {
        setFormData(prev => ({
          ...prev,
          [type]: url
        }));
      }
    }
  }

  function handleRemoveImage(type) {
    setFormData(prev => ({
      ...prev,
      [type]: ''
    }));
  }

  const profileLink = formData.username 
    ? `${window.location.origin}/profile/${formData.username}`
    : null;

  return (
    <div className="profile-editor-layout">
      {/* Sidebar */}
      <aside className="editor-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">✈</div>
          <span className="logo-text">KonOne</span>
          <div className="language-selector-editor">
            <select 
              value={language} 
              onChange={(e) => changeLanguage(e.target.value)}
              className="language-select-editor"
            >
              <option value="vi">{t(language, 'profileEditor.vietnamese')}</option>
              <option value="en">{t(language, 'profileEditor.english')}</option>
            </select>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeSection === 'account' ? 'active' : ''}`} onClick={() => setActiveSection('account')}>
            <span className="nav-icon">👤</span> Account
            <span className="nav-arrow">▼</span>
          </div>
          <div className={`nav-item ${activeSection === 'customize' ? 'active' : ''}`} onClick={() => setActiveSection('customize')}>
            <span className="nav-icon"></span> {t(language, 'profileEditor.customize')}
          </div>
       
        </nav>

        <div className="sidebar-footer">
          <button className="footer-btn help-btn">
            <span className="btn-icon"></span> Help Center
          </button>
          <button 
            className="footer-btn my-page-btn"
            onClick={() => profileLink && window.open(profileLink, '_blank')}
            disabled={!profileLink}
          >
            <span className="btn-icon"></span> My Page
          </button>
          <button 
            className="footer-btn share-btn"
            onClick={() => profileLink && navigator.share?.({ url: profileLink })}
            disabled={!profileLink}
          >
            <span className="btn-icon"></span> Share Your Profile
          </button>
          <div className="user-info">
            <div className="user-name">{formData.username || 'No username'}</div>
            <div className="user-uid">UID {currentUser?.uid?.slice(0, 8) || 'N/A'}</div>
            <span className="user-menu">⋯</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="editor-main">
        <form onSubmit={handleSubmit} className="editor-form">
          {/* Media Uploads Section */}
          <div className="media-uploads-section">
            <h2 className="section-title">{t(language, 'profileEditor.mediaUploads')}</h2>
            <div className="media-grid">
              {/* Background */}
              <div className="media-card">
                <div className="media-card-header">
                  <span className="media-label">Background</span>
                  {(formData.backgroundImage || formData.backgroundVideo) && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => {
                        handleRemoveImage('backgroundImage');
                        setFormData(prev => ({ ...prev, backgroundVideo: '' }));
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="media-preview">
                  {formData.backgroundImage ? (
                    <>
                      <img src={formData.backgroundImage} alt="Background" />
                      <span className="file-format">.WEBP</span>
                    </>
                  ) : (
                    <div className="media-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'backgroundImage')}
                        disabled={uploading}
                        className="media-input"
                      />
                      <span className="placeholder-icon">📷</span>
                      <span className="placeholder-text">Click to upload a file</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio */}
              <div className="media-card">
                <div className="media-card-header">
                  <span className="media-label">Audio</span>
                </div>
                <div className="media-preview">
                  <div className="media-placeholder">
                    <input
                      type="url"
                      name="musicUrl"
                      value={formData.musicUrl}
                      onChange={handleChange}
                      placeholder="YouTube URL"
                      className="audio-input"
                    />
                    <span className="placeholder-icon">🎵</span>
                    <span className="placeholder-text">Click to open audio manager</span>
                  </div>
                </div>
              </div>

              {/* Background Video (Premium Only) */}
              {isPremium && (
                <div className="media-card premium-feature">
                  <div className="media-card-header">
                    <span className="media-label">Background Video (Premium)</span>
                    <span className="premium-badge-small">Premium</span>
                    {formData.backgroundVideo && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => setFormData(prev => ({ ...prev, backgroundVideo: '' }))}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="media-preview">
                    {formData.backgroundVideo ? (
                      <div className="video-preview">
                        <span className="video-icon">🎥</span>
                        <span className="video-text">YouTube Video Background</span>
                        <span className="file-format">VIDEO</span>
                      </div>
                    ) : (
                      <div className="media-placeholder">
                        <input
                          type="url"
                          name="backgroundVideo"
                          value={formData.backgroundVideo}
                          onChange={handleChange}
                          placeholder="YouTube Video URL"
                          className="audio-input"
                        />
                        <span className="placeholder-icon">🎥</span>
                        <span className="placeholder-text">YouTube video as background overlay</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Avatar */}
              <div className="media-card">
                <div className="media-card-header">
                  <span className="media-label">Profile Avatar</span>
                  {formData.avatar && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveImage('avatar')}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="media-preview">
                  {formData.avatar ? (
                    <>
                      <img src={formData.avatar} alt="Avatar" />
                      <span className="file-format">.WEBP</span>
                    </>
                  ) : (
                    <div className="media-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'avatar')}
                        disabled={uploading}
                        className="media-input"
                      />
                      <span className="placeholder-icon">👤</span>
                      <span className="placeholder-text">Click to upload a file</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Cursor */}
              <div className="media-card">
                <div className="media-card-header">
                  <span className="media-label">Custom Cursor</span>
                  {!isPremium && <span className="premium-badge">💎 Premium</span>}
                  {formData.customCursor && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveImage('customCursor')}
                      disabled={!isPremium}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="media-preview">
                  {formData.customCursor ? (
                    <>
                      <img src={formData.customCursor} alt="Custom Cursor" style={{ maxWidth: '64px', maxHeight: '64px', objectFit: 'contain' }} />
                      <span className="file-format">.PNG/.SVG</span>
                    </>
                  ) : (
                    <div className="media-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'customCursor')}
                        disabled={uploading || !isPremium}
                        className="media-input"
                      />
                      <span className="placeholder-icon">🖱️</span>
                      <span className="placeholder-text">
                        {isPremium ? 'Click to upload cursor image' : 'Unlock Premium to upload cursor'}
                      </span>
                    </div>
                  )}
                  {!isPremium && (
                    <div className="premium-overlay">
                      <Link to="/premium" className="unlock-premium-btn">Unlock Premium</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Banner */}
            {!isPremium && (
              <div className="premium-banner" onClick={() => navigate('/premium')} style={{ cursor: 'pointer' }}>
                <div className="premium-pattern"></div>
                <div className="premium-content">
                  <span className="premium-icon">💎</span>
                  <span className="premium-text">Want exclusive features? Unlock more with Premium</span>
                </div>
              </div>
            )}
          </div>

          {/* General Customization */}
          <div className="customization-section">
            <h2 className="section-title">{t(language, 'profileEditor.generalCustomization')}</h2>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="A this is my description"
                rows="3"
              />
            </div>

            {/* Discord Presence */}
            <div className="form-group locked-feature">
              <label>
                <span>Discord Presence</span>
                <span className="lock-icon">🔒</span>
              </label>
              <div className="locked-content">
                Click here to connect your Discord and unlock this feature.
              </div>
            </div>

            {/* Profile Opacity */}
            <div className="form-group slider-group">
              <label>Profile Opacity</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={profileOpacity}
                  onChange={(e) => setProfileOpacity(e.target.value)}
                  className="slider"
                />
                <div className="slider-markers">
                  <span>20%</span>
                  <span>50%</span>
                  <span>80%</span>
                </div>
              </div>
            </div>

            {/* Profile Blur */}
            <div className="form-group slider-group">
              <label>Profile Blur</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={profileBlur}
                  onChange={(e) => setProfileBlur(e.target.value)}
                  className="slider"
                />
                <div className="slider-markers">
                  <span>20px</span>
                  <span>50px</span>
                  <span>80px</span>
                </div>
              </div>
            </div>

            {/* Background Effects */}
            <div className="form-group">
              <label>
                <span>Background Effects</span>
                <span className="star-icon">⭐</span>
              </label>
              <div className="effect-select-wrapper">
                <select
                  name="effect"
                  value={formData.effect}
                  onChange={(e) => {
                    handleChange(e);
                    const selectedEffect = e.target.value;
                    if (selectedEffect !== 'none') {
                      setPreviewEffect(selectedEffect);
                      setShowPreview(true);
                    } else {
                      setShowPreview(false);
                    }
                  }}
                  onFocus={(e) => {
                    if (e.target.value !== 'none') {
                      setPreviewEffect(e.target.value);
                      setShowPreview(true);
                    }
                  }}
                  className="custom-select"
                >
                  <option value="none">Choose an option</option>
                  <option value="snow">❄️ Snow</option>
                  <option value="rain">🌧️ Rain</option>
                  <option value="stars">⭐ Stars</option>
                  <option value="particles">✨ Particles</option>
                  <option value="leaves">🍃 Leaves</option>
                  <option value="aurora">🌌 Aurora (Premium)</option>
                  <option value="fireworks">🎆 Fireworks (Premium)</option>
                  <option value="matrix">💚 Matrix (Premium)</option>
                  <option value="confetti">🎊 Confetti (Premium)</option>
                  <option value="nebula">🌠 Nebula (Premium)</option>
                </select>
                {showPreview && previewEffect && previewEffect !== 'none' && (
                  <div className="effect-preview-modal" onClick={() => setShowPreview(false)}>
                    <div className="effect-preview-content" onClick={(e) => e.stopPropagation()}>
                      <div className="preview-header">
                        <h3>Effect Preview</h3>
                        <button 
                          className="close-preview-btn"
                          onClick={() => setShowPreview(false)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="preview-container">
                        {previewEffect === 'snow' && <SnowEffect />}
                        {previewEffect === 'rain' && <RainEffect />}
                        {previewEffect === 'stars' && <StarsEffect />}
                        {previewEffect === 'particles' && <ParticlesEffect />}
                        {previewEffect === 'leaves' && <LeavesEffect />}
                        {previewEffect === 'aurora' && <AuroraEffect />}
                        {previewEffect === 'fireworks' && <FireworksEffect />}
                        {previewEffect === 'matrix' && <MatrixEffect />}
                        {previewEffect === 'confetti' && <ConfettiEffect />}
                        {previewEffect === 'nebula' && <NebulaEffect />}
                        {previewEffect && ['aurora', 'fireworks', 'matrix', 'confetti', 'nebula'].includes(previewEffect) && !isPremium && (
                          <div className="preview-locked-overlay">
                            <div className="locked-icon">🔒</div>
                            <p>Premium Effect</p>
                            <p className="preview-note">Bạn có thể xem preview nhưng cần Premium để sử dụng</p>
                            <button 
                              className="unlock-preview-btn"
                              onClick={() => {
                                setShowPreview(false);
                                navigate('/premium');
                              }}
                            >
                              Unlock Premium
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!isPremium && (
                <div className="premium-lock-message">
                  🔒 Premium users get 5+ exclusive effects! <button type="button" onClick={() => navigate('/premium')} className="premium-link">Unlock Premium</button>
                </div>
              )}
            </div>

            {/* Premium Text Styling */}
            {isPremium && (
              <>
                {/* Font Family */}
                <div className="form-group">
                  <label>
                    <span>Font Family</span>
                    <span className="premium-badge">💎 Premium</span>
                  </label>
                  <select
                    value={textFontFamily}
                    onChange={(e) => setTextFontFamily(e.target.value)}
                    className="custom-select"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Impact">Impact</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Lucida Console">Lucida Console</option>
                    <option value="Palatino">Palatino</option>
                    <option value="Garamond">Garamond</option>
                    <option value="Bookman">Bookman</option>
                    <option value="Courier">Courier</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Helvetica">Helvetica</option>
                  </select>
                </div>

                {/* 3D Text Effect */}
                <div className="form-group">
                  <label>
                    <span>3D Text Effect</span>
                    <span className="premium-badge">💎 Premium</span>
                  </label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={text3DEffect}
                        onChange={(e) => setText3DEffect(e.target.checked)}
                      />
                      <span>Enable 3D Effect</span>
                    </label>
                  </div>
                </div>

                {/* Text Border */}
                <div className="form-group">
                  <label>
                    <span>Text Border</span>
                    <span className="premium-badge">💎 Premium</span>
                  </label>
                  <div className="border-controls">
                    <div className="border-control-row">
                      <label>Width (px)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={textBorderWidth}
                        onChange={(e) => setTextBorderWidth(e.target.value)}
                        className="slider"
                      />
                      <span className="slider-value">{textBorderWidth}px</span>
                    </div>
                    <div className="border-control-row">
                      <label>Color</label>
                      <input
                        type="color"
                        value={textBorderColor}
                        onChange={(e) => setTextBorderColor(e.target.value)}
                        className="color-picker"
                      />
                      <input
                        type="text"
                        value={textBorderColor}
                        onChange={(e) => setTextBorderColor(e.target.value)}
                        className="color-input"
                        placeholder="#ffffff"
                      />
                    </div>
                    <div className="border-control-row">
                      <label>Style</label>
                      <select
                        value={textBorderStyle}
                        onChange={(e) => setTextBorderStyle(e.target.value)}
                        className="custom-select"
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                        <option value="double">Double</option>
                        <option value="groove">Groove</option>
                        <option value="ridge">Ridge</option>
                        <option value="inset">Inset</option>
                        <option value="outset">Outset</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Username Effects */}
            <div className="form-group">
              <label>
                <span>Username Effects</span>
                <span className="star-icon">⭐</span>
                {!isPremium && <span className="premium-badge">💎 Premium</span>}
              </label>
              <select className="custom-select" disabled={!isPremium}>
                <option>Choose an option</option>
                <option value="glow">✨ Glow</option>
                <option value="sparkle">🌟 Sparkle</option>
              </select>
              {!isPremium && (
                <div className="premium-lock-message">
                  🔒 Unlock Premium for exclusive username effects! <Link to="/premium" className="premium-link">Unlock Premium</Link>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="form-group">
              <label>
                <span>Location</span>
                <span className="location-icon">📍</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="My Location"
              />
            </div>

            {/* Glow Settings */}
          
            {/* Username and Display Name */}
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="username"
                  pattern="[a-z0-9]+"
                />
              </div>
              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                  placeholder="Display Name"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="form-row">
              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="url"
                  name="social.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="url"
                  name="social.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="url"
                  name="social.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  name="social.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
              {t(language, 'profileEditor.cancel')}
            </button>
            <button type="submit" disabled={loading || uploading} className="save-btn">
              {uploading ? (language === 'vi' ? 'Đang tải lên...' : 'Uploading...') : loading ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : t(language, 'profileEditor.save')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
