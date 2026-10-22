import type { BlueprintGraph, Form, GraphNode } from "../../api/types";

/**
 * Trimmed copy of the mock server's graph.json, same DAG and ids:
 * A → B, C; B → D; C → E; D, E → F.
 */
export const NODE_IDS = {
  FORM_A: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
  FORM_B: "form-a4750667-d774-40fb-9b0a-44f8539ff6c4",
  FORM_C: "form-7c26f280-7bff-40e3-b9a5-0533136f52c3",
  FORM_D: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
  FORM_E: "form-e15d42df-c7c0-4819-9391-53730e6d47b3",
  FORM_F: "form-bad163fd-09bd-4710-ad80-245f31b797d5",
} as const;

// As in the real payload, A, D, E and F share one form.
export const FORM_IDS = {
  SHARED: "f_01jk7ap2r3ewf9gx6a9r09gzjv",
  B: "f_01jk7awbhqewgbkbgk8rjm7bv7",
  C: "f_01jk7aygnqewh8gt8549beb1yc",
} as const;

function node(
  id: string,
  name: string,
  formId: string,
  prerequisites: string[],
): GraphNode {
  return { id, data: { name, component_id: formId, prerequisites } };
}

// "button" is kept so field filtering is exercised.
function form(id: string): Form {
  return {
    id,
    field_schema: {
      properties: {
        button: { avantos_type: "button" },
        email: { avantos_type: "short-text" },
        name: { avantos_type: "short-text" },
        notes: { avantos_type: "multi-line-text" },
      },
    },
  };
}

export const blueprintGraph: BlueprintGraph = {
  nodes: [
    node(NODE_IDS.FORM_A, "Form A", FORM_IDS.SHARED, []),
    node(NODE_IDS.FORM_B, "Form B", FORM_IDS.B, [NODE_IDS.FORM_A]),
    node(NODE_IDS.FORM_C, "Form C", FORM_IDS.C, [NODE_IDS.FORM_A]),
    node(NODE_IDS.FORM_D, "Form D", FORM_IDS.SHARED, [NODE_IDS.FORM_B]),
    node(NODE_IDS.FORM_E, "Form E", FORM_IDS.SHARED, [NODE_IDS.FORM_C]),
    node(NODE_IDS.FORM_F, "Form F", FORM_IDS.SHARED, [NODE_IDS.FORM_D, NODE_IDS.FORM_E]),
  ],
  forms: [form(FORM_IDS.SHARED), form(FORM_IDS.B), form(FORM_IDS.C)],
};
