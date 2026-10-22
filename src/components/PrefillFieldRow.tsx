import type { PrefillMapping } from "../domain/prefill/types";
import styles from "./PrefillFieldRow.module.css";

export interface PrefillFieldRowProps {
  field: string;
  mapping?: PrefillMapping;
  onClear: () => void;
}

export function PrefillFieldRow({ field, mapping, onClear }: PrefillFieldRowProps) {
  if (!mapping) {
    return <li className={`${styles.row} ${styles.empty}`}>{field}</li>;
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
