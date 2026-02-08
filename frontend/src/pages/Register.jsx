import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { useEffect } from 'react';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSuccess = () => {
    navigate('/');
  };

  const handleClose = () => {
    navigate('/');
  };

  if (user) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <AuthModal
        mode="register"
        onClose={handleClose}
        onSuccess={handleSuccess}
        redirectTo="/"
      />
    </div>
  );
}
