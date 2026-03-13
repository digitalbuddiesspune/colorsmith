import { createContext, useContext, useState, useCallback } from 'react';
import MessagePopup from '../components/MessagePopup';

const MessageContext = createContext(null);

export function MessageProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', type: 'info' });

  const showMessage = useCallback((message, type = 'info') => {
    setState({ open: true, message: String(message), type });
  }, []);

  const closeMessage = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <MessageContext.Provider value={{ showMessage, closeMessage }}>
      {children}
      <MessagePopup
        open={state.open}
        message={state.message}
        type={state.type}
        onClose={closeMessage}
      />
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const ctx = useContext(MessageContext);
  if (!ctx) {
    throw new Error('useMessage must be used within MessageProvider');
  }
  return ctx;
}
