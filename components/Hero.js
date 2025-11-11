import styles from '../styles/Hero.module.css';

export default function Hero({
  intro,
  cta = { href: 'https://pipeproof.com/', label: 'Explore PipeProof' },
  subtitle,
}) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={`${styles.inner} ${styles.surface}`}>
          <p className={styles.intro}>{intro}</p>
          <div className={styles.ctaRow}>
            <a href={cta.href} className={styles.primaryCta} target="_blank" rel="noopener noreferrer">
              {cta.label}
            </a>
          </div>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>
    </section>
  );
}


