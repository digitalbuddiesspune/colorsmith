import { useNavigate } from 'react-router-dom';
import AdminLoginPopup from '../../components/AdminLoginPopup';

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const handleClose = () => navigate('/');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md">
        <AdminLoginPopup onClose={handleClose} />
      </div>
    </div>
  );
}
