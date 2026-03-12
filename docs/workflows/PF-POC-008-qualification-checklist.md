# PF-POC-008 Demo Qualification Checklist

## Mandatory Gates

1. `npm run poc:qualify:demo`
2. `npm run verify:strict`
3. `npm run check:verification-fresh`

## Criteria Contract (Machine-Enforced)

The qualification gate is driven by `test/fixtures/poc/poc-demo-quality-criteria.json` and must enforce:

1. Minimum scenario count (`minimumScenarioCount`)
2. Required scenario IDs (`requiredScenarioIds`)
3. Required command coverage (`requiredCommandCoverage`)
4. Required timeline event coverage (`requiredEventTypes`)
5. Minimum retry and failure-branch coverage thresholds

## Pass/Fail Rule

Fail closed. Any missed criterion or failing command blocks milestone closure.
