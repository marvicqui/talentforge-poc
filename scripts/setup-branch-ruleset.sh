#!/usr/bin/env bash
# Aplica el ruleset de protección a main.
# Corre cuando el repo sea público (Fase 9) o si activas GitHub Pro.
# Requisitos: gh CLI autenticado con scope admin/repo.
set -euo pipefail

REPO="${1:-marvicqui/talentforge-poc}"

tmp=$(mktemp)
cat > "$tmp" <<'JSON'
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    }
  ]
}
JSON

echo "Applying ruleset to $REPO ..."
gh api -X POST "repos/$REPO/rulesets" \
  -H "Accept: application/vnd.github+json" \
  --input "$tmp"
echo "Done."
rm -f "$tmp"
