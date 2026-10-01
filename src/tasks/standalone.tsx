import React from 'react';
import ReactDOM from 'react-dom/client';
import { MBBTaskBoardModal } from './MBBTaskBoardModal';

const StandaloneTaskBoard = () => {
  return (
    <div style={{ padding: '16px', minHeight: '100vh', backgroundColor: '#1E1E2E' }}>
      <MBBTaskBoardModal isOpen={true} onClose={() => {}} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StandaloneTaskBoard />
  </React.StrictMode>
);
