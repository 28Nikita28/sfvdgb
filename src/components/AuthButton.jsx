import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  signInWithGoogle, 
  signInWithYandex,
  signOutUser,
  loginWithEmail,
  registerWithEmail
} from '../firebase';
import { Google, Email, Person, Lock, ArrowBack } from '@mui/icons-material';

// Иконка Яндекса
const YandexIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.04 12C2.04 17.57 6.53 22 12.06 22C17.59 22 22.08 17.57 22.08 12C22.08 6.43 17.59 2 12.06 2C6.53 2 2.04 6.43 2.04 12ZM12.06 4.87C16.15 4.87 19.36 8.11 19.36 12C19.36 15.89 16.15 19.13 12.06 19.13C7.97 19.13 4.76 15.89 4.76 12C4.76 8.11 7.97 4.87 12.06 4.87ZM10.46 16.24V7.76H13.67C15.39 7.76 16.62 8.67 16.62 10.3C16.62 11.27 16.15 11.94 15.3 12.39C16.25 12.76 16.82 13.42 16.82 14.5C16.82 16.29 15.54 17.24 13.67 17.24H10.46ZM12.26 9.91V11.78H13.21C13.92 11.78 14.42 11.48 14.42 10.75C14.42 10.02 13.92 9.91 13.21 9.91H12.26ZM12.26 12.77V14.64H13.41C14.12 14.64 14.62 14.34 14.62 13.61C14.62 12.88 14.12 12.77 13.41 12.77H12.26Z" fill="currentColor"/>
  </svg>
);

const AuthButton = ({ user }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithEmail(email, password);
      setShowEmailForm(false);
    } catch (err) {
      setError('Неверный email или пароль');
      console.error('Ошибка входа:', err);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerWithEmail(email, password);
      setShowEmailForm(false);
    } catch (err) {
      setError('Ошибка регистрации: ' + err.message);
      console.error('Ошибка регистрации:', err);
    }
  };

  const handleChangeUser = () => {
    signOutUser();
    setShowEmailForm(false);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
      backgroundColor: '#f5f7fa',
    }}>
      <motion.div 
        className="auth-button-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          maxWidth: '600px', // Увеличили максимальную ширину
          padding: '40px',
          borderRadius: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
        }}
      >
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
            <motion.div
              className="user-info-button"
              whileHover={{ scale: 1.03 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '16px',
                width: '100%',
                cursor: 'default',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
            >
              <img 
                src={user.photoURL || '/default-avatar.png'} 
                alt={user.displayName || 'Пользователь'} 
                className="user-avatar"
                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: '1.3rem' }}>{user.displayName || 'Пользователь'}</span>
                <span style={{ fontSize: '1rem', color: '#6c757d' }}>{user.email}</span>
              </div>
            </motion.div>
            
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <motion.button
                className="change-user-button"
                onClick={handleChangeUser}
                whileHover={{ scale: 1.03, backgroundColor: '#e9ecef' }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  flex: 1,
                  padding: '16px 20px',
                  background: '#f1f3f5',
                  border: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: '#495057',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Person style={{ marginRight: '12px', fontSize: '1.3rem' }} />
                Сменить
              </motion.button>
              
              <motion.button
                className="sign-out-button"
                onClick={signOutUser}
                whileHover={{ scale: 1.03, backgroundColor: '#ff5252' }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  flex: 1,
                  padding: '16px 20px',
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Выйти
              </motion.button>
            </div>
          </div>
        ) : showEmailForm ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="email-auth-form"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              width: '100%'
            }}
          >
            <h3 style={{ 
              margin: '0 0 16px 0', 
              textAlign: 'center', 
              color: '#343a40',
              fontSize: '1.8rem',
              fontWeight: 700
            }}>
              {isRegistering ? 'Регистрация' : 'Вход по почте'}
            </h3>
            
            <div style={{ position: 'relative' }}>
              <Email style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d',
                fontSize: '1.3rem'
              }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={{ 
                  padding: '16px 16px 16px 50px', 
                  borderRadius: '12px', 
                  border: '1px solid #dee2e6',
                  width: '100%',
                  fontSize: '1.1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  ':focus': {
                    borderColor: '#2196f3',
                    outline: 'none'
                  }
                }}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d',
                fontSize: '1.3rem'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                style={{ 
                  padding: '16px 16px 16px 50px', 
                  borderRadius: '12px', 
                  border: '1px solid #dee2e6',
                  width: '100%',
                  fontSize: '1.1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  ':focus': {
                    borderColor: '#2196f3',
                    outline: 'none'
                  }
                }}
              />
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ 
                  color: '#ff6b6b', 
                  fontSize: '1rem',
                  padding: '14px',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  borderRadius: '10px',
                  marginTop: '-8px',
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}
            
            <motion.button
              onClick={isRegistering ? handleEmailRegister : handleEmailLogin}
              whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                padding: '18px 20px',
                background: isRegistering ? '#4caf50' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(33, 150, 243, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </motion.button>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <motion.button
                onClick={() => setIsRegistering(!isRegistering)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  padding: '12px 16px',
                  background: 'transparent',
                  color: '#2196f3',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {isRegistering ? 'Уже есть аккаунт?' : 'Создать аккаунт'}
              </motion.button>
              
              <motion.button
                onClick={() => setShowEmailForm(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent',
                  color: '#6c757d',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <ArrowBack style={{ marginRight: '8px', fontSize: '1.1rem' }} />
                Назад
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              color: '#343a40',
              fontSize: '2rem',
              fontWeight: 800,
              textAlign: 'center'
            }}>
              Войдите в аккаунт
            </h2>
            
            <p style={{ 
              margin: '0 0 30px 0', 
              color: '#6c757d',
              fontSize: '1.1rem',
              textAlign: 'center',
              maxWidth: '480px'
            }}>
              Выберите удобный способ входа
            </p>
            
            <motion.button
              className="google-signin-button"
              onClick={signInWithGoogle}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(66, 133, 244, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '18px 28px',
                background: '#4285F4',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                width: '100%',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(66, 133, 244, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Google style={{ marginRight: '20px', fontSize: '1.6rem' }} />
              <span>Войти через Google</span>
            </motion.button>
            
            <motion.button
              className="yandex-signin-button"
              onClick={signInWithYandex}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(255, 0, 0, 0.35)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '18px 28px',
                background: '#FF0000',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                width: '100%',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(255, 0, 0, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}>
                <YandexIcon />
              </span>
              <span>Войти через Яндекс</span>
            </motion.button>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%', 
              margin: '20px 0 12px',
              color: '#adb5bd'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e9ecef' }}></div>
              <span style={{ padding: '0 16px', fontSize: '1rem' }}>или</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e9ecef' }}></div>
            </div>
            
            <motion.button
              className="email-signin-button"
              onClick={() => setShowEmailForm(true)}
              whileHover={{ scale: 1.03, backgroundColor: '#f8f9fa', boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '18px 28px',
                background: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '14px',
                width: '100%',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                color: '#495057',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <Email style={{ marginRight: '20px', color: '#495057', fontSize: '1.6rem' }} />
              <span>Войти по почте</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthButton;