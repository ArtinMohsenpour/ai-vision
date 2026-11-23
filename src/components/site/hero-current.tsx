import styles from './hero.module.css'

export function HeroCurrent({ id }: { id: string }) {
  return (
    <svg className={styles.current} fill="none" aria-hidden="true">
      <defs>
        <path id={id} />
      </defs>
      <use href={`#${id}`} className={styles.thread} />
      <path className={styles.filament} />
      <use href={`#${id}`} className={styles.beads} />
      <use href={`#${id}`} data-knot="" className={styles.knot} />
    </svg>
  )
}
