export function buildDeletionEmailUrl(recipient: string): string {
  const subject = encodeURIComponent('TrackMyProps account and data deletion request');
  const body = encodeURIComponent(
    'Please confirm the identity-verification steps for deleting my TrackMyProps account and data.',
  );

  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}
