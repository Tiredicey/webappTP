var e=(e,t,n)=>(r,i)=>{let a=-1;return o(0);async function o(s){if(s<=a)throw Error(`next() called multiple times`);a=s;let c,l=!1,u;if(e[s]?(u=e[s][0][0],r.req.routeIndex=s):u=s===e.length&&i||void 0,u)try{c=await u(r,()=>o(s+1))}catch(e){if(e instanceof Error&&t)r.error=e,c=await t(e,r),l=!0;else throw e}else r.finalized===!1&&n&&(c=await n(r));return c&&(r.finalized===!1||l)&&(r.res=c),r}},t=Symbol(),n=(e,t)=>new Response(e,{headers:{"Content-Type":t.replace(/^[^;]+/,e=>e.toLowerCase())}}).formData(),r=32,i=1e4,a=e=>`headers`in e,o=async(e,t=Object.create(null))=>{let{all:n=!1,dot:r=!1}=t,i=(a(e)?e.headers:e.raw.headers).get(`Content-Type`)?.split(`;`)[0].trim().toLowerCase();return i===`multipart/form-data`||i===`application/x-www-form-urlencoded`?s(e,{all:n,dot:r}):{}};async function s(e,t){if(!a(e)&&e.bodyCache.formData)return c(await e.bodyCache.formData,t);let r=a(e)?e.headers:e.raw.headers,i=n(await e.arrayBuffer(),r.get(`Content-Type`)||``);a(e)||(e.bodyCache.formData=i);let o=await i;return o?c(o,t):{}}function c(e,t){let n=Object.create(null),r={count:0};return e.forEach((e,r)=>{t.all||r.endsWith(`[]`)?l(n,r,e):n[r]=e}),t.dot&&Object.entries(n).forEach(([e,t])=>{e.includes(`.`)&&(u(n,e,t,r),delete n[e])}),n}var l=(e,t,n)=>{e[t]===void 0?e[t]=t.endsWith(`[]`)?[n]:n:Array.isArray(e[t])?e[t].push(n):e[t]=[e[t],n]},u=(e,t,n,a)=>{if(/(?:^|\.)__proto__\./.test(t))return;let o=e,s=t.split(`.`,r+2);s.length>r+1&&d(),s.forEach((e,t)=>{t===s.length-1?o[e]=n:((!o[e]||typeof o[e]!=`object`||Array.isArray(o[e])||o[e]instanceof File)&&(a.count++>=i&&d(),o[e]=Object.create(null)),o=o[e])})},d=()=>{throw Error(`Nesting limit exceeded`)},f=e=>{let t=e.split(`/`);return t[0]===``&&t.shift(),t},p=e=>{let{groups:t,path:n}=m(e);return h(f(n),t)},m=e=>{let t=[];return e=e.replace(/\{[^}]+\}/g,(e,n)=>{let r=`@${n}`;return t.push([r,e]),r}),{groups:t,path:e}},h=(e,t)=>{for(let n=t.length-1;n>=0;n--){let[r]=t[n];for(let i=e.length-1;i>=0;i--)if(e[i].includes(r)){e[i]=e[i].replace(r,t[n][1]);break}}return e},g={},ee=(e,t)=>{if(e===`*`)return`*`;let n=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(n){let r=`${e}#${t}`;return g[r]||(g[r]=n[2]?t&&t[0]!==`:`&&t[0]!==`*`?[r,n[1],RegExp(`^${n[2]}(?=/${t})`)]:[e,n[1],RegExp(`^${n[2]}$`)]:[e,n[1],!0]),g[r]}return null},_=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,e=>{try{return t(e)}catch{return e}})}},te=e=>_(e,decodeURI),v=e=>{let t=e.url,n=t.indexOf(`/`,t.indexOf(`:`)+4),r=n;for(;r<t.length;r++){let e=t.charCodeAt(r);if(e===37){let e=t.indexOf(`?`,r),i=t.indexOf(`#`,r),a=e===-1?i===-1?void 0:i:i===-1?e:Math.min(e,i),o=t.slice(n,a);return te(o.includes(`%25`)?o.replace(/%25/g,`%2525`):o)}if(e===63||e===35)break}return t.slice(n,r)},y=e=>{let t=v(e);return t.length>1&&t.at(-1)===`/`?t.slice(0,-1):t},b=(e,t,...n)=>(n.length&&(t=b(t,...n)),`${e?.[0]===`/`?``:`/`}${e}${t===`/`?``:`${e?.at(-1)===`/`?``:`/`}${t?.[0]===`/`?t.slice(1):t}`}`),x=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(`:`))return null;let t=e.split(`/`),n=[],r=``;return t.forEach(e=>{if(e!==``&&!/\:/.test(e))r+=`/`+e;else if(/\:/.test(e)){if(e.charCodeAt(e.length-1)===63){n.length===0&&r===``?n.push(`/`):n.push(r);let t=e.slice(0,-1);r+=`/`+t,n.push(r)}else r+=`/`+e}}),n.filter((e,t,n)=>n.indexOf(e)===t)},S=e=>e.indexOf(`%`)===-1?e:_(e,T),C=e=>(e.indexOf(`+`)!==-1&&(e=e.replace(/\+/g,` `)),S(e)),w=(e,t,n)=>{let r=e.indexOf(`#`,8);r!==-1&&(e=e.slice(0,r));let i;if(!n&&t&&t.indexOf(`%`)===-1&&t.indexOf(`+`)===-1){let n=e.indexOf(`?`,8);if(n===-1)return;for(e.startsWith(t,n+1)||(n=e.indexOf(`&${t}`,n+1));n!==-1;){let r=e.charCodeAt(n+t.length+1);if(r===61){let r=n+t.length+2,i=e.indexOf(`&`,r);return C(e.slice(r,i===-1?void 0:i))}if(r==38||isNaN(r))return``;n=e.indexOf(`&${t}`,n+1)}if(i=/[%+]/.test(e),!i)return}let a=Object.create(null);i??=/[%+]/.test(e);let o=e.indexOf(`?`,8);for(;o!==-1;){let t=e.indexOf(`&`,o+1),r=e.indexOf(`=`,o);r>t&&t!==-1&&(r=-1);let s=e.slice(o+1,r===-1?t===-1?void 0:t:r);if(i&&(s=C(s)),o=t,s===``)continue;let c;r===-1?c=``:(c=e.slice(r+1,t===-1?void 0:t),i&&(c=C(c))),n?(a[s]&&Array.isArray(a[s])||(a[s]=[]),a[s].push(c)):a[s]??=c}return t?a[t]:a},ne=w,re=(e,t)=>w(e,t,!0),T=decodeURIComponent,E=class{raw;#e;#t;routeIndex=0;path;bodyCache={};constructor(e,t=`/`,n=[[]]){this.raw=e,this.path=t,this.#t=n}param(e){return e?this.#n(e):this.#r()}#n(e){let t=this.#t[0][this.routeIndex]?.[1][e],n=this.#i(t);return n&&S(n)}#r(){let e={},t=Object.keys(this.#t[0][this.routeIndex]?.[1]??{});for(let n of t){let t=this.#i(this.#t[0][this.routeIndex][1][n]);t!==void 0&&(e[n]=S(t))}return e}#i(e){return this.#t[1]?this.#t[1][e]:e}query(e){return ne(this.url,e)}queries(e){return re(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;let t=Object.create(null);return this.raw.headers.forEach((e,n)=>{t[n]=e}),t}async parseBody(e){return o(this,e)}#a=e=>{let{bodyCache:t,raw:n}=this,r=t[e];if(r)return r;for(let n in t)return t[n].then(t=>(n===`json`&&(t=JSON.stringify(t)),new Response(t)[e]()));return t[e]=n[e]()};json(){return this.#a(`text`).then(e=>JSON.parse(e))}text(){return this.#a(`text`)}arrayBuffer(){return this.#a(`arrayBuffer`)}bytes(){return this.#a(`arrayBuffer`).then(e=>new Uint8Array(e))}blob(){return this.#a(`blob`)}formData(){return this.#a(`formData`)}addValidatedData(e,t){(this.#e??={})[e]=t}valid(e){return this.#e?.[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[t](){return this.#t}get matchedRoutes(){return this.#t[0].map(([[,e]])=>e)}get routePath(){return this.#t[0].map(([[,e]])=>e)[this.routeIndex].path}},D={Stringify:1,BeforeStream:2,Stream:3},ie=(e,t)=>{let n=new String(e);return n.isEscaped=!0,n.callbacks=t,n},O=async(e,t,n,r,i)=>{typeof e==`object`&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));let a=e.callbacks;if(!a?.length)return Promise.resolve(e);i?i[0]+=e:i=[e];let o=Promise.all(a.map(e=>e({phase:t,buffer:i,context:r}))).then(e=>Promise.all(e.filter(Boolean).map(e=>O(e,t,!1,r,i))).then(()=>i[0]));return n?ie(await o,a):o},ae=`text/plain; charset=UTF-8`,k=(e,t)=>({"Content-Type":e,...t}),A=(e,t)=>new Response(e,t),j=class{#e;#t;env={};#n;finalized=!1;error;#r;#i;#a;#o;#s;#c;#l;#u;#d;constructor(e,t){this.#e=e,t&&(this.#i=t.executionCtx,this.env=t.env,this.#c=t.notFoundHandler,this.#d=t.path,this.#u=t.matchResult)}get req(){return this.#t??=new E(this.#e,this.#d,this.#u),this.#t}get event(){if(this.#i&&`respondWith`in this.#i)return this.#i;throw Error(`This context has no FetchEvent`)}get executionCtx(){if(this.#i)return this.#i;throw Error(`This context has no ExecutionContext`)}get res(){return this.#a||=A(null,{headers:this.#l??=new Headers})}set res(e){if(this.#a&&e){e=A(e.body,e);for(let[t,n]of this.#a.headers.entries())if(t!==`content-type`){if(t===`set-cookie`){let t=this.#a.headers.getSetCookie();e.headers.delete(`set-cookie`);for(let n of t)e.headers.append(`set-cookie`,n)}else e.headers.set(t,n)}}this.#a=e,this.finalized=!0}render=(...e)=>(this.#s??=e=>this.html(e),this.#s(...e));setLayout=e=>this.#o=e;getLayout=()=>this.#o;setRenderer=e=>{this.#s=e};header=(e,t,n)=>{this.finalized&&(this.#a=A(this.#a.body,this.#a));let r=this.#a?this.#a.headers:this.#l??=new Headers;t===void 0?r.delete(e):n?.append?r.append(e,t):r.set(e,t)};status=e=>{this.#r=e};set=(e,t)=>{this.#n??=new Map,this.#n.set(e,t)};get=e=>this.#n?this.#n.get(e):void 0;get var(){return this.#n?Object.fromEntries(this.#n):{}}#f(e,t,n){let r=this.#a?new Headers(this.#a.headers):this.#l;if(typeof t==`object`&&t.headers){r??=new Headers;for(let[e,n]of new Headers(t.headers))e===`set-cookie`?r.append(e,n):r.set(e,n)}if(n){if(!r){let e=0;for(let t in n)if(++e>1||typeof n[t]!=`string`){r=new Headers;break}}if(r)for(let e in n){let t=n[e];if(typeof t==`string`)r.set(e,t);else{r.delete(e);for(let n of t)r.append(e,n)}}}return A(e,{status:typeof t==`number`?t:t?.status??this.#r,headers:r??n})}newResponse=(...e)=>this.#f(...e);body=(e,t,n)=>this.#f(e,t,n);text=(e,t,n)=>!this.#l&&!this.#r&&!t&&!n&&!this.finalized?new Response(e):this.#f(e,t,k(ae,n));json=(e,t,n)=>this.#f(JSON.stringify(e),t,k(`application/json`,n));html=(e,t,n)=>{let r=e=>this.#f(e,t,k(`text/html; charset=UTF-8`,n));return typeof e==`object`?O(e,D.Stringify,!1,{}).then(r):r(e)};redirect=(e,t)=>{let n=String(e);return this.header(`Location`,/[^\x00-\xFF]/.test(n)?encodeURI(n):n),this.newResponse(null,t??302)};notFound=()=>(this.#c??=()=>A(),this.#c(this))},M=[`get`,`post`,`put`,`delete`,`options`,`patch`,`query`],N=`Can not add a route since the matcher is already built.`,P=class extends Error{},oe=`__COMPOSED_HANDLER`,se=e=>e.text(`404 Not Found`,404),F=(e,t)=>{if(`getResponse`in e){let n=e.getResponse();return t.newResponse(n.body,n)}return console.error(e),t.text(`Internal Server Error`,500)},ce=class t{get;post;put;delete;options;patch;query;all;on;use;router;getPath;_basePath=`/`;#e=`/`;routes=[];constructor(e={}){[...M,`all`].forEach(e=>{this[e]=(t,...n)=>(typeof t==`string`?this.#e=t:this.#r(e,this.#e,t),n.forEach(t=>{this.#r(e,this.#e,t)}),this)}),this.on=(e,t,...n)=>{for(let r of[t].flat()){this.#e=r;for(let t of[e].flat())n.map(e=>{this.#r(t.toUpperCase(),this.#e,e)})}return this},this.use=(e,...t)=>(typeof e==`string`?this.#e=e:(this.#e=`*`,t.unshift(e)),t.forEach(e=>{this.#r(`ALL`,this.#e,e)}),this);let{strict:t,...n}=e;Object.assign(this,n),this.getPath=t??!0?e.getPath??v:y}#t(){let e=new t({router:this.router,getPath:this.getPath});return e.errorHandler=this.errorHandler,e.#n=this.#n,e.routes=this.routes,e}#n=se;errorHandler=F;route(t,n){let r=this.basePath(t);return n.routes.map(t=>{let i;n.errorHandler===F?i=t.handler:(i=async(r,i)=>(await e([],n.errorHandler)(r,()=>t.handler(r,i))).res,i[oe]=t.handler),r.#r(t.method,t.path,i,t.basePath)}),this}basePath(e){let t=this.#t();return t._basePath=b(this._basePath,e),t}onError=e=>(this.errorHandler=e,this);notFound=e=>(this.#n=e,this);mount(e,t,n){let r,i;n&&(typeof n==`function`?i=n:(i=n.optionHandler,r=n.replaceRequest===!1?e=>e:n.replaceRequest));let a=i?e=>{let t=i(e);return Array.isArray(t)?t:[t]}:e=>{let t;try{t=e.executionCtx}catch{}return[e.env,t]};return r||=(()=>{let t=b(this._basePath,e),n=t===`/`?0:t.length;return e=>{let t=new URL(e.url);return t.pathname=this.getPath(e).slice(n)||`/`,new Request(t,e)}})(),this.#r(`ALL`,b(e,`*`),async(e,n)=>{let i=await t(r(e.req.raw),...a(e));if(i)return i;await n()}),this}#r(e,t,n,r){e=e.toUpperCase(),t=b(this._basePath,t);let i={basePath:r===void 0?this._basePath:b(this._basePath,r),path:t,method:e,handler:n};this.router.add(e,t,[n,i]),this.routes.push(i)}#i(e,t){if(e instanceof Error)return this.errorHandler(e,t);throw e}#a(t,n,r,i){if(i===`HEAD`)return(async()=>new Response(null,await this.#a(t,n,r,`GET`)))();let a=this.getPath(t,{env:r}),o=this.router.match(i,a),s=new j(t,{path:a,matchResult:o,env:r,executionCtx:n,notFoundHandler:this.#n});if(o[0].length===1){let e;try{e=o[0][0][0][0](s,async()=>{s.res=await this.#n(s)})}catch(e){return this.#i(e,s)}return e instanceof Promise?e.then(e=>e||(s.finalized?s.res:this.#n(s))).catch(e=>this.#i(e,s)):e??this.#n(s)}let c=e(o[0],this.errorHandler,this.#n);return(async()=>{try{let e=await c(s);if(!e.finalized)throw Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return e.res}catch(e){return this.#i(e,s)}})()}fetch=(e,...t)=>this.#a(e,t[1],t[0],e.method);request=(e,t,n,r)=>e instanceof Request?this.fetch(t?new Request(e,t):e,n,r):(e=e.toString(),this.fetch(new Request(/^https?:\/\//.test(e)?e:`http://localhost${b(`/`,e)}`,t),n,r));fire=()=>{addEventListener(`fetch`,e=>{e.respondWith(this.#a(e.request,e,void 0,e.request.method))})}},I=()=>Object.create(null),L=[];function R(e,t){let n=this.buildAllMatchers(),r=((e,t)=>{let r=n[e]||n.ALL,i=r[2][t];if(i)return i;let a=t.match(r[0]);if(!a)return[[],L];let o=a.indexOf(``,1);return[r[1][o],a]});return this.match=r,r(e,t)}var z=`[^/]+`,B=`(?:|/.*)`,V=Symbol(),H=new Set(`.\\+*[^]$()`);function U(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1?1:e===`.*`||e===`(?:|/.*)`?t===`(?:|/.*)`?-1:1:t===`.*`||t===`(?:|/.*)`?-1:e===`[^/]+`?1:t===`[^/]+`?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var W=class e{#e;#t;#n=I();insert(t,n,r,i,a){let o=this;for(let n=0,a=t.length;n<a;n++){let s=t[n],c=s.length===1?s===`*`?n===a-1?[``,``,`.*`]:[``,``,z]:null:s===`/*`?[``,``,B]:s.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/),l;if(c){let t=c[1],n=c[2]||`[^/]+`;if(t&&c[2]&&(n===`.*`||(n=n.replace(/^\((?!\?:)(?=[^)]+\)$)/,`(?:`),/\((?!\?:)/.test(n))||n.length===1&&H.has(n)))throw V;if(l=o.#n[n],!l){if(n!==`.*`&&n!==`(?:|/.*)`){for(let e in o.#n)if((n.length>1||e.length>1)&&e!==`.*`&&e!==`(?:|/.*)`)throw V}l=o.#n[n]=new e}t!==``&&(l.#t??=i.varIndex++,r.push([t,l.#t]))}else if(l=o.#n[s],!l){for(let e in o.#n)if(e.length>1&&e!==`.*`&&e!==`(?:|/.*)`)throw V;l=o.#n[s]=new e}o=l}if(o.#e!==void 0)throw V;o.#e=a?-1:n}buildRegExpStr(){let e=Object.keys(this.#n).sort(U).map(e=>{let t=this.#n[e],n=t.buildRegExpStr();return n===``?``:(typeof t.#t==`number`?`(${e})@${t.#t}`:H.has(e)?`\\${e}`:e)+n}).filter(Boolean);return typeof this.#e==`number`&&this.#e!==-1&&e.unshift(`#${this.#e}`),e.length===0?``:e.length===1?e[0]:`(?:`+e.join(`|`)+`)`}},G=class{#e={varIndex:0};#t=new W;#n=0;paths=I();insert(e,t){if(t){this.#t.insert(e.split(``),0,[],this.#e,!0);return}let n=[],r=[],i=e;for(let e=0;;){let t=!1;if(i=i.replace(/\{[^}]+\}/g,n=>{let i=`@\\${e}`;return r[e]=[i,n],e++,t=!0,i}),!t)break}let a=i.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let e=r.length-1;e>=0;e--){let[t]=r[e];for(let n=a.length-1;n>=0;n--)if(a[n].indexOf(t)!==-1){a[n]=a[n].replace(t,r[e][1]);break}}this.#t.insert(a,this.#n,n,this.#e,!1),this.paths[e]=[this.#n++,n]}buildRegExp(){let e=this.#t.buildRegExpStr();if(e===``)return[/^$/,[],[]];let t=0,n=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(e,i,a)=>i===void 0?(a===void 0||(r[Number(a)]=++t),``):(n[++t]=Number(i),`$()`)),[RegExp(`^${e}`),n,r]}},K=I();function q(e){return K[e]??=RegExp(`^${e.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,(e,t)=>t?`\\${t}`:e===`/*`?B:e===`*`?`.*`:`/:${z}`)}$`)}function J(e,t){for(let n of Object.keys(e).sort((e,t)=>t.length-e.length))if(q(n).test(t))return[...e[n]]}var le=class{name=`RegExpRouter`;#e;#t;#n;constructor(){this.#e={ALL:I()},this.#t={ALL:I()},this.#n={ALL:new G}}#r(e,t){try{this.#n[e].insert(t,!/\*|\/:/.test(t))}catch(e){throw e===V?new P(t):e}}add(e,t,n){let r=this.#e,i=this.#t;if(!r)throw Error(N);if(!r[e]){this.#n[e]=new G;for(let t of[r,i]){t[e]=I();for(let n in t.ALL)t[e][n]=[...t.ALL[n]],this.#r(e,n)}}t===`/*`&&(t=`*`);let a=e===`ALL`?Object.keys(r):[e];if(/\*$/.test(t)){let e=q(t);for(let e of a)r[e][t]||(this.#r(e,t),r[e][t]=J(r[e],t)||J(r.ALL,t)||[]);for(let o of[r,i])for(let r of a)for(let i in o[r])e.test(i)&&o[r][i].push([n,t]);return}let o=x(t)||[t];for(let e of o)for(let t of a)i[t][e]||(this.#r(t,e),i[t][e]=J(r[t],e)||J(r.ALL,e)||[]),i[t][e].push([n,e])}match=R;buildAllMatchers(){let e=I();for(let t of Object.keys(this.#t))e[t]=this.#i(t);return this.#e=this.#t=this.#n=void 0,K=I(),e}#i(e){let t=this.#e[e],n=this.#t[e],r=this.#n[e],i=I(),a=[],[o,s,c]=r.buildRegExp();for(let e of[t,n])for(let t in e){let n=e[t],o=r.paths[t];if(!o){i[t]=[n.map(([e])=>[e,I()]),L];continue}a[o[0]]=n.map(([e,t])=>[e,r.paths[t][1].reduceRight((e,[t],n)=>(e[t]=c[o[1][n][1]],e),I())])}return[o,s.map(e=>a[e]),i]}},ue=class{name=`SmartRouter`;#e=[];#t=[];constructor(e){this.#e=e.routers}add(e,t,n){if(!this.#t)throw Error(N);this.#t.push([e,t,n])}match(e,t){if(!this.#t)throw Error(`Fatal error`);let n=this.#e,r=this.#t,i=n.length,a=0,o;for(;a<i;a++){let i=n[a];try{for(let e=0,t=r.length;e<t;e++)i.add(...r[e]);o=i.match(e,t)}catch(e){if(e instanceof P)continue;throw e}this.match=i.match.bind(i),this.#e=[i],this.#t=void 0;break}if(a===i)throw Error(`Fatal error`);return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(this.#t||this.#e.length!==1)throw Error(`No active router has been determined yet.`);return this.#e[0]}},Y=I(),de=0,fe=class e{#e=[];#t=I();#n=[];#r;#i=Y;insert(t,n,r){let i=this,a=p(n),o=new Set,s=0;for(let t of a){let n=a[++s],r=ee(t,n)||(n===void 0&&t&&t.indexOf(`*`)===t.length-1?t:null),c=Array.isArray(r),l=c?r[0]:r||t,u=i.#t[l]||=new e;r&&!u.#r&&(u.#r=r,i.#n.push(u)),i=u,c&&o.add(r[1])}i.#e.push({[t]:{handler:r,possibleKeys:[...o],score:++de}})}#a(e,t,n,r,i){for(let a=0,o=t.#e.length;a<o;a++){let o=t.#e[a],s=o[n]||o.ALL;if(s){s.params=I(),e.push(s);for(let e=0,t=s.possibleKeys.length;e<t;e++){let t=s.possibleKeys[e];s.params[t]=i?.[t]&&!e?i[t]:r[t]??i?.[t]}}}}search(e,t){let n=[];this.#i=Y;let r=[this],i=f(t),a=[],o=i.length,s=null;for(let c=0;c<o;c++){let l=i[c],u=c===o-1,d=[];for(let f=0,p=r.length;f<p;f++){let p=r[f],m=p.#t[l];m&&(m.#i=p.#i,u?(m.#t[`*`]&&this.#a(n,m.#t[`*`],e,p.#i),this.#a(n,m,e,p.#i)):d.push(m));for(let r of p.#n){let f=r.#r,m=p.#i===Y?{}:{...p.#i};if(typeof f==`string`){(f===`*`||l.startsWith(f.slice(0,-1)))&&(this.#a(n,r,e,p.#i),f===`*`&&(r.#i=m,d.push(r)));continue}let[,h,g]=f;if(!(!l&&g===!0)){if(g!==!0){if(!s){s=[];let e=+(t[0]===`/`);for(let t=0;t<o;t++)s[t]=e,e+=i[t].length+1}let l=t.slice(s[c]),u=g.exec(l);if(u){m[h]=u[0],this.#a(n,r,e,p.#i,m),u[0].length===l.length&&r.#t[`*`]&&this.#a(n,r.#t[`*`],e,p.#i,m);for(let e in r.#t){r.#i=m;let e=u[0].match(/\//g)?.length??0;(a[e]||=[]).push(r);break}continue}}(g===!0||g.test(l))&&(m[h]=l,u?(this.#a(n,r,e,m,p.#i),r.#t[`*`]&&this.#a(n,r.#t[`*`],e,m,p.#i)):(r.#i=m,d.push(r)))}}}let f=a.shift();r=f?d.concat(f):d}return n[1]&&n.sort((e,t)=>e.score-t.score),[n.map(({handler:e,params:t})=>[e,t])]}},pe=class{name=`TrieRouter`;#e=new fe;add(e,t,n){for(let r of x(t)||[t])this.#e.insert(e,r,n)}match(e,t){return this.#e.search(e,t)}},X=class extends ce{constructor(e={}){super(e),this.router=e.router??new ue({routers:[new le,new pe]})}},Z=new X,me=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#16211b">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>ISDemo</title>
<link rel="manifest" href="/static/manifest.webmanifest">
<link rel="icon" href="/static/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/static/icon.svg">
<link rel="stylesheet" href="/static/style.css">
</head>
<body>

<div class="appbar">
  <span class="dot"></span>
  <h1>ISDemo</h1>
  <span class="spacer"></span>
  <span class="badge">IT2222</span>
</div>

<div class="wrap">

  <div id="ctx-warn" class="warn hidden"></div>

  <!-- ============ LOGIN ============ -->
  <section id="login-screen">
    <div class="card">
      <div class="logo-lock">&#128274;</div>
      <h2>Function 1 &middot; Login authentication</h2>
      <p id="login-headline" style="margin:0 0 14px;font-size:15px"></p>

      <form id="pin-form" onsubmit="return false">
      <div class="row">
        <label for="pin-input">PIN</label>
        <input id="pin-input" type="password" inputmode="numeric"
               autocomplete="off" maxlength="12" placeholder="******">
      </div>

      <div class="row hidden" id="pin-confirm-row">
        <label for="pin-confirm">Confirm PIN</label>
        <input id="pin-confirm" type="password" inputmode="numeric"
               autocomplete="off" maxlength="12" placeholder="******">
      </div>

      <div class="row"><button id="primary-btn" type="submit" class="btn-primary">Unlock</button></div>
      </form>
      <div class="row"><button id="biometric-btn" class="btn-ghost hidden">Register biometric</button></div>

      <div id="login-message" class="msg"></div>
      <div id="bio-note" class="note"></div>
      <div id="pbkdf2-note" class="note"></div>

      <h3>Stored credential</h3>
      <div class="note">The PIN is never saved. Only the derived digest and its
        random salt are written to storage &mdash; inspect them yourself:</div>
      <div class="row" style="margin-top:10px">
        <button id="show-store-btn" class="btn-ghost">Show what is stored</button>
      </div>
      <pre id="store-dump" class="hidden"></pre>
      <div class="row"><button id="reset-btn" class="btn-danger hidden">Reset credential</button></div>
    </div>
  </section>

  <!-- ============ APP ============ -->
  <section id="app-screen" class="hidden">
    <div class="tabs">
      <button class="tab active" data-target="panel-calc">Calculator</button>
      <button class="tab" data-target="panel-time">Date &amp; time</button>
      <button class="tab" data-target="panel-session">Session</button>
    </div>

    <!-- calculator -->
    <div id="panel-calc" class="panel card">
      <h2>Function 2 &middot; Calculator</h2>
      <div id="calc-expr" class="calc-expr">&nbsp;</div>
      <div id="calc-result" class="calc-result">0</div>
      <div id="keypad"></div>
      <button id="equals-btn" class="btn-primary">=</button>
      <div id="calc-note" class="msg" data-kind="error"></div>
      <div class="note">Exact decimal arithmetic on scaled BigInt values, so
        <code>0.1+0.2</code> returns <code>0.3</code> rather than
        <code>0.30000000000000004</code>. Parsed with the shunting-yard
        algorithm into RPN.</div>
      <div class="row" style="margin-top:12px">
        <button id="selftest-btn" class="btn-ghost">Run arithmetic self-test</button>
      </div>
      <div id="selftest-wrap" class="hidden">
        <h3>Self-test &mdash; <span id="selftest-summary"></span></h3>
        <table>
          <thead><tr><th>Input</th><th>Expected</th><th>Actual</th><th></th></tr></thead>
          <tbody id="selftest-body"></tbody>
        </table>
      </div>
    </div>

    <!-- date & time -->
    <div id="panel-time" class="panel card hidden">
      <h2>Function 3 &middot; Date and time</h2>
      <div id="clock-local" class="big-time"></div>
      <div class="kv">
        <div>UTC instant</div><div id="clock-utc"></div>
        <div>IANA zone</div><div id="clock-zone"></div>
        <div>Zone name</div><div id="clock-zonename"></div>
        <div>Unix epoch (ms)</div><div id="clock-epoch"></div>
        <div>DST</div><div id="clock-dst"></div>
        <div>Locale</div><div id="clock-locale"></div>
      </div>
      <h3>Same instant, five zones</h3>
      <table>
        <thead><tr><th>City</th><th>Zone</th><th>Local time</th></tr></thead>
        <tbody id="world-body"></tbody>
      </table>
      <div class="note">Android tracks the current Unix epoch time and the
        current time zone as two separate device-wide states. Change your zone
        in Settings and the epoch value keeps counting while the local time
        jumps.</div>
    </div>

    <!-- session -->
    <div id="panel-session" class="panel card hidden">
      <h2>Session</h2>
      <div class="kv">
        <div>Authenticated by</div><div id="session-method"></div>
        <div>Session age</div><div id="session-age"></div>
      </div>
      <div class="row" style="margin-top:16px">
        <button id="logout-btn" class="btn-ghost">Lock session</button>
      </div>
      <div class="note">Locking clears the calculator state and returns to the
        PIN screen. The stored digest is untouched.</div>
    </div>
  </section>

  <p class="note center" style="margin-top:20px">
    ISDemo &middot; no camera, location, or contacts permission requested
  </p>
</div>

<script type="module" src="/static/app.js"><\/script>
</body>
</html>`;Z.get(`/`,e=>e.html(me));var he=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#16211b"/>
  <rect x="146" y="232" width="220" height="170" rx="26" fill="#5ec98b"/>
  <path d="M196 232v-42a60 60 0 0 1 120 0v42" fill="none" stroke="#5ec98b" stroke-width="30" stroke-linecap="round"/>
  <circle cx="256" cy="304" r="20" fill="#16211b"/>
  <rect x="246" y="316" width="20" height="46" rx="10" fill="#16211b"/>
</svg>`;Z.get(`/favicon.ico`,e=>new Response(he,{headers:{"Content-Type":`image/svg+xml`,"Cache-Control":`public, max-age=86400`}})),Z.get(`/health`,e=>e.json({ok:!0,ts:Date.now()}));var Q=new X,ge=Object.assign({"/src/index.tsx":Z}),$=!1;for(let[,e]of Object.entries(ge))e&&(Q.all(`*`,t=>{let n;try{n=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,n)}),Q.notFound(t=>{let n;try{n=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,n)}),$=!0);if(!$)throw Error(`Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']`);export{Q as default};