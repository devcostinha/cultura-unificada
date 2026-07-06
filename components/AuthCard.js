import Link from "next/link";
import styles from "./AuthCard.module.css";

export default function AuthCard({ title, subtitle, footer, children }) {
  return (
    <div className={`${styles.wrap} gradient-bg-soft`}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <span className="gradient-text">Cultura Unificada</span>
        </Link>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
        {footer && <div className={styles.footerLink}>{footer}</div>}
      </div>
    </div>
  );
}
