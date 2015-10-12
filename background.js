var global_white_list = {
  "googleapis.com": true,
  "cloudfront.net": true,
};

var site_white_list = {
  "twitter.com": {
    "twimg.com": true
  },
  "google.co.jp": {
    "gstatic.com": true
  },
  "amazon.co.jp": {
    "images-amazon.com": true
  },
  "facebook.com": {
    "fbcdn.net": true
  },
  "youtube.com": {
    "ytimg.com": true
  },
  "google.com": {
    "googleusercontent.com": true,
    "gstatic.com": true
  },
  "dropbox.com": {
    "dropboxstatic.com": true
  },
  "fubiz.net": {
    "youtube.com": true,
    "ytimg.com": true
  },
  "feedly.com": {
    "youtube.com": true,
    "ytimg.com": true
  },
  "uploaded.net": {
    "google.com": true
  }
};

var domain_regexp = new RegExp(".*?://(.*?)/.*");

var getDomain = function(url) {
  return url.replace(domain_regexp, "$1");
};

var getMainDomain = function(url) {
  var parts = getDomain(url).split(".");
  for (var i = parts.length - 1; i >= 1; --i) {
    if (parts[i].length > 3) {
      break;
    }
  }
  parts = parts.slice(i);
  return parts.join(".");
}

var main_frame_domain = null;

var filter = function(details) {
  if (details.type == "main_frame") {
    main_frame_domain = getMainDomain(details.url);
    //console.log(main_frame_domain);
    return;
  }
  var domain = getMainDomain(details.url);
  // 全体ホワイト リスト
  if (global_white_list[domain]) {
    console.log("GWL " + domain);
    return;
  }
  // サイト ホワイト リスト
  if (site_white_list[main_frame_domain]) {
      if (site_white_list[main_frame_domain][domain]) {
        console.log("SWL " + domain);
        return;
      }
  }
  var block = domain != main_frame_domain;
  if (block) {
    console.log("B " + details.url);
  }
  else {
    console.log("P " + domain);
  }
  return {cancel: block};
};

chrome.webRequest.onBeforeRequest.addListener(
  filter,
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame", "script"]
  },
  ["blocking"]
);
