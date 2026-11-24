"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { findNavItems, type SiteNavItem } from "@/lib/siteNav";
import SkinIcon from "./SkinIcon";
import styles from "./Skin.module.css";

// Search the site's features and expose common destinations beside the hero.
export default function SkinFinder({
  items,
  shortcuts,
  title,
  placeholder,
  searchHref,
  label,
}: {
  items: SiteNavItem[];
  shortcuts: Array<Pick<SiteNavItem, "label" | "href" | "icon">>;
  title: string;
  placeholder: string;
  searchHref?: string;
  label: string;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const trimmed = query.trim();
  const results = useMemo(() => {
    const matches = findNavItems(items, query);
    if (!searchHref || !trimmed) return matches;
    const search: SiteNavItem = {
      key: "__search",
      label: `搜尋「${trimmed}」`,
      desc: "在景點和店家中找",
      href: `${searchHref}?q=${encodeURIComponent(trimmed)}`,
      icon: "search",
      keywords: [],
    };
    return [search, ...matches];
  }, [items, query, searchHref, trimmed]);
  const open = focused && query.trim().length > 0;

  return (
    <div className={styles.finder}>
      <h2 className={styles.finderTitle}>{title}</h2>
      <div className={styles.finderSearch}>
        <form
          role="search"
          className={styles.finderBox}
          onSubmit={(e) => {
            e.preventDefault();
            const hit = results[active] ?? results[0];
            if (hit) {
              setFocused(false);
              router.push(hit.href);
            }
          }}
        >
          <label htmlFor={`${listId}-input`} className="sr-only">
            {label}
          </label>
          <input
            id={`${listId}-input`}
            type="search"
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && results[active] ? `${listId}-${results[active].key}` : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => {
              if (!open || results.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => (a + 1) % results.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => (a - 1 + results.length) % results.length);
              }
            }}
          />
          <button type="submit" className={styles.finderSubmit} aria-label="搜尋">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="m15 15 5 5" />
            </svg>
          </button>
        </form>

        {open ? (
          <ul id={listId} role="listbox" className={styles.finderResults}>
            {results.length === 0 ? (
              <li className={styles.finderEmpty}>找不到「{trimmed}」，換個關鍵字試試</li>
            ) : (
              results.map((item, i) => (
                <li key={item.key} id={`${listId}-${item.key}`} role="option" aria-selected={i === active}>
                  <Link href={item.href} className={styles.finderResult} data-active={i === active} onMouseEnter={() => setActive(i)}>
                    <span className={styles.statIcon}>
                      <SkinIcon name={item.icon} size={18} />
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.desc}</small>
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      <nav className={styles.shortcuts} aria-label={title}>
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href} className={styles.shortcut}>
            <span className={styles.shortcutIcon}><SkinIcon name={item.icon} size={20} /></span>
            <span>{item.label}</span>
            <span className={styles.shortcutArrow} aria-hidden>→</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
