export function removeEmojis(str: string | undefined | null) {
  if (!str) return "";
  return str.replace(/[\p{Extended_Pictographic}]/gu, '');
}

export function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
}

export function renderMarkdownBold(text: string) {
  if (!text) return { __html: "" };
  const clean = removeEmojis(text);
  const html = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return { __html: html };
}
