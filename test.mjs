// node test.mjs - checks the parsing rules of content.js without a browser.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("./content.js", import.meta.url), "utf8"), ctx);
const { openMathBefore, findInlineMath } = ctx;
// Array.from: results are arrays of the vm realm, which deepEqual treats as different.
const latexes = (s) => Array.from(findInlineMath(s), (h) => h.latex);

// typing the closing $
assert.deepEqual({ ...openMathBefore("area $\\pi r^2") }, { open: 5, latex: "\\pi r^2" });
assert.equal(openMathBefore("costs $5 and "), null); // space before the closing $
assert.equal(openMathBefore("costs $ 5"), null); // space after the opening $
assert.equal(openMathBefore("no math"), null);
assert.equal(openMathBefore("empty $"), null);
assert.equal(openMathBefore("escaped $a\\"), null); // typing \$ stays literal

// pasted text
assert.deepEqual(latexes("for each $\\ell$ there are $2\\ell + 1$ modes"), ["\\ell", "2\\ell + 1"]);
assert.deepEqual(latexes("prices $5 and $10 stay text"), []);
assert.deepEqual(latexes("$x$"), ["x"]);
assert.deepEqual(latexes("$\\sqrt{2/5} \\approx 0.63$."), ["\\sqrt{2/5} \\approx 0.63"]);
const [h] = findInlineMath("ab $c$ d");
assert.equal("ab $c$ d".slice(h.start, h.end), "$c$");

console.log("all tests pass");
