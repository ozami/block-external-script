var global_white_list = {

};

var site_white_list = {

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
  
  var block = domain != main_frame_domain;
  if (block) {
    console.log("B " + domain);
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
