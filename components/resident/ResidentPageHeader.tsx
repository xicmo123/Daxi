import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { residentTrail } from "@/lib/residentNav";
import { breadcrumbJsonLd, jsonLdString } from "@/lib/seo";
import styles from "./ResidentSkin.module.css";

// Sub-page masthead in the Visit Jeju manner: breadcrumb, a big left-aligned
// title, one line of lead text, then (optionally) the sibling pages of the
// same menu group as pill tabs and a rounded photo banner.
export default function ResidentPageHeader({
  href,
  title,
  lead,
  right,
  showSiblings = true,
  photo,
  tabs,
}: {
  /** This page's own href — used to find its group for the breadcrumb and tabs. */
  href: string;
  title: string;
  lead?: string;
  right?: ReactNode;
  showSiblings?: boolean;
  photo?: { src: string; author: string; sourceUrl: string };
  /** In-page anchors to show as pill tabs instead of the group's sibling pages. */
  tabs?: Array<{ href: string; label: string }>;
}) {
  const { group } = residentTrail(href);
  const siblings =
    tabs?.map((t) => ({ key: t.href, href: t.href, label: t.label })) ??
    group?.items.filter((i, idx, arr) => arr.findIndex((x) => x.href === i.href) === idx) ??
    [];

  return (
    <div className={styles.pageHead}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbJsonLd([
              { name: "我是大溪人", path: "/resident" },
              ...(group ? [{ name: group.label }] : []),
              { name: title, path: href },
            ]),
          ),
        }}
      />
      <ol className={styles.crumbs} aria-label="目前位置">
        <li>
          <Link href="/resident">首頁</Link>
        </li>
        {group ? <li>{group.label}</li> : null}
        <li aria-current="page">{title}</li>
      </ol>
      <div className={styles.pageTitleRow}>
        <div className="min-w-0">
          <h1 className={styles.pageTitle}>{title}</h1>
          {lead ? <p className={styles.pageLead}>{lead}</p> : null}
        </div>
        {right}
      </div>
      {showSiblings && siblings.length > 1 ? (
        <nav className={styles.pageTabs} aria-label={tabs ? "本頁段落" : `${group?.label ?? ""}相關頁面`}>
          {siblings.map((item) => (
            <Link key={item.key} href={item.href} className={styles.pageTab} aria-current={item.href === href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
      {photo ? (
        <div className={styles.pageBanner}>
          <Image src={photo.src} alt="" fill sizes="(max-width: 767px) 100vw, 1152px" />
          <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
            攝影 {photo.author}
          </a>
        </div>
      ) : null}
    </div>
  );
}
