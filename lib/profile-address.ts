const STORAGE_KEY = "character-forge-profile-address"

export function getProfileAddress(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw || typeof raw !== "string") return null
    const trimmed = raw.trim()
    if (!trimmed) return null
    return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`
  } catch {
    return null
  }
}

export function setProfileAddress(address: string): void {
  if (typeof window === "undefined") return
  try {
    const trimmed = address.trim()
    const normalized = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`
    localStorage.setItem(STORAGE_KEY, normalized)
  } catch {
    // ignore
  }
}

export function clearProfileAddress(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
