"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RESIDENT_HASHTAGS, findResidentItems } from "@/lib/residentNav";
import ResidentIcon from "./ResidentIcon";
import styles from "./ResidentSkin.module.css";

// The Jeju search-area, scoped to what a resident can actually do here: type
// 「垃圾」「停水」「診所」 and jump straight to the feature. Matches on labels,
// descriptions and a hand-written keyword list in lib/residentNav.ts.
export default function ResidentFinder() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => findResidentItems(query), [query]);
  const open = focused && query.trim().length > 0;

  return (
    <div className={styles.finder}>
      <form
        role="search"
        className={styles.finderBox}
        onSubmit={(e) => {
          e.preventDefault();
          const hit = results[active] ?? results[0];
          if (hit) router.push(hit.href);
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          搜尋居民服務
        </label>
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          placeholder="今天要找什麼？例如：垃圾車、停水"
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
            <li className={styles.finderEmpty}>找不到「{query.trim()}」，試試「停水」「公車」「AED」</li>
          ) : (
            results.map((item, i) => (
              <li key={item.key} id={`${listId}-${item.key}`} role="option" aria-selected={i === active}>
                <Link href={item.href} className={styles.finderResult} data-active={i === active} onMouseEnter={() => setActive(i)}>
                  <span className={styles.statIcon}>
                    <ResidentIcon name={item.icon} size={18} />
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

      <nav className={styles.tags} aria-label="熱門查詢">
        {RESIDENT_HASHTAGS.map((tag) => (
          <Link key={tag.label} href={tag.href} className={styles.tag}>
            {tag.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
