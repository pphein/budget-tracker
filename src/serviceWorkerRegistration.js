// src/serviceWorkerRegistration.js
// Registers the service worker to enable offline support in your React app

const register = () => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('../public/service-worker.js')
          .then(reg => console.log('Service Worker registered:', reg))
          .catch(err => console.error('Service Worker registration failed:', err));
      });
    }
  };
  
  const unregister = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.unregister();
      });
    }
  };
  
  export { register, unregister };
  