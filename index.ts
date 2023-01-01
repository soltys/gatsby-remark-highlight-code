import { visit } from "unist-util-visit";

import { parseNodeHtml } from "./utils";

export default ({ markdownAST }, pluginOptions) => {
  visit(markdownAST, "code", (node) => {
    const html = parseNodeHtml(node, pluginOptions);

    node.type = "html";
    node.children = undefined;
    node.value = html;
  });

  return markdownAST;
};
