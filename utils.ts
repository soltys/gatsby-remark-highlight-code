import { toString } from "mdast-util-to-string";
import { escape } from "lodash";

/**
 * Returns the parsed language and the highlighted lines.
 * For example, ```dart{3, 2, 5-9} will output {lang: 'dart', highlightLines: '3 2 5,9'}
 * which is compatible with the <deckdeckgo-highlight-code> component (https://docs.deckdeckgo.com/?path=/story/components-highlight-code--highlight-code)
 */

type LangNode = {
  lang?: string | null | undefined;
  meta?: string | null | undefined;
}

export const parseLanguageAndHighlightedLines = ({ lang, meta }: LangNode): { lang: string, highlightLines: string } => {
  const highlightLinesRegex = /{(.*?)}/g;

  const joinedNodeLang = `${lang}${meta !== null && meta !== undefined ? meta : ""
    }`;

  let parsedLang = joinedNodeLang;
  let highlightLines = "";
  const regexExecResults = highlightLinesRegex.exec(joinedNodeLang);

  if (!regexExecResults) {
    // no lines to highlight
    return {
      lang: parsedLang,
      highlightLines,
    };
  }

  let [highlightText, numbersAndGroups] = regexExecResults;

  parsedLang = parsedLang.replace(highlightText, "").trim();
  highlightLines = numbersAndGroups
    .split(",")
    //@ts-ignore
    .reduce((acc, chunk) => {
      const numbOrGroup = chunk.trim();
      if (numbOrGroup.includes("-")) {
        // is a group of numbers. e.g. {3-10}
        return [...acc, numbOrGroup.replace("-", ",")];
      }
      return [...acc, numbOrGroup];
    }, [])
    //@ts-ignore
    .join(" ");

  return {
    lang: parsedLang,
    highlightLines,
  };
};

function generatePropsString(pluginOptions) {
  if (!pluginOptions) {
    return "";
  }

  let str = "";
  const { terminal, lineNumbers, editable, theme } = pluginOptions;

  if (terminal) {
    str += `terminal="${pluginOptions.terminal}" `;
  }

  if (theme) {
    str += `theme="${pluginOptions.theme}" `;
  }

  if (lineNumbers === true) {
    str += `line-numbers="true" `;
  }

  if (editable === true) {
    str += `editable="true" `;
  }

  return str;
}

export function parseNodeHtml(node, pluginOptions) {
  let lang = "";
  let highlightLines: string | undefined = undefined;

  if (node && node.lang !== null) {
    ({ lang, highlightLines } = parseLanguageAndHighlightedLines(node));
  }
  const text = toString(node);
  const properties = generatePropsString(pluginOptions);

  const renderLang =
    lang !== "" && lang !== undefined ? `language="${lang}"` : "";
  const renderHighlightLines =
    highlightLines !== "" && highlightLines !== undefined
      ? `highlight-lines="${highlightLines}"`
      : "";

  return `<deckgo-highlight-code ${renderLang} ${properties} ${renderHighlightLines}>
          <code slot="code">${escape(text)}</code>
        </deckgo-highlight-code>
      `.trim();
}


