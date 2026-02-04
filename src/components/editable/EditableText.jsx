import React, { useEffect, useRef } from 'react';
import { useSaveSiteContent, useSiteContentValue } from "../../hooks/useSiteContent";

function isAdminPreviewMode() {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get('adminPreview') === '1';
  } catch {
    return false;
  }
}

/**
 * Inline editable text.
 * - Normal mode: reads from Firestore (site_content/<contentKey>) with fallback defaultValue.
 * - Admin preview mode (?adminPreview=1): contentEditable + saves on blur / Enter.
 */
export default function EditableText({
  contentKey,
  defaultValue = '',
  as: Tag = 'span',
  className = '',
  placeholder = 'Kattints és írj ide…',
  ...rest
}) {
  const editable = isAdminPreviewMode();
  const save = useSaveSiteContent();
  const currentValue = useSiteContentValue(contentKey, defaultValue);

  const lastValueRef = useRef(currentValue);

  useEffect(() => {
    lastValueRef.current = currentValue;
  }, [currentValue]);

  const onBlur = async (e) => {
    if (!editable) return;
    const next = (e.currentTarget?.innerText ?? '').replace(/\u00A0/g, ' ').trimEnd();
    const prev = (lastValueRef.current ?? '').replace(/\u00A0/g, ' ').trimEnd();
    if (next === prev) return;
    await save(contentKey, next);
  };

  const onKeyDown = (e) => {
    if (!editable) return;

    // Enter = save (Shift+Enter = new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
      return;
    }

    // Escape = revert
    if (e.key === 'Escape') {
      e.preventDefault();
      e.currentTarget.innerText = lastValueRef.current ?? '';
      e.currentTarget.blur();
    }
  };

  const onClick = (e) => {
    if (!editable) return;
    // If this editable text sits inside a clickable container (link/button), don't navigate.
    const clickable = e.currentTarget.closest('a,button');
    if (clickable) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const shown = (currentValue ?? '').length ? currentValue : defaultValue;

  return (
    <Tag
      {...rest}
      className={[
        className,
        editable
          ? 'cursor-text rounded-md outline-1 outline-dashed outline-[var(--candlie-pink-primary)]/40 hover:outline-[var(--candlie-pink-primary)] hover:bg-[var(--candlie-pink-primary)]/5 px-1 -mx-1 transition-colors'
          : '',
      ].join(' ')}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={editable}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={onClick}
      style={{ ...(rest.style || {}), whiteSpace: 'pre-wrap' }}
      data-content-key={contentKey}
      title={editable ? `Kulcs: ${contentKey}` : undefined}
    >
      {shown || (editable ? placeholder : '')}
    </Tag>
  );
}
