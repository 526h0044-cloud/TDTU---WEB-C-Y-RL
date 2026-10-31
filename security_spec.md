# Security Specification: Săn Điểm Rèn Luyện (ĐRL) Monitor

## 1. Data Invariants
- Posts must have a valid ID format (hash string max 128 chars).
- Posts cannot have rawContent exceeding 10,000 characters to prevent resource exhaustion attacks.
- Classification must strictly be one of `['definite', 'potential', 'none']`.
- Deduplication is guaranteed by document ID matching `postId` (deterministic hash of Facebook post URL/ID).
- Groups must have valid URLs and names under max length bounds.
- All write timestamps (`createdAt`, `updatedAt`) must maintain data integrity.

## 2. The "Dirty Dozen" Payloads (Attacks To Block)
1. **Ghost Field Injection**: Adding an unpermitted `__isAdminFlag: true` into a post document during creation.
2. **Post Size Denial-of-Wallet**: A post payload containing a 1MB `rawContent` string designed to exhaust Firestore quotas.
3. **Invalid Classification Enum**: Setting `classification: "guaranteed_100_percent_free_points_now"` instead of `definite`, `potential`, or `none`.
4. **Id Poisoning**: Using a 500-character malicious document ID containing path traversal characters like `../../admin`.
5. **Array Poisoning in keyPhrases**: Inserting 500 items into `keyPhrases` to overload read/write bandwidth.
6. **Array Poisoning in formUrls**: Inserting 500 items into `formUrls`.
7. **Negative Confidence Value**: Submitting confidence as `-999` or non-number.
8. **Group Name Oversized**: Submitting a group name exceeding 200 characters.
9. **Group URL Oversized**: Submitting a URL exceeding 500 characters.
10. **Orphaned Post Creation**: Creating a post with an empty `id` or malformed ID characters.
11. **Scan Log Negative Counts**: Negative numbers for `groupsScanned` or `newPostsFound`.
12. **Status Shortcutting / Non-string Injection**: Setting `status` in `scan_logs` to an array or nested object.

## 3. Security Rules Design
Rules will enforce strict types, max lengths, array length restrictions, and schema boundaries across `groups`, `posts`, and `scan_logs`.
