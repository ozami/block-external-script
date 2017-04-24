var enabled = true;

var dbg = function() {};
if (false) {
  dbg = function(message) {
    console.log(message);
  };
}

var global_white_list = {
  "googleapis": true,
  "cloudfront": true,
  "youtube": true,
  "aspnetcdn": true,
  "jquery": true,
  "typekit": true,
  "akamaihd": true,
  "fontawesome": true,
};

var site_white_list = {
  "twitter": {
    "twimg": true,
  },
  "google": {
    "gstatic": true,
    "googleusercontent": true,
    "googletagmanager": true,
  },
  "amazon": {
    "amazonaws": true,
    "awsstatic": true,
    "images-amazon": true,
    "ssl-images-amazon": true,
  },
  "facebook": {
    "fbcdn": true,
  },
  "messenger": {
    "fbcdn": true,
  },
  "flickr": {
    "yimg": true,
    "yahoo": true
  },
  "youtube": {
    "ytimg": true
  },
  "vimeo": {
    "vimeocdn": true
  },
  "slideshare": {
    "slidesharecdn": true
  },
  "dropbox": {
    "dropboxstatic": true
  },
  "fubiz": {
    "youtube": true,
    "vimeo": true
  },
  "soundcloud": {
    "sndcdn": true
  },
  "feedly": {
    "youtube": true,
    "vimeo": true
  },
  "live": {
    "auth": true,
    "p": true,
  },
  "skype": {
      "skypeassets": true,
  },
  "square-enix": {
  	"google": true,
  },
  "freee": {
    "google": true,
  },
  "tabelog": {
    "k-img": true,
  },
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
  return parts[i];
}

var frame_domains = {};

var filter = function(details) {
  if (!enabled) {
    return;
  }
  if (details.tabId == -1) {
    return;
  }
  if (!frame_domains[details.tabId]) {
    frame_domains[details.tabId] = {};
  }
  // メイン フレーム
  if (details.type == "main_frame") {
    frame_domains[details.tabId][details.frameId] = getMainDomain(details.url);
    dbg("main_frame " + details.frameId + " = " + frame_domains[details.tabId][details.frameId]);
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
    dbg("No parent frame domain: " + details.tabId + ", " + details.parentFrameId);
    return;
  }
  // 同じドメインなら許可
  if (domain == parent_frame_domain) {
    dbg("Same domain " + domain);
    return;
  }
  // 全体ホワイト リストにあれば許可
  if (global_white_list[domain]) {
    dbg("GWL " + domain);
    return;
  }
  // サイト ホワイト リストにあれば許可
  if (site_white_list[parent_frame_domain]
    && site_white_list[parent_frame_domain][domain]) {
    dbg("SWL " + domain);
    return;
  }
  // 不許可
  dbg("Block " + domain)
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
