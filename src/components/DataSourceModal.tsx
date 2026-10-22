import { useEffect } from "react";
import type { DataSource, DataSourceContext } from "../domain/dataSources/types";
import type { PrefillMapping } from "../domain/prefill/types";
import styles from "./DataSourceModal.module.css";

export interface DataSourceModalProps {
  /** Rendered as given: the modal knows the interface, never a concrete source. */
  sources: readonly DataSource[];
  context: DataSourceContext;
  onSelect: (mapping: PrefillMapping) => void;
  onClose: () => void;
}

const TITLE = "Select data element to map";

export function DataSourceModal({
  sources,
  context,
  onSelect,
  onClose,
}: DataSourceModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Hide sources and groups with nothing to offer, e.g. no dependencies for a root form.
  const sections = sources
    .map((source) => ({
      source,
      groups: source.getOptions(context).filter((group) => group.options.length > 0),
    }))
    .filter(({ groups }) => groups.length > 0);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TITLE}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{TITLE}</h2>
        {sections.length === 0 && <p>No data available to prefill from.</p>}
        {sections.map(({ source, groups }) => (
          <section key={source.id} aria-label={source.label}>
            <h3>{source.label}</h3>
            {groups.map((group) => (
              <div key={group.id} role="group" aria-label={group.label}>
                <h4>{group.label}</h4>
                <ul>
                  {group.options.map((option) => (
                    <li key={option.key}>
                      <button
                        type="button"
                        onClick={() =>
                          onSelect({
                            sourceId: source.id,
                            optionKey: option.key,
                            label: `${group.label}.${option.label}`,
                          })
                        }
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
