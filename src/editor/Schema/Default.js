import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";

export default function generateBaseSchema(editor) {
  return new Schema({
    nodes: addListNodes(
      schema.spec.nodes.subtract({ heading: "heading" }),
      "paragraph block*",
      "block"
    ),
    marks: schema.spec.marks,
  });
}
