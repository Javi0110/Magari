/** Opens Instagram DMs for @magari.andco */
const INSTAGRAM_DM_URL = 'https://ig.me/m/magari.andco'

export default function InstagramDmCta({ className = '', label = 'DM me on Instagram' }) {
  return (
    <a
      href={INSTAGRAM_DM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  )
}
