import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/features/auth';
import { HttpInviteLinkService } from '../services/HttpInviteLinkService';
import { CreateInviteLink } from '../use-cases/CreateInviteLink';
import { GetActiveInviteLink } from '../use-cases/GetActiveInviteLink';
import { RevokeInviteLink } from '../use-cases/RevokeInviteLink';
import type { InviteLink } from '../types/InviteLink';
import './ShareInviteModal.css';

interface ShareInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  eventDate: Date;
}

type TabId = 'link' | 'qr';

export const ShareInviteModal: React.FC<ShareInviteModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  eventDate,
}) => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('link');
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const service = useMemo(
    () => new HttpInviteLinkService(() => session?.accessToken || null),
    [session]
  );

  const loadOrCreateLink = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const getActive = new GetActiveInviteLink(service);
      let link = await getActive.execute(eventId);
      if (!link) {
        const create = new CreateInviteLink(service);
        link = await create.execute(eventId);
      }
      setInviteLink(link);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load invite link'
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, service]);

  useEffect(() => {
    if (isOpen) {
      loadOrCreateLink();
      setCopied(false);
      setActiveTab('link');
    }
  }, [isOpen, loadOrCreateLink]);

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = inviteLink.inviteUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async () => {
    if (!inviteLink) return;
    setLoading(true);
    try {
      const revoke = new RevokeInviteLink(service);
      await revoke.execute(eventId, inviteLink.token);
      setInviteLink(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke link');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (channel: 'whatsapp' | 'sms' | 'email') => {
    if (!inviteLink) return;
    const text = `Join ${eventName}!`;
    const url = inviteLink.inviteUrl;
    switch (channel) {
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
          '_blank'
        );
        break;
      case 'sms':
        window.open(
          `sms:?body=${encodeURIComponent(text + ' ' + url)}`,
          '_blank'
        );
        break;
      case 'email':
        window.open(
          `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `happyrow-invite-${eventId.slice(0, 8)}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={handleOverlayClick}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-event-header">
          <h3 className="share-modal-event-name">{eventName}</h3>
          <p className="share-modal-event-date">
            {formattedDate} · {formattedTime}
          </p>
        </div>

        <div className="share-modal-tabs">
          <button
            type="button"
            className={`share-modal-tab ${activeTab === 'link' ? 'share-modal-tab--active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            Link
          </button>
          <button
            type="button"
            className={`share-modal-tab ${activeTab === 'qr' ? 'share-modal-tab--active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            QR Code
          </button>
        </div>

        <div className="share-modal-panel">
          {loading && <div className="share-modal-loading">Loading...</div>}

          {error && <div className="share-modal-error">{error}</div>}

          {!loading && !error && !inviteLink && (
            <div className="share-modal-empty">
              <p>No active invite link.</p>
              <button
                type="button"
                className="share-modal-btn-primary"
                onClick={loadOrCreateLink}
              >
                Generate link
              </button>
            </div>
          )}

          {!loading && !error && inviteLink && activeTab === 'link' && (
            <div className="share-modal-link-panel">
              <input
                className="share-modal-link-input"
                type="text"
                readOnly
                value={inviteLink.inviteUrl}
              />
              <div className="share-modal-actions">
                <button
                  type="button"
                  className={`share-modal-btn-primary ${copied ? 'share-modal-btn-primary--copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <div className="share-modal-mini-share">
                  <button
                    type="button"
                    className="share-modal-share-btn"
                    onClick={() => handleShare('whatsapp')}
                    title="WhatsApp"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        fill="#25D366"
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="share-modal-share-btn"
                    onClick={() => handleShare('sms')}
                    title="SMS"
                  >
                    <span aria-hidden="true">💬</span>
                  </button>
                  <button
                    type="button"
                    className="share-modal-share-btn"
                    onClick={() => handleShare('email')}
                    title="Email"
                  >
                    <span aria-hidden="true">✉</span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="share-modal-revoke-btn"
                onClick={handleRevoke}
              >
                Revoke link
              </button>
            </div>
          )}

          {!loading && !error && inviteLink && activeTab === 'qr' && (
            <div className="share-modal-qr-panel">
              <div className="share-modal-qr-wrapper" ref={qrRef}>
                <QRCodeSVG
                  value={inviteLink.inviteUrl}
                  size={160}
                  level="M"
                  fgColor="#1E293B"
                  bgColor="#FFFFFF"
                />
              </div>
              <button
                type="button"
                className="share-modal-download-btn"
                onClick={handleDownloadQR}
              >
                Download QR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
