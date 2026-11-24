import Link from "next/link";
import styles from "./Skin.module.css";

export default function SkinSectionHead({
  id,
  title,
  more,
}: {
  id: string;
  title: string;
  more?: { href: string; label: string };
}) {
  return (
    <div className={styles.sectionHead}>
      <h2 id={id} className={styles.sectionTitle}>{title}</h2>
      {more ? (
        <Link href={more.href} className={styles.more}>
          {more.label} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
