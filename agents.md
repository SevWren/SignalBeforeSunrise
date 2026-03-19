AGENTS.md
1. Project Identity
App Name: SignalBeforeSunrise
Repo Root: SignalBeforeSunrise/
Entry Point: TBD
Primary Language: TBD
GUI Framework: TBD
Platform Target: Windows primary · headless/CI cross-platform
Current Phase: Active Development
Coverage Baseline: 80%
Owner: SevWren
2. Module Map
Directory	Purpose
src/core/	Core business logic and state management
src/cli/	Command-line interface and dependency injection setup
src/utils/	Shared utilities and helpers
tests/	Unit and integration tests
3. Essential Commands
Install: Standard package manager install command
Run: Execution command for the entry point
Test: Standard test runner command
Coverage: Command to generate coverage reports
Quality Gates: Linting and formatting checks
Docs Safety: lychee docs/**/*.md
Build: Standard build command
Debug: Debugger attachment command
Benchmark: Performance benchmarking command
4. Coding Standards
Style: Adhere to the canonical style guide for the primary language.
Docstrings: Require comprehensive docstrings for all public APIs.
Module Size: Keep modules focused and concise. Refactor large files.
Import Discipline: Group imports logically. Avoid circular dependencies.
State Authority: Maintain clear ownership of state. Avoid scattered mutable state.
Versioning: Follow strict Semantic Versioning.
5. Testing Standards
Framework: Use the standard testing framework for the primary language.
Determinism: Tests must be 100% deterministic. Mock all external I/O and time.
Isolation: Tests must not depend on execution order or shared state.
Coverage Thresholds: Maintain the established coverage baseline.
Exclusions: Explicitly document any files excluded from coverage.
6. Commit and PR Standards
Commit Format: Use Conventional Commits (e.g., feat:, fix:, docs:).
Commit Hygiene: Keep commits atomic and focused on a single logical change.
PR Checklist:
All tests pass.
Coverage meets the baseline.
Documentation is updated.
CI quality gates pass.
7. Docs Link Safety
Enforcement: All documentation links must be valid and verifiable.
Lychee: Use lychee to check for dead links in Markdown files.
8. Current Migration Context
Maintain current architectural standards unless explicitly instructed otherwise.
9. Agent Rules and Skills
Skill Loading: Load relevant local skill files when operating in specific domains.
Application: Apply skills consistently with repository standards.
10. Behavioral Constraints
Must Always: Read files before editing. Verify changes against tests and linters.
Must Never: Commit secrets, break the build, or introduce flaky tests.
When Uncertain: Stop and ask for clarification rather than guessing.
11. Key Architectural Patterns
State Flow: Clear, predictable state transitions.
CLI DI Flow: Dependency injection configured at the CLI entry point.
Test Structure: Tests mirror the src/ directory structure.
12. Output Formats and Config
Formats: Standardized output formats (e.g., JSON) for structured data.
Config Defaults: Documented in the repository's configuration files.
Last updated: 2026-03-19