# sphinx-needs 8.5.0 output fixture (REQ-398)

Real `needs.json` produced by sphinx-needs, not hand-written, so the
importer is tested against the format sphinx-needs actually emits.

- **Source:** useblocks' public demo, https://github.com/useblocks/sphinx-needs-demo
  at commit `3c602bfedf710d2304d22a93049d7233bba93285` (2026-07-30).
- **Built with:** sphinx-needs **8.5.0**, Sphinx 8.2.3, via
  `sphinx-build -b needs docs _build/needs` in the demo's own `uv` environment
  with `sphinx-needs[plotting]==8.5.0` installed over its locked 8.3.0.
- **Subset:** the full output has 362 needs (about 1 MB). This file keeps the
  top-level structure unchanged (`current_version`, `versions`, `needs_schema`)
  and 34 needs chosen to cover each of the 15 link fields the demo uses and
  each need type. Need entries are copied unmodified; re-serialized compactly
  with sorted keys.

To regenerate against a newer sphinx-needs release, rebuild the demo and
re-run the subset selection described above; the tests derive their expected
values from this file, so they need no edit unless the importer changes.
