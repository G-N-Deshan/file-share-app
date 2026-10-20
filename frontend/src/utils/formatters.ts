export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

export function getFileTypeBadge(name: string, mime: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext) || mime.startsWith('image/')) {
    return { label: 'IMG', color: '#10b981', type: 'image' };
  }
  if (['pdf'].includes(ext) || mime.includes('pdf')) {
    return { label: 'PDF', color: '#ef4444', type: 'pdf' };
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'html', 'css', 'json', 'sql', 'sh'].includes(ext)) {
    return { label: ext.toUpperCase(), color: '#8b5cf6', type: 'code' };
  }
  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'md'].includes(ext)) {
    return { label: 'DOC', color: '#3b82f6', type: 'doc' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { label: 'ZIP', color: '#f59e0b', type: 'archive' };
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return { label: 'VID', color: '#ec4899', type: 'video' };
  }
  return { label: ext.toUpperCase() || 'FILE', color: '#64748b', type: 'other' };
}
