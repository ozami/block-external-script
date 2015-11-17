var enabled = true;

var global_white_list = {
  "googleapis.com": true,
  "cloudfront.net": true,
  "youtube.com": true,
  "aspnetcdn.com": true,
};

var site_white_list = {
  "twitter.com": {
    "twimg.com": true
  },
  "google.co.jp": {
    "gstatic.com": true
  },
  "amazon.co.jp": {
    "images-amazon.com": true,
    "ssl-images-amazon.com": true
  },
  "amazon.com": {
    "awsstatic.com": true
  },
  "facebook.com": {
    "fbcdn.net": true
  },
  "flickr.com": {
    "yimg.com": true,
    "yahoo.com": true
  },
  "youtube.com": {
    "ytimg.com": true
  },
  "vimeo.com": {
    "vimeocdn.com": true
  },
  "instagram.com": {
    "akamaihd.net": true
  },
  "slideshare.net": {
    "slidesharecdn.com": true
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
    "vimeo.com": true
  },
  "soundcloud.com": {
    "sndcdn.com": true
  },
  "feedly.com": {
    "youtube.com": true,
    "vimeo.com": true
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

var frame_domains = {};

var filter = function(details) {
  if (!enabled) {
    return;
  }
  if (!frame_domains[details.tabId]) {
    frame_domains[details.tabId] = {};
  }
  // メイン フレーム
  if (details.type == "main_frame") {
    frame_domains[details.tabId][details.frameId] = getMainDomain(details.url);
    console.log("main_frame " + details.frameId + " = " + frame_domains[details.tabId][details.frameId]);
    return;
  }
  // サブ フレーム / スクリプト
  var domain = getMainDomain(details.url);
  var parent_frame_domain;
  if (details.type == "sub_frame") {
    parent_frame_domain = frame_domains[details.tabId][details.parentFrameId];
    frame_domains[details.tabId][details.frameId] = domain;
  }
  else {
    parent_frame_domain = frame_domains[details.tabId][details.frameId];
  }
  if (!parent_frame_domain) {
    console.log("No parent frame domain: " + details.tabId + ", " + details.parentFrameId);
    return;
  }
  // 同じドメインなら許可
  if (domain == parent_frame_domain) {
    console.log("Same domain " + domain);
    return;
  }
  // 全体ホワイト リストにあれば許可
  if (global_white_list[domain]) {
    console.log("GWL " + domain);
    return;
  }
  // サイト ホワイト リストにあれば許可
  if (site_white_list[parent_frame_domain]
    && site_white_list[parent_frame_domain][domain]) {
    console.log("SWL " + domain);
    return;
  }
  // 不許可
  console.log("Block " + domain)
  return {cancel: true};
};

chrome.webRequest.onBeforeRequest.addListener(
  filter,
  {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame", "script"]
  },
  ["blocking"]
);

chrome.browserAction.onClicked.addListener(function() {
  enabled = !enabled;
  chrome.browserAction.setIcon({
    path: {"38": enabled ? "enabled.png" : "disabled.png"}
  });
});
