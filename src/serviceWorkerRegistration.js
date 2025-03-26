// src/serviceWorkerRegistration.js
// Registers the service worker to enable offline support in your React app

const register = () => {
    if ('serviceWorker' in navigator) {
      console.log('Registering service worker');
      window.addEventListener('load', () => {
        console.log('Window loaded');
        navigator.serviceWorker
          .register('./service-worker.js')
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
  