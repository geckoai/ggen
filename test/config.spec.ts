import { describe } from "mocha";
import { expect } from "chai";
import { Core } from "../src";
import { Conf } from "../src/lib/Conf";

const {instance} = Core.run();

describe("open api transform", () => {
  it("Read config single mode yaml", async () => {
    const config = instance.readConfig("openapi.config.yaml");
    expect(config).instanceOf(Conf);
  });

  it("Read config monorepo mode yaml", async () => {
    const config = instance.readConfig("openapi.config.yml");
    console.log(config)
    expect(config).instanceOf(Conf);
  });

  //
  // it("Read config single mode, generate", async () => {
  //  await instance.generate("openapi.config.yaml");
  // }).timeout(100000);
});
