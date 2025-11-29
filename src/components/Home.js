import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../translations';
import './Home.css';

export default function Home() {
  const { currentUser } = useAuth();
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">✈</div>
            <span className="logo-text">KonOne</span>
          </div>
          <nav className="header-nav">
            <a href="#features" className="nav-link">{t(language, 'home.features')}</a>
            <a href="#pricing" className="nav-link">{t(language, 'home.pricing')}</a>
            <div className="language-selector-header">
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-select-header"
              >
                <option value="vi">{t(language, 'home.vietnamese')}</option>
                <option value="en">{t(language, 'home.english')}</option>
              </select>
            </div>
            {currentUser ? (
              <Link to="/dashboard" className="nav-link">{t(language, 'home.dashboard')}</Link>
            ) : (
              <>
                <Link to="/login" className="nav-link">{t(language, 'home.login')}</Link>
                <Link to="/register" className="nav-button">{t(language, 'home.register')}</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t(language, 'home.heroTitle')}</h1>
          <p className="hero-subtitle">
            {t(language, 'home.heroSubtitle')}
          </p>
          <div className="hero-buttons">
            {currentUser ? (
              <Link to="/dashboard" className="btn-primary">
                {t(language, 'home.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  {t(language, 'home.registerForFree')}
                </Link>
                <Link to="/login" className="btn-secondary">
                  {t(language, 'home.viewPricing')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="showcase-section">
        <div className="showcase-container">
          {/* Dashboard Preview */}
          <div className="showcase-card dashboard-preview">
            <div className="preview-header">
              <div className="preview-sidebar">
                <div className="sidebar-user">
                  <div className="sidebar-avatar">👤</div>
                  <div>
                    <div className="sidebar-username">KonOne</div>
                    <div className="sidebar-handle">@username</div>
                  </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="sidebar-item active">Account</div>
                    <div className="sidebar-item">Customize</div>
                    <div className="sidebar-item">Links</div>
                    <div className="sidebar-item">Premium</div>
                </nav>
              </div>
              <div className="preview-content">
                <h3>Account overview</h3>
                <div className="preview-cards">
                  <div className="preview-card">
                    <div className="card-label">Username</div>
                    <div className="card-value">username</div>
                  </div>
                  <div className="preview-card">
                    <div className="card-label">Display name</div>
                    <div className="card-value">Your name</div>
                  </div>
                  <div className="preview-card">
                    <div className="card-label">Views</div>
                    <div className="card-value">1,234</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Preview 1 */}
          <div className="showcase-card profile-preview-1">
            <div className="profile-cover-small"></div>
            <div className="profile-info-small">
              <div className="profile-avatar-small">👤</div>
              <div className="profile-name-small">KON ONE</div>
              <div className="profile-bio-small">Developer</div>
              <div className="profile-social-small">
                <span>📘</span>
                <span>📷</span>
                <span>💼</span>
              </div>
            </div>
          </div>

          {/* Profile Preview 2 */}
          <div className="showcase-card profile-preview-2">
            <div className="profile-cover-gradient"></div>
            <div className="profile-card-small">
              <div className="profile-avatar-tiny">👤</div>
              <div>
                <div className="profile-name-tiny">Tên người dùng</div>
                <div className="profile-desc-tiny">Chào mừng đến trang của tôi!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="features" className="stats-section">
        <div className="stats-container">
          <h2 className="stats-title">
            {t(language, 'home.statsTitle', { count: '100' })}
          </h2>
          <p className="stats-description">
            {t(language, 'home.statsDescription')}
          </p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div className="stat-number">90+</div>
              <div className="stat-label">{t(language, 'home.views')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="stat-number">105+</div>
              <div className="stat-label">{t(language, 'home.users')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="stat-number">230+</div>
              <div className="stat-label">{t(language, 'home.files')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9z"></path>
                  <path d="M11 3L8 9l4 12 4-12-3-6"></path>
                  <path d="M2 9h20"></path>
                </svg>
              </div>
              <div className="stat-number">102+</div>
              <div className="stat-label">{t(language, 'home.subscribers')}</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <p className="cta-text">{t(language, 'home.ctaText')}</p>
            <div className="cta-form">
              <div className="cta-input-wrapper">
                <span className="cta-prefix">KonOne/</span>
                <input 
                  type="text" 
                  className="cta-input" 
                  placeholder="username"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (currentUser) {
                        window.location.href = '/dashboard';
                      } else {
                        window.location.href = '/register';
                      }
                    }
                  }}
                />
              </div>
              {currentUser ? (
                <Link to="/dashboard" className="cta-button">
                  {t(language, 'home.goToDashboard')}
                </Link>
              ) : (
                <Link to="/register" className="cta-button">
                  {t(language, 'home.createNow')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-container">
          <h2 className="pricing-title">
            {t(language, 'home.pricingTitle', { name: 'KonOne' })}
          </h2>
          <div className="pricing-cards">
            {/* Free Plan */}
            <div className="pricing-card free-card">
              <div className="pricing-header">
                <h3 className="pricing-name">{t(language, 'home.free')}</h3>
                <div className="pricing-price">
                  <span className="price-amount">{t(language, 'home.freePrice')}</span>
                  <span className="price-period">{t(language, 'home.freePeriod')}</span>
                </div>
                <p className="pricing-description">{t(language, 'home.freeDescription')}</p>
              </div>
              <ul className="pricing-features">
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Basic customization
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Profile statistics
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Basic effects
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Add social networks
                </li>
              </ul>
              {currentUser ? (
                <Link to="/dashboard" className="pricing-button">
                  {t(language, 'home.goToDashboard')}
                </Link>
              ) : (
                <Link to="/register" className="pricing-button">
                  {t(language, 'home.getStarted')}
                </Link>
              )}
            </div>

            {/* Premium Plan */}
            <div className="pricing-card premium-card">
              <div className="popular-badge">{t(language, 'home.popular')}</div>
              <div className="pricing-header">
                <h3 className="pricing-name">
                  <span className="premium-icon"></span> {t(language, 'home.premium')}
                </h3>
                <div className="pricing-price">
                  <span className="price-amount">{t(language, 'home.premiumPrice')}</span>
                  <span className="price-period">{t(language, 'home.premiumPeriod')}</span>
                </div>
                <p className="price-subtitle">{t(language, 'home.premiumSubtitle')}</p>
                <p className="pricing-description">{t(language, 'home.premiumDescription')}</p>
              </div>
              <ul className="pricing-features">
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Exclusive badge
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Profile layout
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Custom font
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Typewriter effect
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Special profile effect
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Advanced customization
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Integrate multiple platforms
                </li>
              </ul>
              <Link to="/register" className="pricing-button premium-button">
                {t(language, 'home.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          {/* Top Section */}
          <div className="footer-top">
            {/* Left: Branding */}
            <div className="footer-branding">
              <div className="footer-logo-section">
                <div className="footer-logo-icon">✈</div>
                <div className="footer-logo-text">
                  <span>KonOne</span>
                  <div className="system-status">
                    <span className="status-indicator"></span>
                    <span>System Status</span>
                  </div>
                </div>
              </div>
              <p className="footer-description">
                Create feature-rich, customizable and modern link-in-bio pages with KonOne.
              </p>
              <div className="language-selector">
                <span className="flag-icon">{language === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
                <select 
                  value={language} 
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="language-select-footer"
                >
                  <option value="vi">{t(language, 'home.vietnamese')}</option>
                  <option value="en">{t(language, 'home.english')}</option>
                </select>
              </div>
            </div>

            {/* Right: Navigation Links */}
            <div className="footer-links">
              {/* General */}
              <div className="footer-column">
                <h4 className="footer-column-title">General</h4>
                <ul className="footer-link-list">
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Sign Up</Link></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#features">Reset Password</a></li>
                  <li><a href="#features">Website Status</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div className="footer-column">
                <h4 className="footer-column-title">Resources</h4>
                <ul className="footer-link-list">
                  <li><a href="#features">Help Center</a></li>
                  <li><a href="#features">Changelog</a></li>
                  <li><Link to="/premium">Redeem Code</Link></li>
                  <li><a href="#features">Salad.com Product</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="footer-column">
                <h4 className="footer-column-title">Contact</h4>
                <ul className="footer-link-list">
                  <li><a href="#features">Discord Server</a></li>
                  <li><a href="mailto:support@konone.com">Support Email</a></li>
                  <li><a href="mailto:business@konone.com">Business Email</a></li>
                  <li><a href="mailto:legal@konone.com">Legal Email</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="footer-column">
                <h4 className="footer-column-title">Legal</h4>
                <ul className="footer-link-list">
                  <li><a href="#features">Terms of Service</a></li>
                  <li><a href="#features">Privacy Policy</a></li>
                  <li><a href="#features">Copyright Policy</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div className="footer-copyright">
              Copyright © {new Date().getFullYear()} KonOne - All Rights Reserved.
            </div>
            <div className="footer-social">
              <a href="#features" className="social-icon-link" title="Discord">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="#features" className="social-icon-link" title="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="#features" className="social-icon-link" title="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#features" className="social-icon-link" title="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

