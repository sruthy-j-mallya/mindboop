# 050 — Sample data on setup

Status: done
Date: 2026-11-25
Issue: #68

## Goal

A new developer runs `bin/setup` and can sign in to a development app that already shows every scenario: each list,
Home quarter, Calendar view, routine stat and session state has something on it, and every empty state can be seen too.

## Decisions

| Area | Choice |
| --- | --- |
| Entry point | `SampleData::SeederService#process!` (`app/services/sample_data/`) runs one seeder per resource, in order, inside one transaction. It raises in production |
| Seeders | `SampleData::Seeders::<Resource>Seeder < BaseSeeder`, each with `#process!`: users, user preferences, life areas, tasks, checklist items, routines, time logs, breaks, breadcrumbs, parking lot items, achievements. Data is declared as hashes in each seeder, so a scenario is added by adding an entry |
| Shared state | `SampleData::Context` holds one clock (`now`) and the records made so far by key (`context.tasks[:quarterly_report]`), so later seeders point at earlier records without lookups |
| Users | `demo@mindboop.test` (a few weeks in: everything), `focus@mindboop.test` (mid-session: a running timer after a break, thoughts parked, a curiosity time on), `new@mindboop.test` (every empty state, default preferences). All use `password123` |
| Re-running | The three sample users are deleted (with their data) and made again on each run; other users are untouched. Dates are relative to today, so re-running refreshes "today", "overdue" and "upcoming" |
| Times | Past days use daytime hours; today's sessions count back from now, so they're over whatever time setup runs and never overlap (the database refuses overlapping sessions) |
| Model rules | Records go through the models and services (`LifeAreas::DiscarderService`, `ParkingLotItem#convert_to_task!`) so callbacks and validations hold. Breaks are saved without validation, because the model only takes a break on a session in progress and dates it from now. The early-finish achievement is counted from the seeded sessions |
| Setup | `bin/setup` runs `bin/rails sample_data:load` after preparing the database (and after `--reset`); `--skip-sample-data` skips it. `bin/ci` runs setup, so CI also checks the seeders still pass the model rules |
| Tests | `test/services/sample_data/seeder_service_test.rb`: sign-in, re-runs, other users untouched, the scenarios per user, the production guard |
