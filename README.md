# Allurectl Playwright Filter

## 📇 How it works

1. Gets list of test-cases IDs from Allure TestOps launch
2. Collects a list of test files in the specified directory
3. Filters test files that match ID from Allure TestOps launch
4. Copies files to the specified directory

## 🚀 Quick start

1. Download source code

```bash
wget https://github.com/eftech-open/allurectl-playwright-filter/blob/master/src/allure-filter.ts -O <your_repository_path>
```

2. Add script steps to your CI-file

```yaml
- allurectl job-run plan --job-run-id $ALLURE_JOB_RUN_ID --output-file testplan.json
- npx ts-node ./tools/allure-filter.ts
- allurectl watch -- npx playwright test ./tests/selected/
```

3. Run test launch from Allure TestOps

## ⚙️ Variables and args

Variables allow you to set options for filtering tests

| Variables              | Description                                  | Default                       |
|------------------------|----------------------------------------------|-------------------------------|
| ALLURE_TESTPLAN_PATH   | Path to testplan file                        | `./testplan.json`             |
| PLAYWRIGHT_TEST_DIR    | Directory with test files                    | `./tests/`                    |
| PLAYWRIGHT_TEST_MATCH  | Regex filter for test files                  | `.*(test\spec)\\.(js\ts\mjs)` |
| PLAYWRIGHT_TEST_TARGET | Target directory to copy selected test files | `./tests/selected/`           |

Also, launch options can be set via arguments, for instance:

```bash
- npx ts-node <repository_path>/allure-filter.ts './testplan.json' './tests/e2e' '.*(test|spec)\\.ts' './tmp/allurectl-tests/'
```

## 🤖 Continuous Integration

GitLab CI

```yaml
stages:
  - test

tests:
  stage: test
  script:
    - allurectl job-run plan --job-run-id $ALLURE_JOB_RUN_ID --output-file testplan.json
    - npx ts-node ./tools/allure-filter.ts
    - allurectl watch -- npx playwright test ./tests/selected
```

GitHub Actions

```yaml
  - name: Test with Playwright
    env:
      ALLURE_JOB_RUN_ID: ${{ github.event.inputs.ALLURE_JOB_RUN_ID }}
    run: |
      allurectl job-run plan --job-run-id $ALLURE_JOB_RUN_ID --output-file testplan.json
      npx ts-node ./tools/allure-filter.ts
      allurectl watch -- npx playwright test ./tests/selected
```
