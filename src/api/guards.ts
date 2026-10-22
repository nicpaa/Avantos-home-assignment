import type { BlueprintGraph, Form, FormField, GraphNode, Position } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPosition(value: unknown): value is Position {
  return isRecord(value) && typeof value.x === "number" && typeof value.y === "number";
}

function isGraphNode(value: unknown): value is GraphNode {
  if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value.data)) {
    return false;
  }
  const { name, component_id, prerequisites } = value.data;
  return (
    (value.position === undefined || isPosition(value.position)) &&
    typeof name === "string" &&
    typeof component_id === "string" &&
    isStringArray(prerequisites)
  );
}

function isFormField(value: unknown): value is FormField {
  return isRecord(value) && typeof value.avantos_type === "string";
}

function isForm(value: unknown): value is Form {
  if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value.field_schema)) {
    return false;
  }
  const { properties } = value.field_schema;
  return isRecord(properties) && Object.values(properties).every(isFormField);
}

/**
 * Checks only the fields the app reads; extra fields are ignored,
 * so additions on the backend don't break the client.
 */
export function isBlueprintGraph(value: unknown): value is BlueprintGraph {
  return (
    isRecord(value) &&
    Array.isArray(value.nodes) &&
    value.nodes.every(isGraphNode) &&
    Array.isArray(value.forms) &&
    value.forms.every(isForm)
  );
}
