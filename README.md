# Substack Inline LaTeX for Firefox

A small Firefox extension for writing inline math in the Substack editor. Type `$x^2$` and it becomes Substack's own rendered inline LaTeX. Paste a draft that contains `$...$` and every formula in it is converted at once.

Readers do not need the extension. It only inserts Substack's built-in inline math element, so the published post renders for everyone.

## Install

**For testing (temporary, removed when Firefox closes)**
1. Download or clone this repository.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and choose `manifest.json`.
4. Open a Substack draft and type `$\frac{1}{2}$`.

**Permanent install** needs the add-on to be signed by Mozilla, for example as an unlisted self-distributed add-on through [addons.mozilla.org](https://addons.mozilla.org/developers/) or with `web-ext sign`.

Firefox 128 or newer is required, because the script must run in the page's own context (`"world": "MAIN"`) to reach the editor.

## How it works

- **Typing.** When you type a closing `$`, the text back to the previous `$` in the same paragraph becomes an inline math node.
- **Pasting.** After a paste, every `$...$` in the post becomes an inline math node, except text formatted as code.
- **Prices are safe.** Following the TeX and Pandoc rule, there must be no space just inside either dollar. So `$x$` converts, while `$5 and $10` stays text.
- **Literal dollars.** A dollar right after a backslash, as in `\$`, does not close a formula.
- **Display math** (`$$...$$`) is not handled. Use Substack's own LaTeX block from the editor's insert menu.

The extension runs only on `https://*.substack.com/publish/post/*`, makes no network requests and stores nothing.

## Caveats

This relies on Substack's internal `inline_latex` editor node and its `persistentExpression` attribute, which are undocumented and can change without notice. Check the preview before publishing.

## Tests

```
node test.mjs
```

The tests cover the parsing rules. The editor part needs a real Substack draft and has to be checked by hand.

## Credit

The idea, and the discovery that Substack has an `inline_latex` node, come from [Substack_InlineLatex_Extension](https://github.com/asprgchong/Substack_InlineLatex_Extension) by asprgchong, a Chrome extension. That repository has no license, so no code is copied from it. This is an independent implementation for Firefox, with paste conversion and the no-space rule added.

## License

MIT, see [LICENSE](LICENSE).
