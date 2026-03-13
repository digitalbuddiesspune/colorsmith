/**
 * Message popup — displays a message in a modal instead of browser alert().
 * Use via useMessage() from MessageContext: showMessage('Your message', 'error' | 'success' | 'info')
 */
export default function MessagePopup({ open, message, type = 'info', onClose }) {
  if (!open) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const icon = isError ? (
    <svg className="w-10 h-10 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : isSuccess ? (
    <svg className="w-10 h-10 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="w-10 h-10 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const borderClass = isError
    ? 'border-red-200'
    : isSuccess
    ? 'border-emerald-200'
    : 'border-slate-200';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative bg-white rounded-2xl shadow-xl border ${borderClass} p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="message-popup-title"
      >
        <div className="flex gap-4">
          {icon}
          <div className="flex-1 min-w-0">
            <p id="message-popup-title" className="text-slate-900 font-medium">
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
