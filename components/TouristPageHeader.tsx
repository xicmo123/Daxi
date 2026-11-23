import Image from "next/image";
import type { ReactNode } from "react";
import type { PhotoCredit } from "@/lib/data";
import styles from "./TouristInterior.module.css";

export default function TouristPageHeader({
  title,
  subtitle,
  photo,
  children,
}: {
  title: string;
  subtitle?: string;
  photo?: PhotoCredit;
  children?: ReactNode;
}) {
  return (
    <header className={`${styles.masthead}${photo ? ` ${styles.withPhoto}` : ""}`}>
      <div className={styles.mastheadCopy}>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </div>
      {photo ? (
        <div className={styles.mastheadPhoto}>
          <Image src={photo.src} alt="" fill sizes="(max-width: 639px) 100vw, 560px" />
          {photo.author && photo.sourceUrl ? (
            <a href={photo.sourceUrl} target="_blank" rel="noreferrer">攝影來源 {photo.author}</a>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
