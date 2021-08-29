reverse = {
  "uwiki.kskb.eu.org": {           // Domain of the cf worker
      "host": "en.wikipedia.org",  // Target domain
      "protocol": "https",         // HTTP or HTTPS, protocol of the original site
      "replaces": {                //Replace string for all json/html/text/javascript through this proxy
          "Wiki": "Uncyclo",
      },
      "reverse": {                 // Additional reverse proxy for for custom resource, such as picture
          "/static/images/project-logos/enwiki.png": "https://images.uncyclomedia.co/uncyclopedia/en/b/bc/Wiki.png"
      }
  },
  "revdemo.kskb.eu.org": {
      "host": "www.example.com",
      "protocol": "https",
      "replaces": {
          "Example": "Demo",
          "Domain": "Site",
          "domain": "site",
          "More": "Less",
          "https://www.iana.org/domains/example": "https://github.com/KusakabeSi/cf-revpxy"
      },
      "reverse": {}
  }
}

target = {} //Temporary variable, do not edit

addEventListener("fetch", event => {
  var url = new URL(event.request.url);
  for (const [s_domain, s_target] of Object.entries(reverse)) {
      //   console.log(url.host)
      if (url.host.endsWith(s_domain)) {
          target = reverse[s_domain];
          target.f_host = s_domain;
          //   console.log("Match: " + s_domain)
          break;
      } else {
          //   console.log("Not Match: " + s_domain)
          continue;
      }
  }

  if (target.f_host == undefined) {
      return event.respondWith(new Response("Error"));
  }

  url.protocol = target.protocol;
  url.host = target.host;
  //event.passThroughOnException();
  return event.respondWith(handleRequest(url));
})

function cfDecodeEmail(encodedString) {
  var email = "",
      r = parseInt(encodedString.substr(0, 2), 16),
      n, i;
  for (n = 2; encodedString.length - n; n += 2) {
      i = parseInt(encodedString.substr(n, 2), 16) ^ r;
      email += String.fromCharCode(i);
  }
  return email;
}

function cfEncodeEmail(email, key = 0) {
  var randomnumber = Math.floor(Math.random() * (99 - 11 + 1)) + 11;
  if (key == 0) {
      key = randomnumber;
  }
  out = key.toString(16).padStart(2, "0")
  for (const c of email) {
      out += (c.charCodeAt(0) ^ key).toString(16).padStart(2, "0")
  }
  return out;
}

async function handleRequest(req_url) {

  // console.log(target);

  if (req_url.pathname in target.reverse) {
      // console.log("reverse " + req_url.pathname + " to " + target.reverse[req_url.pathname])
      var response = await fetch(target.reverse[req_url.pathname]);
  } else {
      // console.log("Default " + req_url.pathname);
      var response = await fetch(req_url);
  }
  // const response = await fetch(req_url);
  let contype = response.headers.get("Content-Type")
  // console.log(req_url)
  // Author: Kusakabe Si
  if (contype.includes("json") || contype.includes("html") || contype.includes("text") || contype.includes("javascript")) {
      var html = await response.text();
      // console.log(html)
      // var orig_html = html;

      allemail = [...html.matchAll(new RegExp("data-cfemail=\"([a-z0-9]+)\"", "g"))].concat([...html.matchAll(new RegExp("email-protection#([a-z0-9]+)\"", "g"))])
      // console.log(allemail)
      replaces_add = {}
      for (const [_, org_cf_email] of allemail) {
          org_cf_email_decode = cfDecodeEmail(org_cf_email)
          for (const [rs, rd] of Object.entries(target.replaces)) {
              org_cf_email_decode = org_cf_email_decode.replaceAll(rs, rd);
          }
          org_cf_email_decode = org_cf_email_decode.replaceAll(target.host, target.f_host);
          replaces_add[org_cf_email] = cfEncodeEmail(org_cf_email_decode)
      }
      // console.log(replaces_add)
      target.replaces = {
          ...target.replaces,
          ...replaces_add
      }
      target.html = html;
      // Simple replacement regex
      for (const [rs, rd] of Object.entries(target.replaces)) {
          //   console.log("replace " + rs + " to " + rd)
          html = html.replaceAll(rs, rd);
      }
      // console.log("replace " + target.host + " to " + target.f_host)
      html = html.replaceAll(target.host, target.f_host);

      // return modified response
      return new Response(html, {
          headers: response.headers
      })
  } else {
      return response;
  }
}