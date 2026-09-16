#!/usr/bin/env bash
# Runs `rivet validate` and gates the compliance action on its exit code.
#
# #953: the previous inline step captured `rivet validate`'s exit code as
# `RC` and then never used it, and inferred PASS/FAIL from grepping the
# tool's stdout for "Result: PASS". Two failure modes fell through to a
# green step:
#   * a non-zero validate exit whose output still contained "Result: PASS"
#     somewhere -> the grep matched and the step exited 0;
#   * a validate panic that printed nothing -> `result=FAIL`, but the
#     last command was an echo so the step still exited 0.
# Both are dangerous on the release path (`build-compliance` gates
# `create-release` in .github/workflows/release.yml), so this script
# treats the exit code as the source of truth:
#   * echoes validate's captured output verbatim;
#   * writes `result=PASS` when rc == 0, `result=FAIL` otherwise, to
#     $GITHUB_OUTPUT when set;
#   * exits with the same exit code so a failed validate fails the step.
#
# Usage:
#   run_validate.sh [project-dir]
#
# `project-dir` defaults to the current directory. `rivet` must be on PATH.

set -uo pipefail

PROJECT_DIR="${1:-.}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "::error::project-dir not found: ${PROJECT_DIR}" >&2
    exit 2
fi

cd "$PROJECT_DIR"

set +e
OUTPUT="$(rivet validate 2>&1)"
RC=$?
set -e

printf '%s\n' "$OUTPUT"

if [ "$RC" -eq 0 ]; then
    RESULT=PASS
else
    RESULT=FAIL
fi

if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "result=${RESULT}" >> "$GITHUB_OUTPUT"
fi

exit "$RC"
