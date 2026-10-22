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
          {field}
        </button>
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <span>
        {field}: {mapping.label}
      </span>
      <button type="button" aria-label={`Clear ${field}`} onClick={onClear}>
        ×
      </button>
    </li>
  );
}
