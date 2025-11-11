import styles from '../styles/Features.module.css';

export default function Features({ title = 'Purpose & Features', items = [] }) {
  return (
    <section id="about" className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.title} className={styles.card}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


