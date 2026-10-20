// Runs in the page's own JS world ("world": "MAIN") so it can reach the Tiptap editor
// that Substack attaches to its .ProseMirror element.

// Inline math follows the TeX/Pandoc rule: no space just inside either dollar,
// so prices like "$5 and $10" are left alone.
const INLINE_MATH = /\$(?!\s)([^$\n]*?[^\s$\\])\$/g;

// The LaTeX of the "$..." the user is closing by typing "$", or null.
function openMathBefore(text) {
  const open = text.lastIndexOf("$");
  if (open < 0) return null;
  const latex = text.slice(open + 1);
  if (!latex || /^\s|\s$/.test(latex) || latex.endsWith("\\")) return null;
  return { open, latex };
}

// Every complete $...$ in a string, as [{start, end, latex}].
function findInlineMath(text) {
  return [...text.matchAll(INLINE_MATH)].map((m) => ({
    start: m.index,
    end: m.index + m[0].length,
    latex: m[1],
  }));
}

function editorOf(el) {
  const root = el && el.closest && el.closest(".ProseMirror");
  const editor = root && root.editor;
  return editor && editor.schema.nodes.inline_latex ? editor : null;
}

function mathNode(editor, latex) {
  return editor.schema.nodes.inline_latex.create({ persistentExpression: latex });
}

// Typing the closing "$" turns "$x^2" into rendered math.
function onKeydown(e) {
  if (e.key !== "$" || e.ctrlKey || e.metaKey || e.isComposing) return;
  const editor = editorOf(e.target);
  if (!editor) return;
  const { state } = editor.view;
  const { $from, empty } = state.selection;
  if (!empty) return;
  // Non-text inline nodes count as one character, like their document position.
  const before = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
  const hit = openMathBefore(before);
  if (!hit) return;
  e.preventDefault();
  const from = $from.pos - (before.length - hit.open);
  editor.view.dispatch(state.tr.replaceWith(from, $from.pos, mathNode(editor, hit.latex)));
}

// Pasted text never fires the keydown above, so convert every $...$ after a paste.
function convertAll(editor) {
  const { state } = editor.view;
  const hits = [];
  state.doc.descendants((node, pos) => {
    if (!node.isText) return;
    if (node.marks.some((m) => m.type.name === "code")) return;
    for (const h of findInlineMath(node.text)) hits.push({ ...h, pos });
  });
  if (!hits.length) return;
  const tr = state.tr;
  // Back to front, so earlier positions stay valid.
  for (const h of hits.reverse()) {
    tr.replaceWith(h.pos + h.start, h.pos + h.end, mathNode(editor, h.latex));
  }
  editor.view.dispatch(tr);
}

function onPaste(e) {
  const editor = editorOf(e.target);
  if (editor) setTimeout(() => convertAll(editor), 0);
}

if (typeof document !== "undefined") {
  document.addEventListener("keydown", onKeydown, true);
  document.addEventListener("paste", onPaste, true);
}
