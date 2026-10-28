---
name: Refactoring task (fix hotspot)
about: A source file keeps being fixed; restructure it instead of adding another spot fix.
title: "refactor: <file> — <what the split or restructuring is>"
labels: refactor
---

<!-- Opened because the Fix hotspot check (REQ-409, tools/ci/fix-hotspot.py)
     fired, or because you saw the same file being fixed over and over.
     Keep the `refactor` label: a fix PR that cites this open issue in its
     body passes the check. Close the issue when the refactor has landed. -->

## Hotspot

- File: `<path>`
- Fix commits on `main` in the window: `<count>` in `<days>` days
  (`python3 tools/ci/fix-hotspot.py --base origin/main --distribution`)
- The fix that triggered this: #<PR>

## What keeps breaking

<!-- Read the fixes counted above. What do they have in common: one function
     that does too much, one data shape handled in several places, a missing
     abstraction? -->

## Proposed restructuring

<!-- The split or restructuring, concretely: which module(s) it becomes,
     what moves where. -->

## Acceptance

- [ ] Behaviour unchanged: the existing tests pass without edits to their assertions.
- [ ] Landed as `refactor:` commit(s), no behaviour change mixed in.
- [ ] The file's fix count is expected to fall; if the file is split, the fixes go to the new modules.
