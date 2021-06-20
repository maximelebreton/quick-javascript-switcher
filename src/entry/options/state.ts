import { reactive, toRefs, readonly } from "vue";
import { QJS } from "../background/storage";

export const state = reactive({
  input: {
    scheme: "*",
    subdomain: "",
    host: "",
    path: "",
    setting: "block",
  },
  filterQuery: "",
  isHelpDisplayed: false,
  helpMessage: "",
  helpMessages: {
    scheme:
      "If the scheme is *, then it matches either http or https, and not file, or ftp.",
    host: `'*' | '*.' <any char except '/' and '*'> \n If the host is *.hostname, then it matches the specified host or any of its subdomains. 
    Here is some examples: <code>github.com</code> will block <u>only the domain</u>, <code>*.github.com</code> will block the <u>domain and all subdomains</u>, and <code>gist.github.com</code> will block <u>only the subdomain</u>`,
    path: "Specific paths aren't allowed with JavaScript content settings",
    pattern:
      "For https://gist.github.com/*, https is the scheme, gist.github.com the host and * the path",
  } as { [key: string]: string },
  schemeOptions: [
    { text: "*", value: "*" },
    { text: "http", value: "http" },
    { text: "https", value: "https" },
    { text: "file", value: "file" },
    { text: "ftp", value: "ftp" },
  ],
  settingOptions: [
    { text: "Block", value: "block" },
    { text: "Allow", value: "allow" },
  ],
  isAnExistingRule: false,
  isEditMode: false,
  ruleIndex: null as number | null,
  rules: {} as { [key: string]: QJS.ContentSettingRule },
  // rules: [
  //   {
  //     primaryPattern: "https://*.maximelebreton.com/*",
  //     setting: "allow",
  //     scope: "regular",
  //   },
  //   {
  //     primaryPattern: "*://*.github.com/*",
  //     setting: "block",
  //     scope: "regular",
  //   },
  //   {
  //     primaryPattern: "*://gist.github.com/*",
  //     setting: "allow",
  //     scope: "regular",
  //   },
  //   {
  //     primaryPattern: "*://*.google.com/images",
  //     setting: "block",
  //     scope: "regular",
  //   },
  //   {
  //     primaryPattern: "file:///foo/bar.html",
  //     setting: "block",
  //     scope: "regular",
  //   },
  //   {
  //     primaryPattern: "*://localhost:3000/*",
  //     setting: "allow",
  //     scope: "regular",
  //   },
  // ],
});

export const useState = () => toRefs(state);
