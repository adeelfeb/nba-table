import styles from '../styles/Reference.module.css';

export default function Reference({
  title = 'Connected to PipeProof',
  description = 'This platform is linked to the main PipeProof website, which provides fast, reliable plumbing services in Calgary.',
  stats = [
    '4.9 rated on Google',
    'Serving homeowners and businesses across Calgary year‑round',
  ],
  cta = { href: 'https://pipeproof.com/', label: 'Visit PipeProof' },
}) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.copy}>
            <h2 className={styles.title}>{title}</h2>
            <p>{description}</p>
            <ul className={styles.stats}>
              {stats.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
            <a href={cta.href} className={styles.cta} target="_blank" rel="noopener noreferrer">
              {cta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


