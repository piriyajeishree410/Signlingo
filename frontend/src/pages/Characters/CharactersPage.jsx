import { useEffect, useMemo, useState } from "react";
import { fetchSigns } from "../../api/signs.api"; // <-- new helper
import styles from "./CharactersPage.module.css";

const PLACEHOLDER = "/images/signs/placeholder.png";

export default function CharactersPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Fetch from backend whenever query changes (server-side search).
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setErr("");
    fetchSigns(q, 100, ac.signal)
      .then(({ items }) => setItems(items))
      .catch((e) => {
        if (e.name !== "AbortError") setErr(e.message || "Failed to load");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [q]);

  // If you still want client-side filtering on top, keep this; otherwise use items directly.
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    // Extra safety in case some fields are missing.
    return items.filter((it) => {
      const label = (it.label || "").toLowerCase();
      const cat = (it.category || "").toLowerCase();
      const desc = (it.desc || "").toLowerCase();
      return (
        label.includes(s) ||
        cat.includes(s) ||
        desc.includes(s) ||
        (Array.isArray(it.tags) && it.tags.join(" ").toLowerCase().includes(s))
      );
    });
  }, [items, q]);

  return (
    <div className={styles.page}>
      {/* Search bar */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search characters (e.g., A, Hello, alphabet)…"
          className={styles.searchInput}
          aria-label="Search characters"
        />
        {q && (
          <button
            className={styles.clearBtn}
            onClick={() => setQ("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {loading && <div className={styles.loading}>Loading…</div>}
      {err && <div className={styles.error}>{err}</div>}

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((it) => (
          <button
            key={it.id}
            className={styles.card}
            onClick={() => setActive(it)}
            aria-label={`Open ${it.label}`}
          >
            <div className={styles.cardImgWrap}>
              <img
                src={it.img || PLACEHOLDER}
                alt={it.label}
                className={styles.cardImg}
                onError={(e) => {
                  if (
                    e.currentTarget.src !==
                    window.location.origin + PLACEHOLDER
                  ) {
                    e.currentTarget.src = PLACEHOLDER;
                  }
                }}
              />
            </div>
            <div className={styles.cardText}>
              <span className={styles.cardLabel}>{it.label}</span>
              <span className={styles.cardTag}>{it.category}</span>
            </div>
          </button>
        ))}
        {!loading && !err && filtered.length === 0 && (
          <div className={styles.empty}>No matches. Try another term.</div>
        )}
      </div>

      {/* Modal */}
      {active && (
        <div className={styles.modalBackdrop} onClick={() => setActive(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.label} details`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className={styles.modalBody}>
              <img
                src={active.img || PLACEHOLDER}
                alt={active.label}
                className={styles.modalImg}
                onError={(e) => {
                  if (
                    e.currentTarget.src !==
                    window.location.origin + PLACEHOLDER
                  ) {
                    e.currentTarget.src = PLACEHOLDER;
                  }
                }}
              />
              <h2 className={styles.modalTitle}>{active.label}</h2>
              <p className={styles.modalDesc}>{active.desc}</p>
              {active.tags?.length ? (
                <div className={styles.tags}>
                  {active.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
