const path = require("path");
const exec = require("child_process").exec;

describe("CLI command", () => {
    it("should run a prototype project by default", async () => {
        let result = await cli(["new", sandbox], ".");
        expect(result.code).toBe(0);
        expect(result.stdout).toContain("prototyping");
    });
})

function cli(args, cwd) {
    return new Promise(resolve => {
        exec(
            `node ${path.resolve("./bin/cli")} ${args.join(" ")}`,
            { cwd },
            (error, stdout, stderr) => {
                resolve({
                    code: error && error.code ? error.code : 0,
                    error,
                    stdout,
                    stderr
                });
            }
        );
    });
}
