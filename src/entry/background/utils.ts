import { parse } from "tldts";
import { getJavascriptRuleSetting } from "./contentsettings";

export enum Log {
  EVENTS = "EVENTS",
  TABS = "TABS",
  RULES = "RULES",
  STORAGE = "STORAGE",
  ACTIONS = "ACTIONS",
  ICON = "ICON",
  CONTEXT_MENUS = "CONTEXT_MENUS",
}

export const cl = (message: any, type?: Log, name?: string) => {
  const DEBUG = {
    [Log.ACTIONS]: true,
    [Log.TABS]: false,
    [Log.RULES]: true,
    [Log.STORAGE]: false,
    [Log.EVENTS]: false,
    [Log.ICON]: false,
    [Log.CONTEXT_MENUS]: false,
  };

  if (type && DEBUG[type] === true) {
    console.log(message, name);
  }
  if (!type) {
    console.log(message, name);
  }
};

export const getUrlPatterns = (url: string) => {
  const { scheme, schemeSuffix, subdomain, domain, path } = getUrlAsObject(url);

  const patterns = {
    subdomain: `${scheme}${schemeSuffix}${subdomain}${domain}/*`,
    domain: `${scheme}${schemeSuffix}*.${domain}/*`,
  };
  return patterns;
};

// export const getPrecedenceFromTab = async (tab: chrome.tabs.Tab) => {
//   const patterns = getUrlPatterns(tab.url!);

//   const subdomainSetting = await getJavascriptRuleSetting({
//     primaryUrl: patterns.subdomain,
//     incognito: tab.incognito,
//   });

//   const domainSetting = await getJavascriptRuleSetting({
//     primaryUrl: patterns.domain,
//     incognito: tab.incognito,
//   });

//   let precedence;
//   if (subdomainSetting === domainSetting) {
//     precedence = {
//       type: "subdomain",
//       url: patterns.subdomain,
//       setting: subdomainSetting,
//     };
//   } else {
//     precedence = {
//       type: "domain",
//       url: patterns.domain,
//       setting: domainSetting,
//     };
//   }

//   return precedence;
// };

export const getSubdomainPatternFromUrl = (url: string) => {
  if (!isAllowedUrl(url)) {
    return null;
  }
  const { domain, subdomain, schemeSuffix } = getUrlAsObject(url);
  if (subdomain === null) {
    return null;
  }
  const pattern = `*${schemeSuffix}${subdomain}${domain}/*`;

  return pattern;
};
export const getDomainPatternFromUrl = (url: string) => {
  if (!isAllowedUrl(url)) {
    return null;
  }
  const { domain, schemeSuffix } = getUrlAsObject(url);
  if (domain === null) {
    return null;
  }
  const pattern = `*${schemeSuffix}*.${domain}/*`;
  return pattern;
};
export const getUrlPatternFromUrl = (url: string) => {
  const {
    subdomain,
    domain,
    hostname,
    pathnameUntilLastSlash,
    scheme,
    schemeSuffix,
  } = getUrlAsObject(url);

  console.log(pathnameUntilLastSlash, " pathnameUntilLastSlash");
  // const pattern = `${scheme}${schemeSuffix}${hostname}${pathnameUntilLastSlash}/*`;
  return url;
};

export const getScopeSetting = (incognito: chrome.tabs.Tab["incognito"]) => {
  return incognito ? "incognito_session_only" : "regular";
};
export const getUrlAsObject = (url: string) => {
  const { domain, subdomain } = parse(url);
  const { pathname, protocol, hostname } = new URL(url);

  /** http://, https:// etc... */
  const scheme = protocol.replace(/\:$/, "");

  const schemeSuffix = scheme === "file" ? ":///" : "://";

  const pathnameUntilLastSlash = pathname.substr(0, pathname.lastIndexOf("/"));

  const fixedSubdomain = subdomain && subdomain.length ? `${subdomain}.` : "";

  return {
    hostname,
    scheme,
    schemeSuffix,
    protocol,
    domain,
    subdomain: fixedSubdomain,
    pathname,
    path: pathname,
    pathnameUntilLastSlash,
  };
};

export const isValidScheme = (scheme: string) => {
  return ["*", "http", "https", "file", "ftp", "urn"].includes(scheme)
    ? true
    : false;
};

export const isAllowedUrl = (url: string) => {
  const { scheme } = getUrlAsObject(url);
  return isValidScheme(scheme);
  // const regex = /^(http|https|ftp|file|urn):(\/{0,3})(?!\/).*$/gm;
  // return url.match(regex);
};

/**
 * Chrome match pattern replicated
 * Thanks to Xan: https://stackoverflow.com/a/26420284/771165
 */
export const isAllowedPattern = (input: string) => {
  if (typeof input !== "string") return null;
  var match_pattern = "(?:^",
    regEscape = function (s: string) {
      return s.replace(/[[^$.|?*+(){}\\]/g, "\\$&");
    },
    result = /^(\*|https?|file|ftp|chrome-extension):\/\//.exec(input);

  // Parse scheme
  if (!result) return null;
  input = input.substr(result[0].length);
  match_pattern += result[1] === "*" ? "https?://" : result[1] + "://";

  // Parse host if scheme is not `file`
  if (result[1] !== "file") {
    if (!(result = /^(?:\*|(\*\.)?([^\/*]+))(?=\/)/.exec(input))) return null;
    input = input.substr(result[0].length);
    if (result[0] === "*") {
      // host is '*'
      match_pattern += "[^/]+";
    } else {
      if (result[1]) {
        // Subdomain wildcard exists
        match_pattern += "(?:[^/]+\\.)?";
      }
      // Append host (escape special regex characters)
      match_pattern += regEscape(result[2]);
    }
  }
  // Add remainder (path)
  match_pattern += input.split("*").map(regEscape).join(".*");
  match_pattern += "$)";
  return match_pattern === null ? false : true;
};

export const retry = <T>(fn: () => Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve) => {
    fn()
      .then(resolve)
      .catch(() => {
        setTimeout(() => {
          console.log("retrying...");
          retry(fn, ms).then(resolve);
        }, ms);
      });
  });
