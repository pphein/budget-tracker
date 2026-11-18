import React, { useEffect, useState } from 'react';
import { XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { buildQrPayload } from '../utils/qrShare';
import { useLanguage } from '../i18n/LanguageContext';

const QRShareModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [dataUrl, setDataUrl] = useState('');
  const [json, setJson] = useState('');
  const [tooLarge, setTooLarge] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setCopied(false);
    (async () => {
      try {
        const { json: payload, tooLarge: large } = await buildQrPayload();
        setJson(payload);
        setTooLarge(large);
        if (!large) {
          const QRCode = await import('qrcode');
          setDataUrl(await QRCode.toDataURL(payload, { width: 280, margin: 1 }));
        }
      } catch {
        setError('Could not build share code');
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">{t('qr.shareTitle')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {t('qr.shareDesc')}
          </p>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {!error && tooLarge && (
            <p className="text-sm text-amber-500 text-center">
              {t('qr.tooLarge')}
            </p>
          )}

          {!error && !tooLarge && dataUrl && (
            <div className="flex justify-center">
              <img src={dataUrl} alt="Setup QR code" className="rounded-xl border border-gray-200 dark:border-gray-700" />
            </div>
          )}

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold"
          >
            <ClipboardIcon className="w-4 h-4" /> {copied ? t('qr.copied') : t('qr.copyAsText')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRShareModal;
