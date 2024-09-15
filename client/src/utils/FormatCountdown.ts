export function formatCountdown(seconds: number) {
  if (seconds < 60) return `Autosave: ${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Autosave: ${minutes}m ${seconds % 60}s`
}