import fs from 'fs';
import path from 'path';

interface AllureTestObject {
    id: number;
    selector: string;
}

interface AllureTestPlan {
    version: string;
    tests: Array<AllureTestObject>;
}

const findTestFiles = (directory: string, filter: string | RegExp, fileList: Array<string> = []) => {
    const matcher = typeof filter === 'string' ? new RegExp(filter) : filter;
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
        const filePath = path.join(directory, file);
        const fileStat = fs.lstatSync(filePath);

        if (fileStat.isDirectory()) {
            findTestFiles(filePath, filter, fileList);
        } else if (matcher.test(filePath)) {
            fileList.push(path.resolve(filePath));
        }
    });

    return fileList;
};

const readTestPlan = (file: string) => {
    const filePath = path.resolve(file);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as AllureTestPlan;
};

const pickTestIds = (testPlan: AllureTestPlan) => {
    const testsList: Array<number> = [];
    if (testPlan.tests.length) {
        for (const test of testPlan.tests) {
            testsList.push(test.id);
        }
    }
    return testsList;
};

const filterTestsByIds = (file: string, testsList: Array<number>, target: string) => {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    fs.readFile(file, (error, data) => {
        if (error) throw new Error();
        if (testsList.some((v) => data.includes(`allure.id('${v}')`))) {
            fs.copyFile(file, `${target}${path.parse(file).base}`, (error) => {
                if (error) throw new Error();
            });
        }
    });
};

const testPlan = process.env.ALLURE_TESTPLAN_PATH || process.argv[2] || './testplan.json';
const testDirectory = process.env.PLAYWRIGHT_TEST_DIR || process.argv[3] || './tests/';
const testsMatch = process.env.PLAYWRIGHT_TEST_MATCH || process.argv[4] || '.*(test|spec)\\.(js|ts|mjs)';
const targetDirectory = process.env.PLAYWRIGHT_TEST_TARGET || process.argv[5] || './tests/selected/';

const testPlanFile = readTestPlan(testPlan);
const testIds = pickTestIds(testPlanFile);
const testFiles = findTestFiles(testDirectory, testsMatch);

if (testFiles.length && testIds.length) {
    for (const test of testFiles) {
        filterTestsByIds(test, testIds, targetDirectory);
    }
}
