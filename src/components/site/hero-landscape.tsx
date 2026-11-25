export function HeroLandscape() {
  return (
    <picture>
      <source media="(max-width: 639px)" srcSet="/hero/rhine-landscape-phone.webp" />
      <img
        src="/hero/rhine-landscape-wide.webp"
        width="1600"
        height="680"
        alt=""
        fetchPriority="high"
      />
    </picture>
  )
}
