# Changelog

## [0.1.1] - 2026-06-02

### Added
- Detection of the delphi-dev Claude Code plugin. When a command is run and the
  plugin is missing, a one-time reminder shows the install commands, with buttons
  to copy them or open the plugin page.

### Changed
- README "Requirements" now clearly separates the two dependencies (Claude Code
  extension vs. delphi-dev plugin) and documents how to install the plugin.

## [0.1.0] - 2026-04-04

### Added
- Sidebar with Delphi Dev commands (Write, Review, Audit, Spec, TDD, New Project)
- Context menu integration for Delphi files (.pas, .dpr, .dfm, .dpk, .inc, .fmx)
- Status bar indicator for Delphi projects
- Automatic .claudeignore creation for Delphi projects
- 12 Delphi code snippets following delphi-dev coding standards
- Editor defaults for Pascal files (2-space indent, 120-char ruler)
- Claude Code integration via URI handler
- Command palette support for all delphi-dev commands
