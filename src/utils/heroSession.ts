// In-memory SPA flag: resets automatically on page refresh (F5) and explicitly on login/logout.
let heroPlayed = false;

export function hasHeroPlayed(): boolean {
  return heroPlayed;
}

export function markHeroPlayed(): void {
  heroPlayed = true;
}

export function resetHeroSession(): void {
  heroPlayed = false;
}
