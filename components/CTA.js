import styles from '../styles/CTA.module.css';

export default function CTA({
  heading = 'Ready to activate opportunities?',
  cta = { href: 'https://pipeproof.com/', label: 'Explore PipeProof' },
  contact = { email: 'info@pipeproof.com', phone: '+1 587-850-7473' },
}) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.heading}>
            <h3>{heading}</h3>
          </div>
          <a href={cta.href} className={styles.primaryCta} target="_blank" rel="noopener noreferrer">
            {cta.label}
          </a>
          <div className={styles.contact}>
            <span>{contact.email}</span>
            <span> | </span>
            <span>{contact.phone}</span>
          </div>
        </div>
      </div>
    </section>
  );
}


