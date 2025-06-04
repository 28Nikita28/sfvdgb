import { motion } from 'framer-motion';
import { signInWithGoogle, signOutUser } from '../firebase';
import { Google } from '@mui/icons-material';
import React from 'react';

const AuthButton = ({ user }) => {
  return (
    <div className="auth-button-container">
      {user ? (
        <motion.button
          className="sign-out-button"
          onClick={signOutUser}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="user-avatar"
          />
          <span>Выйти</span>
        </motion.button>
      ) : (
        <motion.button
          className="google-signin-button"
          onClick={signInWithGoogle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Google className="google-icon" />
          <span>Войти через Google</span>
        </motion.button>
      )}
    </div>
  );
};

export default AuthButton;