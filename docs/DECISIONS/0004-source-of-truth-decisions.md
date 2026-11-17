# 0004 â€” Source of truth decisions (Q-S1 to Q-S6)

Status: **Confirmed** by the project owner, after Phase 1 verification. All six decisions are closed.

## Q-S1 â€” Authoritative source

- `SOP L1 AGIT.xlsx` is the authoritative P2 workbook.
- Any future file with a different hash undergoes source re-verification before use.
- **Hash confirmed by the owner (Phase 2 approval):** SHA-256 `AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092`. The earlier quoted value containing `DE3BCC` was a typo; the correct sequence is `DEB3CC`. The identity stays pinned in `SOURCE_OF_TRUTH.md`. Ingestion must refuse any file that does not match.

## Q-S2 â€” Cached formula values (approved with restrictions)

- Preserve cached values as source snapshots.
- Preserve formula text and formula-origin metadata where available.
- Never treat cached values as approved business calculations.
- Do not evaluate external workbook dependencies.
- Document stale-cache conditions (`SOURCE_OF_TRUTH.md` section 7).

## Q-S3 â€” Link-only rows

- Rows 3526, 3535, 3537, 3538, 3539, 3540 are not activity records.
- Preserve original content and Excel row numbers; classify separately; never discard silently.

## Q-S4 â€” Unreviewed rows

- Rows 3239â€“3490 are included in source preservation and inspection, marked unreviewed.
- Not automatically invalid. Excluded from approved business assessments until eligibility rules are defined.

## Q-S5 â€” Pivot area

- AL:BI is excluded from activity-record ingestion. The workbook is unchanged. The exclusion is documented.

## Q-S6 â€” Data sensitivity

- Sensitive internal operational data. Not committed to a public repository.
- `.gitignore` excludes spreadsheet, CSV and local data files.
- Source values are not exposed in logs or public documentation.

## Not decided here

Business definitions Q-B1 to Q-B11 remain unresolved (`0003-open-questions.md`). No calculation, schema, or eligibility rule is approved by this record.
