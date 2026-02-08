import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { useEffect } from 'react';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSuccess = () => {
    navigate(redirect);
  };

  const handleClose = () => {
    navigate('/');
  };

  if (user) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <AuthModal
        mode="login"
        onClose={handleClose}
        onSuccess={handleSuccess}
        redirectTo={redirect}
      />
    </div>
  );
}
