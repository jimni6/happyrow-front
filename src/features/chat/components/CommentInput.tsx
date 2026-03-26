import React, { useState, useRef } from 'react';
import './CommentInput.css';

interface CommentInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  onFocus?: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSend,
  disabled = false,
  onFocus,
}) => {
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setValue('');
      inputRef.current?.focus();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="comment-input" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="comment-input__field"
        placeholder="Ajouter un commentaire…"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={onFocus}
        disabled={disabled || isSending}
        maxLength={2000}
        enterKeyHint="send"
      />
      <button
        type="submit"
        className="comment-input__send"
        disabled={disabled || isSending || !value.trim()}
        aria-label="Envoyer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
};
