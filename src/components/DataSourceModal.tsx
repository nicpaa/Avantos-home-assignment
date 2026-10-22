import { useEffect, useRef, useState } from "react";
import { searchGroups } from "../domain/dataSources/search";
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
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Move focus into the dialog, onto the search box, so typing filters right away.
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Hide sources and groups with nothing to offer: no dependencies for a root form,
  // or nothing matching the search.
  const sections = sources
    .map((source) => ({
      source,
      groups: searchGroups(source.getOptions(context), query).filter(
        (group) => group.options.length > 0,
      ),
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
        <h2 className={styles.title}>{TITLE}</h2>
        <input
          ref={searchRef}
          type="search"
          aria-label="Search data elements"
          placeholder="Search"
          className={styles.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles.body}>
          {sections.length === 0 && (
            <p className={styles.empty}>
              {query.trim() === ""
                ? "No data available to prefill from."
                : `Nothing matches "${query.trim()}".`}
            </p>
          )}
          {sections.map(({ source, groups }) => (
            <section key={source.id} aria-label={source.label} className={styles.source}>
              <h3 className={styles.sourceTitle}>{source.label}</h3>
              {groups.map((group) => (
                <div key={group.id} role="group" aria-label={group.label}>
                  <h4 className={styles.groupTitle}>{group.label}</h4>
                  <ul className={styles.options}>
                    {group.options.map((option) => (
                      <li key={option.key}>
                        <button
                          type="button"
                          className={styles.option}
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
        </div>
        <div className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
