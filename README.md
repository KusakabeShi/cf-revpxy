# Reverse proxy for cloudflare worker
A reverse proxy for cloudflare worker with some additional features:
1. Miltiple site in one worker
2. String replacement
3. Custom resource replacment
3. [cloudflare email-protection](https://support.cloudflare.com/hc/en-us/articles/200170016-What-is-Email-Address-Obfuscation-) bypass.

## Demo
[https://uwiki.kskb.eu.org/](https://uwiki.kskb.eu.org/)  
[https://revdemo.kskb.eu.org/](https://revdemo.kskb.eu.org/)  

## How to use:

Checkout my [worker.js](https://github.com/KusakabeSi/cf-revpxy/blob/main/worker.js), copy and paste to your cloudflare worker.  
Then modify the `reverse ` section, fill the infomatoin based on it's comment.