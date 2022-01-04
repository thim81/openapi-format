const testUtils = require('../test/__utils__/test-utils')

describe("openapi-format CLI command", () => {

    it("should output the version", async () => {
        let result = await testUtils.cli([`--version`], '.');
        // console.log('result', result)
        expect(result.code).toBe(0);
    });
})
