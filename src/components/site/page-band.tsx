import styles from './page-band.module.css'

/** Marketing pages: a faint still of the home hero's landscape behind the navbar and heading. */
export function PageBand() {
  return (
    <div data-page-band="" aria-hidden="true" className={styles.band}>
      <picture>
        <source media="(max-width: 639px)" srcSet="/hero/rhine-landscape-phone.webp" />
        <img
          src="/hero/rhine-landscape-wide.webp"
          width="1600"
          height="680"
          alt=""
          decoding="async"
        />
      </picture>
    </div>
  )
}
