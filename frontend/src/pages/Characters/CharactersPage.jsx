import React, { useMemo, useState, useEffect } from "react";
import styles from "./CharactersPage.module.css";

// 🔎 Demo data — point these at your real images when you add them.
// We added onError fallback so missing images use a placeholder.
const ITEMS = [
  // Alphabets
  {
    id: "A",
    label: "A",
    category: "Alphabet",
    img: "/images/signs/A.png",
    desc: "The ASL sign for the letter A.",
  },
  {
    id: "B",
    label: "B",
    category: "Alphabet",
    img: "/images/signs/B.png",
    desc: "The ASL sign for the letter B.",
  },
  {
    id: "C",
    label: "C",
    category: "Alphabet",
    img: "/images/signs/C.png",
    desc: "The ASL sign for the letter C.",
  },
  {
    id: "D",
    label: "D",
    category: "Alphabet",
    img: "/images/signs/D.png",
    desc: "The ASL sign for the letter D.",
  },
  {
    id: "E",
    label: "E",
    category: "Alphabet",
    img: "/images/signs/E.png",
    desc: "The ASL sign for the letter E.",
  },
  {
    id: "F",
    label: "F",
    category: "Alphabet",
    img: "/images/signs/F.png",
    desc: "The ASL sign for the letter F.",
  },
  // Greetings
  {
    id: "HELLO",
    label: "Hello",
    category: "Greeting",
    img: "/images/signs/hello.png",
    desc: "Friendly greeting gesture.",
  },
  {
    id: "THANKS",
    label: "Thank you",
    category: "Greeting",
    img: "/images/signs/thankyou.png",
    desc: "Gesture to express thanks.",
  },
  {
    id: "PLEASE",
    label: "Please",
    category: "Greeting",
    img: "/images/signs/please.png",
    desc: "Polite request gesture.",
  },
  {
    id: "SORRY",
    label: "Sorry",
    category: "Greeting",
    img: "/images/signs/sorry.png",
    desc: "Apology gesture.",
  },
  // Basics
  {
    id: "YES",
    label: "Yes",
    category: "Basic",
    img: "/images/signs/yes.png",
    desc: "Affirmative response.",
  },
  {
    id: "NO",
    label: "No",
    category: "Basic",
    img: "/images/signs/no.png",
    desc: "Negative response.",
  },
];

const PLACEHOLDER = "/images/signs/placeholder.png";

export default function CharactersPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ITEMS;
    return ITEMS.filter(
      (it) =>
        it.label.toLowerCase().includes(s) ||
        it.category.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className={styles.page}>
      {/* Search bar */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search characters (e.g., A, Hello, Thank you)…"
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
                src={it.img}
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
        {filtered.length === 0 && (
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
                src={active.img}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
