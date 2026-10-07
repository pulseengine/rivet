#!/usr/bin/env bash
# Cargo test-binary runner that caps the TEST process's address space (#1031).
#
# The nightly mutation shards run under `ulimit -v 50331648` (48 GiB), set for
# the whole step (#590). The lean-mem runners have a 32 GiB cgroup ceiling, so
# that cap can never fire: a mutant that breaks a parser's advance loop
# allocates without bound, hits the cgroup OOM-killer first, and takes the
# runner down with it — shard 13 (all of yaml_cst.rs) lost its runner every
# night. Lowering the step-wide cap would also cap rustc, whose compile peak
# is what --jobs 2 was sized for. Cargo runs every test binary through
# `target.<triple>.runner`; this wrapper is that runner, so only the test
# process is capped: a runaway mutant fails with ENOMEM inside its own process,
# cargo-mutants records it, and the runner survives.
#
# MEMCAP_KB overrides the cap (KiB). The default, 12 GiB, leaves room for two
# concurrent test processes (--jobs 2) plus a compile under the 32 GiB ceiling.
#
# Usage (as a cargo runner): CARGO_TARGET_<TRIPLE>_RUNNER=/abs/path/memcap.sh
set -euo pipefail
ulimit -v "${MEMCAP_KB:-12582912}"
exec "$@"
