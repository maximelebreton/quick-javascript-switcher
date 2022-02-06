import { shallowMount } from "@vue/test-utils";
import HelloWorld from "@/components/HelloWorld.vue";
import { QJS, convertOldRulesToNew } from "@/entry/background/storage";
import satisfies from "semver/functions/satisfies";

describe("Storage", () => {
  // it("renders props.msg when passed", () => {
  //   const msg = "new message";
  //   const wrapper = shallowMount(HelloWorld, {
  //     props: { msg },
  //   });
  //   expect(wrapper.text()).toMatch(msg);
  // });

  it("should convert old rules to new", () => {
    const rule1: QJS.ContentSettingRule = {
      primaryPattern: "*://*.github.com/*",
      scope: "regular",
      setting: "allow",
    };
    const rule2: QJS.ContentSettingRule = {
      primaryPattern: "*://www.twitter.com/*",
      scope: "incognito_session_only",
      setting: "block",
    };

    const oldRules: Array<QJS.ContentSettingRule> = [rule1, rule2];
    const convertedRules = convertOldRulesToNew(oldRules);

    expect(convertedRules).toMatchObject({
      [rule1.primaryPattern]: rule1,
      [rule2.primaryPattern]: rule2,
    });
  });

  it("should update when comes from 1.4.4 to 2.0.0", () => {
    const isFromV1ToV2 =
      satisfies("1.4.4", "<2.0.0") && satisfies("2.0.0", ">=2.0.0");

    expect(isFromV1ToV2).toBe(true);
  });
});
