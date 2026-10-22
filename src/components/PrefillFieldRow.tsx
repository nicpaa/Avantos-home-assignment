import type { PrefillMapping } from "../domain/prefill/types";
import styles from "./PrefillFieldRow.module.css";

export interface PrefillFieldRowProps {
  field: string;
  mapping?: PrefillMapping;
  onOpen: () => void;
  onClear: () => void;
}

export function PrefillFieldRow({
  field,
  mapping,
  onOpen,
  onClear,
}: PrefillFieldRowProps) {
  if (!mapping) {
    return (
      <li className={`${styles.row} ${styles.empty}`}>
        <button
          type="button"
          aria-haspopup="dialog"
          className={styles.open}
          onClick={onOpen}
        >
          <DatabaseIcon />
          {field}
        </button>
      </li>
    );
  }

  return (
    <li className={`${styles.row} ${styles.mapped}`}>
      <span className={styles.chip}>
        {field}: {mapping.label}
      </span>
      <button
        type="button"
        className={styles.clear}
        aria-label={`Clear ${field}`}
        onClick={onClear}
      >
        ×
      </button>
    </li>
  );
}

function DatabaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
