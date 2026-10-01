import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/auth'

async function enableMocking() {
  // В Docker-режиме VITE_USE_MSW=false — MSW не запускается
  if (import.meta.env.VITE_USE_MSW === "false") {
    console.log("[MSW] Disabled — using real backend");
    return;
  }

  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  )
});