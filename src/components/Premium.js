import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import './Premium.css';

export default function Premium() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Valid activation codes (in production, these should be stored in Firestore)
  const VALID_CODES = {
    'PREMIUM2024': { days: 30, name: 'Premium 1 Month' },
    'PREMIUM2024YEAR': { days: 365, name: 'Premium 1 Year' },
    'PREMIUMFOREVER': { days: 9999, name: 'Premium Lifetime' },
    'TESTCODE': { days: 7, name: 'Test Premium 7 Days' }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data();
          setProfileId(querySnapshot.docs[0].id);
          setProfile({
            id: querySnapshot.docs[0].id,
            ...profileData
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  async function handleActivatePremium() {
    if (!activationCode.trim()) {
      setMessage('Vui lòng nhập activation code');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const code = activationCode.trim().toUpperCase();
      const codeData = VALID_CODES[code];

      if (!codeData) {
        setMessage('Activation code không hợp lệ!');
        setMessageType('error');
        setLoading(false);
        return;
      }

      if (!profileId) {
        setMessage('Vui lòng tạo profile trước khi kích hoạt Premium!');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + codeData.days);

      // Update profile with premium status
      await updateDoc(doc(db, 'profiles', profileId), {
        isPremium: true,
        premiumExpiresAt: expiresAt,
        premiumActivatedAt: new Date(),
        premiumCode: code,
        updatedAt: new Date()
      });

      setMessage(`✅ Kích hoạt Premium thành công! Bạn có Premium trong ${codeData.days} ngày.`);
      setMessageType('success');
      setActivationCode('');

      // Reload profile
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const profileData = querySnapshot.docs[0].data();
        setProfile({
          id: querySnapshot.docs[0].id,
          ...profileData
        });
      }
    } catch (error) {
      console.error('Error activating premium:', error);
      setMessage('Lỗi khi kích hoạt Premium: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  function isPremiumActive() {
    if (!profile?.isPremium) return false;
    if (!profile?.premiumExpiresAt) return false;
    
    const expiresAt = profile.premiumExpiresAt.toDate ? 
      profile.premiumExpiresAt.toDate() : 
      new Date(profile.premiumExpiresAt);
    
    return expiresAt > new Date();
  }

  function getDaysRemaining() {
    if (!isPremiumActive()) return 0;
    
    const expiresAt = profile.premiumExpiresAt.toDate ? 
      profile.premiumExpiresAt.toDate() : 
      new Date(profile.premiumExpiresAt);
    
    const diff = expiresAt - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const premiumActive = isPremiumActive();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="premium-page">
      <div className="premium-container">
        <div className="premium-header">
          <h1 className="premium-title">
            <span className="premium-icon"></span>
            Premium Membership
          </h1>
          <p className="premium-subtitle">
            Unlock exclusive features and enhance your profile
          </p>
        </div>

        {/* Premium Status */}
        {premiumActive ? (
          <div className="premium-status active">
            <div className="status-icon"></div>
            <div className="status-content">
              <h2>Premium Active</h2>
              <p>Bạn đang có Premium! Còn lại <strong>{daysRemaining} ngày</strong></p>
              {profile.premiumExpiresAt && (
                <p className="expires-date">
                  Hết hạn: {new Date(profile.premiumExpiresAt.toDate ? 
                    profile.premiumExpiresAt.toDate() : 
                    profile.premiumExpiresAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="premium-status inactive">
            <div className="status-icon">❌</div>
            <div className="status-content">
              <h2>Free Account</h2>
              <p>Bạn chưa có Premium. Kích hoạt ngay để mở khóa tất cả tính năng!</p>
            </div>
          </div>
        )}

        {/* Activation Code Section */}
        <div className="activation-section">
          <h2 className="section-title">Kích hoạt Premium</h2>
          <div className="activation-form">
            <input
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              placeholder="Nhập activation code"
              className="activation-input"
              disabled={loading || premiumActive}
            />
            <button
              onClick={handleActivatePremium}
              disabled={loading || premiumActive}
              className="activate-btn"
            >
              {loading ? 'Đang xử lý...' : premiumActive ? 'Đã kích hoạt' : 'Kích hoạt Premium'}
            </button>
          </div>
          
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <div className="code-hint">
            <p><strong>Test Codes:</strong></p>
            <ul>
              <li><code>PREMIUM2024</code> - Premium 1 tháng</li>
              <li><code>PREMIUM2024YEAR</code> - Premium 1 năm</li>
              <li><code>PREMIUMFOREVER</code> - Premium vĩnh viễn</li>
              <li><code>TESTCODE</code> - Test 7 ngày</li>
            </ul>
          </div>
        </div>

        {/* Premium Features */}
       
        {/* Back Button */}
        <div className="premium-actions">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Quay lại Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

