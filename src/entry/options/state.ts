import { reactive, toRefs, readonly, computed } from "vue";
import { getStorage, QJS, setStorage } from "../background/storage";
import { Options } from "../background/_types";
import { getUseSyncFromStorage } from "../background/storage";

export const state = reactive({
  options: {
    // "showContextMenu": true;
    // "autoRefresh": true;
    useSync: true,
  },
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

export const getOptions = computed(() => state.options);

export const getUseSyncState = computed(() => state.options.useSync);

export const setUseSyncState = (useSync: boolean) => {
  state.options.useSync = useSync;
  console.log("state new value: ", state);
};

// export const useSyncModel = computed({
//   get() {
//     console.log("useSyncModel get " + getUseSyncState.value);
//     return getUseSyncState.value;
//   },
//   set(value: any) {
//     console.log("useSyncModel set ", value);
//     setUseSyncState(value);
//   },
// });

export const getOptionsFromStorage = async () => {
  return (await getStorage("options")) as Options;
};

export const syncOptionsToStorage = async (newOptions: Partial<Options>) => {
  const currentOptions = getOptions.value;
  const mergedOptions = { ...currentOptions, ...newOptions };
  console.log("merged options", mergedOptions);
  await setStorage("options", mergedOptions);
};

export const initState = async () => {
  const optionsStorage = await getUseSyncFromStorage();
  console.log(optionsStorage, "init'state");

  if (optionsStorage !== undefined) {
    state.options.useSync = optionsStorage;
  }
};

export const useState = () => toRefs(state);
