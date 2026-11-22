import{j as M2}from"./chunk-EV3ZQX53.js";import{Aa as r2,Fb as z2,K as u1,L as l2,P as E,Sa as d1,Ta as i2,Ua as f2,Yb as v1,Z as e2,Zb as m2,ac as c1,bc as b,db as s2,sb as n2,yb as o2,zb as t2}from"./chunk-76OGIETC.js";import{a as c2,b as a2}from"./chunk-C6Q5SG76.js";function y1(c,l){(l==null||l>c.length)&&(l=c.length);for(var a=0,e=Array(l);a<l;a++)e[a]=c[a];return e}function a3(c){if(Array.isArray(c))return c}function l3(c){if(Array.isArray(c))return y1(c)}function e3(c,l){if(!(c instanceof l))throw new TypeError("Cannot call a class as a function")}function p2(c,l){for(var a=0;a<l.length;a++){var e=l[a];e.enumerable=e.enumerable||!1,e.configurable=!0,"value"in e&&(e.writable=!0),Object.defineProperty(c,_2(e.key),e)}}function r3(c,l,a){return l&&p2(c.prototype,l),a&&p2(c,a),Object.defineProperty(c,"prototype",{writable:!1}),c}function e1(c,l){var a=typeof Symbol<"u"&&c[Symbol.iterator]||c["@@iterator"];if(!a){if(Array.isArray(c)||(a=W1(c))||l&&c&&typeof c.length=="number"){a&&(c=a);var e=0,r=function(){};return{s:r,n:function(){return e>=c.length?{done:!0}:{done:!1,value:c[e++]}},e:function(n){throw n},f:r}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var i,f=!0,s=!1;return{s:function(){a=a.call(c)},n:function(){var n=a.next();return f=n.done,n},e:function(n){s=!0,i=n},f:function(){try{f||a.return==null||a.return()}finally{if(s)throw i}}}}function p(c,l,a){return(l=_2(l))in c?Object.defineProperty(c,l,{value:a,enumerable:!0,configurable:!0,writable:!0}):c[l]=a,c}function i3(c){if(typeof Symbol<"u"&&c[Symbol.iterator]!=null||c["@@iterator"]!=null)return Array.from(c)}function f3(c,l){var a=c==null?null:typeof Symbol<"u"&&c[Symbol.iterator]||c["@@iterator"];if(a!=null){var e,r,i,f,s=[],n=!0,t=!1;try{if(i=(a=a.call(c)).next,l===0){if(Object(a)!==a)return;n=!1}else for(;!(n=(e=i.call(a)).done)&&(s.push(e.value),s.length!==l);n=!0);}catch(m){t=!0,r=m}finally{try{if(!n&&a.return!=null&&(f=a.return(),Object(f)!==f))return}finally{if(t)throw r}}return s}}function s3(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function n3(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function L2(c,l){var a=Object.keys(c);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(c);l&&(e=e.filter(function(r){return Object.getOwnPropertyDescriptor(c,r).enumerable})),a.push.apply(a,e)}return a}function o(c){for(var l=1;l<arguments.length;l++){var a=arguments[l]!=null?arguments[l]:{};l%2?L2(Object(a),!0).forEach(function(e){p(c,e,a[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(c,Object.getOwnPropertyDescriptors(a)):L2(Object(a)).forEach(function(e){Object.defineProperty(c,e,Object.getOwnPropertyDescriptor(a,e))})}return c}function o1(c,l){return a3(c)||f3(c,l)||W1(c,l)||s3()}function w(c){return l3(c)||i3(c)||W1(c)||n3()}function o3(c,l){if(typeof c!="object"||!c)return c;var a=c[Symbol.toPrimitive];if(a!==void 0){var e=a.call(c,l||"default");if(typeof e!="object")return e;throw new TypeError("@@toPrimitive must return a primitive value.")}return(l==="string"?String:Number)(c)}function _2(c){var l=o3(c,"string");return typeof l=="symbol"?l:l+""}function f1(c){"@babel/helpers - typeof";return f1=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(l){return typeof l}:function(l){return l&&typeof Symbol=="function"&&l.constructor===Symbol&&l!==Symbol.prototype?"symbol":typeof l},f1(c)}function W1(c,l){if(c){if(typeof c=="string")return y1(c,l);var a={}.toString.call(c).slice(8,-1);return a==="Object"&&c.constructor&&(a=c.constructor.name),a==="Map"||a==="Set"?Array.from(c):a==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)?y1(c,l):void 0}}var u2=function(){},G1={},$2={},X2=null,K2={mark:u2,measure:u2};try{typeof window<"u"&&(G1=window),typeof document<"u"&&($2=document),typeof MutationObserver<"u"&&(X2=MutationObserver),typeof performance<"u"&&(K2=performance)}catch{}var t3=G1.navigator||{},d2=t3.userAgent,v2=d2===void 0?"":d2,H=G1,d=$2,C2=X2,a1=K2,k5=!!H.document,B=!!d.documentElement&&!!d.head&&typeof d.addEventListener=="function"&&typeof d.createElement=="function",Y2=~v2.indexOf("MSIE")||~v2.indexOf("Trident/"),C1,z3=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/,m3=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Whiteboard)?.*/i,J2={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},M3={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},Q2=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],g="classic",J="duotone",Z2="sharp",c4="sharp-duotone",a4="chisel",l4="etch",e4="jelly",r4="jelly-duo",i4="jelly-fill",f4="notdog",s4="notdog-duo",n4="slab",o4="slab-press",t4="thumbprint",z4="utility",m4="utility-duo",M4="utility-fill",p4="whiteboard",p3="Classic",L3="Duotone",u3="Sharp",d3="Sharp Duotone",v3="Chisel",C3="Etch",h3="Jelly",g3="Jelly Duo",x3="Jelly Fill",b3="Notdog",S3="Notdog Duo",N3="Slab",y3="Slab Press",k3="Thumbprint",w3="Utility",A3="Utility Duo",F3="Utility Fill",P3="Whiteboard",L4=[g,J,Z2,c4,a4,l4,e4,r4,i4,f4,s4,n4,o4,t4,z4,m4,M4,p4],w5=(C1={},p(p(p(p(p(p(p(p(p(p(C1,g,p3),J,L3),Z2,u3),c4,d3),a4,v3),l4,C3),e4,h3),r4,g3),i4,x3),f4,b3),p(p(p(p(p(p(p(p(C1,s4,S3),n4,N3),o4,y3),t4,k3),z4,w3),m4,A3),M4,F3),p4,P3)),T3={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},B3={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},D3=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),H3={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-press":{regular:"faslpr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},whiteboard:{semibold:"fawsb"}},u4=["fak","fa-kit","fakd","fa-kit-duotone"],h2={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},R3=["kit"],q3="kit",E3="kit-duotone",U3="Kit",I3="Kit Duotone",A5=p(p({},q3,U3),E3,I3),W3={kit:{"fa-kit":"fak"},"kit-duotone":{"fa-kit-duotone":"fakd"}},G3={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},O3={kit:{fak:"fa-kit"},"kit-duotone":{fakd:"fa-kit-duotone"}},g2={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},h1,l1={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},j3=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],V3="classic",_3="duotone",$3="sharp",X3="sharp-duotone",K3="chisel",Y3="etch",J3="jelly",Q3="jelly-duo",Z3="jelly-fill",c0="notdog",a0="notdog-duo",l0="slab",e0="slab-press",r0="thumbprint",i0="utility",f0="utility-duo",s0="utility-fill",n0="whiteboard",o0="Classic",t0="Duotone",z0="Sharp",m0="Sharp Duotone",M0="Chisel",p0="Etch",L0="Jelly",u0="Jelly Duo",d0="Jelly Fill",v0="Notdog",C0="Notdog Duo",h0="Slab",g0="Slab Press",x0="Thumbprint",b0="Utility",S0="Utility Duo",N0="Utility Fill",y0="Whiteboard",F5=(h1={},p(p(p(p(p(p(p(p(p(p(h1,V3,o0),_3,t0),$3,z0),X3,m0),K3,M0),Y3,p0),J3,L0),Q3,u0),Z3,d0),c0,v0),p(p(p(p(p(p(p(p(h1,a0,C0),l0,h0),e0,g0),r0,x0),i0,b0),f0,S0),s0,N0),n0,y0)),k0="kit",w0="kit-duotone",A0="Kit",F0="Kit Duotone",P5=p(p({},k0,A0),w0,F0),P0={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},T0={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},k1={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},B0=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],d4=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fawsb","fatl","fans","fands","faes","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(j3,B0),D0=["solid","regular","light","thin","duotone","brands","semibold"],v4=[1,2,3,4,5,6,7,8,9,10],H0=v4.concat([11,12,13,14,15,16,17,18,19,20]),R0=["aw","fw","pull-left","pull-right"],q0=[].concat(w(Object.keys(T0)),D0,R0,["2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","inverse","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul","width-auto","width-fixed",l1.GROUP,l1.SWAP_OPACITY,l1.PRIMARY,l1.SECONDARY]).concat(v4.map(function(c){return"".concat(c,"x")})).concat(H0.map(function(c){return"w-".concat(c)})),E0={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},P="___FONT_AWESOME___",w1=16,C4="fa",h4="svg-inline--fa",I="data-fa-i2svg",A1="data-fa-pseudo-element",U0="data-fa-pseudo-element-pending",O1="data-prefix",j1="data-icon",x2="fontawesome-i2svg",I0="async",W0=["HTML","HEAD","STYLE","SCRIPT"],g4=["::before","::after",":before",":after"],x4=(function(){try{return!0}catch{return!1}})();function Q(c){return new Proxy(c,{get:function(a,e){return e in a?a[e]:a[g]}})}var b4=o({},J2);b4[g]=o(o(o(o({},{"fa-duotone":"duotone"}),J2[g]),h2.kit),h2["kit-duotone"]);var G0=Q(b4),F1=o({},H3);F1[g]=o(o(o(o({},{duotone:"fad"}),F1[g]),g2.kit),g2["kit-duotone"]);var b2=Q(F1),P1=o({},k1);P1[g]=o(o({},P1[g]),O3.kit);var V1=Q(P1),T1=o({},P0);T1[g]=o(o({},T1[g]),W3.kit);var T5=Q(T1),O0=z3,S4="fa-layers-text",j0=m3,V0=o({},T3),B5=Q(V0),_0=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],g1=M3,$0=[].concat(w(R3),w(q0)),X=H.FontAwesomeConfig||{};function X0(c){var l=d.querySelector("script["+c+"]");if(l)return l.getAttribute(c)}function K0(c){return c===""?!0:c==="false"?!1:c==="true"?!0:c}d&&typeof d.querySelector=="function"&&(S2=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]],S2.forEach(function(c){var l=o1(c,2),a=l[0],e=l[1],r=K0(X0(a));r!=null&&(X[e]=r)}));var S2,N4={styleDefault:"solid",familyDefault:g,cssPrefix:C4,replacementClass:h4,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};X.familyPrefix&&(X.cssPrefix=X.familyPrefix);var V=o(o({},N4),X);V.autoReplaceSvg||(V.observeMutations=!1);var M={};Object.keys(N4).forEach(function(c){Object.defineProperty(M,c,{enumerable:!0,set:function(a){V[c]=a,K.forEach(function(e){return e(M)})},get:function(){return V[c]}})});Object.defineProperty(M,"familyPrefix",{enumerable:!0,set:function(l){V.cssPrefix=l,K.forEach(function(a){return a(M)})},get:function(){return V.cssPrefix}});H.FontAwesomeConfig=M;var K=[];function Y0(c){return K.push(c),function(){K.splice(K.indexOf(c),1)}}var D=w1,A={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function J0(c){if(!(!c||!B)){var l=d.createElement("style");l.setAttribute("type","text/css"),l.innerHTML=c;for(var a=d.head.childNodes,e=null,r=a.length-1;r>-1;r--){var i=a[r],f=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(f)>-1&&(e=i)}return d.head.insertBefore(l,e),c}}var Q0="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function N2(){for(var c=12,l="";c-- >0;)l+=Q0[Math.random()*62|0];return l}function _(c){for(var l=[],a=(c||[]).length>>>0;a--;)l[a]=c[a];return l}function _1(c){return c.classList?_(c.classList):(c.getAttribute("class")||"").split(" ").filter(function(l){return l})}function y4(c){return"".concat(c).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Z0(c){return Object.keys(c||{}).reduce(function(l,a){return l+"".concat(a,'="').concat(y4(c[a]),'" ')},"").trim()}function t1(c){return Object.keys(c||{}).reduce(function(l,a){return l+"".concat(a,": ").concat(c[a].trim(),";")},"")}function $1(c){return c.size!==A.size||c.x!==A.x||c.y!==A.y||c.rotate!==A.rotate||c.flipX||c.flipY}function c6(c){var l=c.transform,a=c.containerWidth,e=c.iconWidth,r={transform:"translate(".concat(a/2," 256)")},i="translate(".concat(l.x*32,", ").concat(l.y*32,") "),f="scale(".concat(l.size/16*(l.flipX?-1:1),", ").concat(l.size/16*(l.flipY?-1:1),") "),s="rotate(".concat(l.rotate," 0 0)"),n={transform:"".concat(i," ").concat(f," ").concat(s)},t={transform:"translate(".concat(e/2*-1," -256)")};return{outer:r,inner:n,path:t}}function a6(c){var l=c.transform,a=c.width,e=a===void 0?w1:a,r=c.height,i=r===void 0?w1:r,f=c.startCentered,s=f===void 0?!1:f,n="";return s&&Y2?n+="translate(".concat(l.x/D-e/2,"em, ").concat(l.y/D-i/2,"em) "):s?n+="translate(calc(-50% + ".concat(l.x/D,"em), calc(-50% + ").concat(l.y/D,"em)) "):n+="translate(".concat(l.x/D,"em, ").concat(l.y/D,"em) "),n+="scale(".concat(l.size/D*(l.flipX?-1:1),", ").concat(l.size/D*(l.flipY?-1:1),") "),n+="rotate(".concat(l.rotate,"deg) "),n}var l6=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 7 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 7 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 7 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 7 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 7 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 7 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-slab-regular: normal 400 1em/1 "Font Awesome 7 Slab";
  --fa-font-slab-press-regular: normal 400 1em/1 "Font Awesome 7 Slab Press";
  --fa-font-whiteboard-semibold: normal 600 1em/1 "Font Awesome 7 Whiteboard";
  --fa-font-thumbprint-light: normal 300 1em/1 "Font Awesome 7 Thumbprint";
  --fa-font-notdog-solid: normal 900 1em/1 "Font Awesome 7 Notdog";
  --fa-font-notdog-duo-solid: normal 900 1em/1 "Font Awesome 7 Notdog Duo";
  --fa-font-etch-solid: normal 900 1em/1 "Font Awesome 7 Etch";
  --fa-font-jelly-regular: normal 400 1em/1 "Font Awesome 7 Jelly";
  --fa-font-jelly-fill-regular: normal 400 1em/1 "Font Awesome 7 Jelly Fill";
  --fa-font-jelly-duo-regular: normal 400 1em/1 "Font Awesome 7 Jelly Duo";
  --fa-font-chisel-regular: normal 400 1em/1 "Font Awesome 7 Chisel";
  --fa-font-utility-semibold: normal 600 1em/1 "Font Awesome 7 Utility";
  --fa-font-utility-duo-semibold: normal 600 1em/1 "Font Awesome 7 Utility Duo";
  --fa-font-utility-fill-semibold: normal 600 1em/1 "Font Awesome 7 Utility Fill";
}

.svg-inline--fa {
  box-sizing: content-box;
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285714em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left,
.svg-inline--fa .fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-pull-right,
.svg-inline--fa .fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  inset-block-start: 0.25em; /* syncing vertical alignment with Web Font rendering */
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.fa-layers .svg-inline--fa {
  inset: 0;
  margin: auto;
  position: absolute;
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: calc(10 / 16 * 1em); /* converts a 10px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 10 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 10 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xs {
  font-size: calc(12 / 16 * 1em); /* converts a 12px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 12 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 12 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-sm {
  font-size: calc(14 / 16 * 1em); /* converts a 14px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 14 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 14 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-lg {
  font-size: calc(20 / 16 * 1em); /* converts a 20px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 20 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 20 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xl {
  font-size: calc(24 / 16 * 1em); /* converts a 24px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 24 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 24 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-2xl {
  font-size: calc(32 / 16 * 1em); /* converts a 32px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 32 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 32 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-width-auto {
  --fa-width: auto;
}

.fa-fw,
.fa-width-fixed {
  --fa-width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-inline-start: var(--fa-li-margin, 2.5em);
  padding-inline-start: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

/* Heads Up: Bordered Icons will not be supported in the future!
  - This feature will be deprecated in the next major release of Font Awesome (v8)!
  - You may continue to use it in this version *v7), but it will not be supported in Font Awesome v8.
*/
/* Notes:
* --@{v.$css-prefix}-border-width = 1/16 by default (to render as ~1px based on a 16px default font-size)
* --@{v.$css-prefix}-border-padding =
  ** 3/16 for vertical padding (to give ~2px of vertical whitespace around an icon considering it's vertical alignment)
  ** 4/16 for horizontal padding (to give ~4px of horizontal whitespace around an icon)
*/
.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.0625em);
  box-sizing: var(--fa-border-box-sizing, content-box);
  padding: var(--fa-border-padding, 0.1875em 0.25em);
}

.fa-pull-left,
.fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right,
.fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
  .fa-bounce,
  .fa-fade,
  .fa-beat-fade,
  .fa-flip,
  .fa-pulse,
  .fa-shake,
  .fa-spin,
  .fa-spin-pulse {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.svg-inline--fa.fa-inverse {
  fill: var(--fa-inverse, #fff);
}

.fa-stack {
  display: inline-block;
  height: 2em;
  line-height: 2em;
  position: relative;
  vertical-align: middle;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.svg-inline--fa.fa-stack-1x {
  --fa-width: 1.25em;
  height: 1em;
  width: var(--fa-width);
}
.svg-inline--fa.fa-stack-2x {
  --fa-width: 2.5em;
  height: 2em;
  width: var(--fa-width);
}

.fa-stack-1x,
.fa-stack-2x {
  inset: 0;
  margin: auto;
  position: absolute;
  z-index: var(--fa-stack-z-index, auto);
}`;function k4(){var c=C4,l=h4,a=M.cssPrefix,e=M.replacementClass,r=l6;if(a!==c||e!==l){var i=new RegExp("\\.".concat(c,"\\-"),"g"),f=new RegExp("\\--".concat(c,"\\-"),"g"),s=new RegExp("\\.".concat(l),"g");r=r.replace(i,".".concat(a,"-")).replace(f,"--".concat(a,"-")).replace(s,".".concat(e))}return r}var y2=!1;function x1(){M.autoAddCss&&!y2&&(J0(k4()),y2=!0)}var e6={mixout:function(){return{dom:{css:k4,insertCss:x1}}},hooks:function(){return{beforeDOMElementCreation:function(){x1()},beforeI2svg:function(){x1()}}}},T=H||{};T[P]||(T[P]={});T[P].styles||(T[P].styles={});T[P].hooks||(T[P].hooks={});T[P].shims||(T[P].shims=[]);var k=T[P],w4=[],A4=function(){d.removeEventListener("DOMContentLoaded",A4),s1=1,w4.map(function(l){return l()})},s1=!1;B&&(s1=(d.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(d.readyState),s1||d.addEventListener("DOMContentLoaded",A4));function r6(c){B&&(s1?setTimeout(c,0):w4.push(c))}function Z(c){var l=c.tag,a=c.attributes,e=a===void 0?{}:a,r=c.children,i=r===void 0?[]:r;return typeof c=="string"?y4(c):"<".concat(l," ").concat(Z0(e),">").concat(i.map(Z).join(""),"</").concat(l,">")}function k2(c,l,a){if(c&&c[l]&&c[l][a])return{prefix:l,iconName:a,icon:c[l][a]}}var i6=function(l,a){return function(e,r,i,f){return l.call(a,e,r,i,f)}},b1=function(l,a,e,r){var i=Object.keys(l),f=i.length,s=r!==void 0?i6(a,r):a,n,t,m;for(e===void 0?(n=1,m=l[i[0]]):(n=0,m=e);n<f;n++)t=i[n],m=s(m,l[t],t,l);return m};function F4(c){return w(c).length!==1?null:c.codePointAt(0).toString(16)}function w2(c){return Object.keys(c).reduce(function(l,a){var e=c[a],r=!!e.icon;return r?l[e.iconName]=e.icon:l[a]=e,l},{})}function B1(c,l){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},e=a.skipHooks,r=e===void 0?!1:e,i=w2(l);typeof k.hooks.addPack=="function"&&!r?k.hooks.addPack(c,w2(l)):k.styles[c]=o(o({},k.styles[c]||{}),i),c==="fas"&&B1("fa",l)}var Y=k.styles,f6=k.shims,P4=Object.keys(V1),s6=P4.reduce(function(c,l){return c[l]=Object.keys(V1[l]),c},{}),X1=null,T4={},B4={},D4={},H4={},R4={};function n6(c){return~$0.indexOf(c)}function o6(c,l){var a=l.split("-"),e=a[0],r=a.slice(1).join("-");return e===c&&r!==""&&!n6(r)?r:null}var q4=function(){var l=function(i){return b1(Y,function(f,s,n){return f[n]=b1(s,i,{}),f},{})};T4=l(function(r,i,f){if(i[3]&&(r[i[3]]=f),i[2]){var s=i[2].filter(function(n){return typeof n=="number"});s.forEach(function(n){r[n.toString(16)]=f})}return r}),B4=l(function(r,i,f){if(r[f]=f,i[2]){var s=i[2].filter(function(n){return typeof n=="string"});s.forEach(function(n){r[n]=f})}return r}),R4=l(function(r,i,f){var s=i[2];return r[f]=f,s.forEach(function(n){r[n]=f}),r});var a="far"in Y||M.autoFetchSvg,e=b1(f6,function(r,i){var f=i[0],s=i[1],n=i[2];return s==="far"&&!a&&(s="fas"),typeof f=="string"&&(r.names[f]={prefix:s,iconName:n}),typeof f=="number"&&(r.unicodes[f.toString(16)]={prefix:s,iconName:n}),r},{names:{},unicodes:{}});D4=e.names,H4=e.unicodes,X1=z1(M.styleDefault,{family:M.familyDefault})};Y0(function(c){X1=z1(c.styleDefault,{family:M.familyDefault})});q4();function K1(c,l){return(T4[c]||{})[l]}function t6(c,l){return(B4[c]||{})[l]}function U(c,l){return(R4[c]||{})[l]}function E4(c){return D4[c]||{prefix:null,iconName:null}}function z6(c){var l=H4[c],a=K1("fas",c);return l||(a?{prefix:"fas",iconName:a}:null)||{prefix:null,iconName:null}}function R(){return X1}var U4=function(){return{prefix:null,iconName:null,rest:[]}};function m6(c){var l=g,a=P4.reduce(function(e,r){return e[r]="".concat(M.cssPrefix,"-").concat(r),e},{});return L4.forEach(function(e){(c.includes(a[e])||c.some(function(r){return s6[e].includes(r)}))&&(l=e)}),l}function z1(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=l.family,e=a===void 0?g:a,r=G0[e][c];if(e===J&&!c)return"fad";var i=b2[e][c]||b2[e][r],f=c in k.styles?c:null,s=i||f||null;return s}function M6(c){var l=[],a=null;return c.forEach(function(e){var r=o6(M.cssPrefix,e);r?a=r:e&&l.push(e)}),{iconName:a,rest:l}}function A2(c){return c.sort().filter(function(l,a,e){return e.indexOf(l)===a})}var F2=d4.concat(u4);function m1(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=l.skipLookups,e=a===void 0?!1:a,r=null,i=A2(c.filter(function(L){return F2.includes(L)})),f=A2(c.filter(function(L){return!F2.includes(L)})),s=i.filter(function(L){return r=L,!Q2.includes(L)}),n=o1(s,1),t=n[0],m=t===void 0?null:t,z=m6(i),u=o(o({},M6(f)),{},{prefix:z1(m,{family:z})});return o(o(o({},u),d6({values:c,family:z,styles:Y,config:M,canonical:u,givenPrefix:r})),p6(e,r,u))}function p6(c,l,a){var e=a.prefix,r=a.iconName;if(c||!e||!r)return{prefix:e,iconName:r};var i=l==="fa"?E4(r):{},f=U(e,r);return r=i.iconName||f||r,e=i.prefix||e,e==="far"&&!Y.far&&Y.fas&&!M.autoFetchSvg&&(e="fas"),{prefix:e,iconName:r}}var L6=L4.filter(function(c){return c!==g||c!==J}),u6=Object.keys(k1).filter(function(c){return c!==g}).map(function(c){return Object.keys(k1[c])}).flat();function d6(c){var l=c.values,a=c.family,e=c.canonical,r=c.givenPrefix,i=r===void 0?"":r,f=c.styles,s=f===void 0?{}:f,n=c.config,t=n===void 0?{}:n,m=a===J,z=l.includes("fa-duotone")||l.includes("fad"),u=t.familyDefault==="duotone",L=e.prefix==="fad"||e.prefix==="fa-duotone";if(!m&&(z||u||L)&&(e.prefix="fad"),(l.includes("fa-brands")||l.includes("fab"))&&(e.prefix="fab"),!e.prefix&&L6.includes(a)){var C=Object.keys(s).find(function(x){return u6.includes(x)});if(C||t.autoFetchSvg){var v=D3.get(a).defaultShortPrefixId;e.prefix=v,e.iconName=U(e.prefix,e.iconName)||e.iconName}}return(e.prefix==="fa"||i==="fa")&&(e.prefix=R()||"fas"),e}var v6=(function(){function c(){e3(this,c),this.definitions={}}return r3(c,[{key:"add",value:function(){for(var a=this,e=arguments.length,r=new Array(e),i=0;i<e;i++)r[i]=arguments[i];var f=r.reduce(this._pullDefinitions,{});Object.keys(f).forEach(function(s){a.definitions[s]=o(o({},a.definitions[s]||{}),f[s]),B1(s,f[s]);var n=V1[g][s];n&&B1(n,f[s]),q4()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(a,e){var r=e.prefix&&e.iconName&&e.icon?{0:e}:e;return Object.keys(r).map(function(i){var f=r[i],s=f.prefix,n=f.iconName,t=f.icon,m=t[2];a[s]||(a[s]={}),m.length>0&&m.forEach(function(z){typeof z=="string"&&(a[s][z]=t)}),a[s][n]=t}),a}}])})(),P2=[],O={},j={},C6=Object.keys(j);function h6(c,l){var a=l.mixoutsTo;return P2=c,O={},Object.keys(j).forEach(function(e){C6.indexOf(e)===-1&&delete j[e]}),P2.forEach(function(e){var r=e.mixout?e.mixout():{};if(Object.keys(r).forEach(function(f){typeof r[f]=="function"&&(a[f]=r[f]),f1(r[f])==="object"&&Object.keys(r[f]).forEach(function(s){a[f]||(a[f]={}),a[f][s]=r[f][s]})}),e.hooks){var i=e.hooks();Object.keys(i).forEach(function(f){O[f]||(O[f]=[]),O[f].push(i[f])})}e.provides&&e.provides(j)}),a}function D1(c,l){for(var a=arguments.length,e=new Array(a>2?a-2:0),r=2;r<a;r++)e[r-2]=arguments[r];var i=O[c]||[];return i.forEach(function(f){l=f.apply(null,[l].concat(e))}),l}function W(c){for(var l=arguments.length,a=new Array(l>1?l-1:0),e=1;e<l;e++)a[e-1]=arguments[e];var r=O[c]||[];r.forEach(function(i){i.apply(null,a)})}function q(){var c=arguments[0],l=Array.prototype.slice.call(arguments,1);return j[c]?j[c].apply(null,l):void 0}function H1(c){c.prefix==="fa"&&(c.prefix="fas");var l=c.iconName,a=c.prefix||R();if(l)return l=U(a,l)||l,k2(I4.definitions,a,l)||k2(k.styles,a,l)}var I4=new v6,g6=function(){M.autoReplaceSvg=!1,M.observeMutations=!1,W("noAuto")},x6={i2svg:function(){var l=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return B?(W("beforeI2svg",l),q("pseudoElements2svg",l),q("i2svg",l)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var l=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},a=l.autoReplaceSvgRoot;M.autoReplaceSvg===!1&&(M.autoReplaceSvg=!0),M.observeMutations=!0,r6(function(){S6({autoReplaceSvgRoot:a}),W("watch",l)})}},b6={icon:function(l){if(l===null)return null;if(f1(l)==="object"&&l.prefix&&l.iconName)return{prefix:l.prefix,iconName:U(l.prefix,l.iconName)||l.iconName};if(Array.isArray(l)&&l.length===2){var a=l[1].indexOf("fa-")===0?l[1].slice(3):l[1],e=z1(l[0]);return{prefix:e,iconName:U(e,a)||a}}if(typeof l=="string"&&(l.indexOf("".concat(M.cssPrefix,"-"))>-1||l.match(O0))){var r=m1(l.split(" "),{skipLookups:!0});return{prefix:r.prefix||R(),iconName:U(r.prefix,r.iconName)||r.iconName}}if(typeof l=="string"){var i=R();return{prefix:i,iconName:U(i,l)||l}}}},N={noAuto:g6,config:M,dom:x6,parse:b6,library:I4,findIconDefinition:H1,toHtml:Z},S6=function(){var l=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},a=l.autoReplaceSvgRoot,e=a===void 0?d:a;(Object.keys(k.styles).length>0||M.autoFetchSvg)&&B&&M.autoReplaceSvg&&N.dom.i2svg({node:e})};function M1(c,l){return Object.defineProperty(c,"abstract",{get:l}),Object.defineProperty(c,"html",{get:function(){return c.abstract.map(function(e){return Z(e)})}}),Object.defineProperty(c,"node",{get:function(){if(B){var e=d.createElement("div");return e.innerHTML=c.html,e.children}}}),c}function N6(c){var l=c.children,a=c.main,e=c.mask,r=c.attributes,i=c.styles,f=c.transform;if($1(f)&&a.found&&!e.found){var s=a.width,n=a.height,t={x:s/n/2,y:.5};r.style=t1(o(o({},i),{},{"transform-origin":"".concat(t.x+f.x/16,"em ").concat(t.y+f.y/16,"em")}))}return[{tag:"svg",attributes:r,children:l}]}function y6(c){var l=c.prefix,a=c.iconName,e=c.children,r=c.attributes,i=c.symbol,f=i===!0?"".concat(l,"-").concat(M.cssPrefix,"-").concat(a):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:o(o({},r),{},{id:f}),children:e}]}]}function k6(c){var l=["aria-label","aria-labelledby","title","role"];return l.some(function(a){return a in c})}function Y1(c){var l=c.icons,a=l.main,e=l.mask,r=c.prefix,i=c.iconName,f=c.transform,s=c.symbol,n=c.maskId,t=c.extra,m=c.watchable,z=m===void 0?!1:m,u=e.found?e:a,L=u.width,C=u.height,v=[M.replacementClass,i?"".concat(M.cssPrefix,"-").concat(i):""].filter(function(F){return t.classes.indexOf(F)===-1}).filter(function(F){return F!==""||!!F}).concat(t.classes).join(" "),x={children:[],attributes:o(o({},t.attributes),{},{"data-prefix":r,"data-icon":i,class:v,role:t.attributes.role||"img",viewBox:"0 0 ".concat(L," ").concat(C)})};!k6(t.attributes)&&!t.attributes["aria-hidden"]&&(x.attributes["aria-hidden"]="true"),z&&(x.attributes[I]="");var h=o(o({},x),{},{prefix:r,iconName:i,main:a,mask:e,maskId:n,transform:f,symbol:s,styles:o({},t.styles)}),S=e.found&&a.found?q("generateAbstractMask",h)||{children:[],attributes:{}}:q("generateAbstractIcon",h)||{children:[],attributes:{}},y=S.children,G=S.attributes;return h.children=y,h.attributes=G,s?y6(h):N6(h)}function T2(c){var l=c.content,a=c.width,e=c.height,r=c.transform,i=c.extra,f=c.watchable,s=f===void 0?!1:f,n=o(o({},i.attributes),{},{class:i.classes.join(" ")});s&&(n[I]="");var t=o({},i.styles);$1(r)&&(t.transform=a6({transform:r,startCentered:!0,width:a,height:e}),t["-webkit-transform"]=t.transform);var m=t1(t);m.length>0&&(n.style=m);var z=[];return z.push({tag:"span",attributes:n,children:[l]}),z}function w6(c){var l=c.content,a=c.extra,e=o(o({},a.attributes),{},{class:a.classes.join(" ")}),r=t1(a.styles);r.length>0&&(e.style=r);var i=[];return i.push({tag:"span",attributes:e,children:[l]}),i}var S1=k.styles;function R1(c){var l=c[0],a=c[1],e=c.slice(4),r=o1(e,1),i=r[0],f=null;return Array.isArray(i)?f={tag:"g",attributes:{class:"".concat(M.cssPrefix,"-").concat(g1.GROUP)},children:[{tag:"path",attributes:{class:"".concat(M.cssPrefix,"-").concat(g1.SECONDARY),fill:"currentColor",d:i[0]}},{tag:"path",attributes:{class:"".concat(M.cssPrefix,"-").concat(g1.PRIMARY),fill:"currentColor",d:i[1]}}]}:f={tag:"path",attributes:{fill:"currentColor",d:i}},{found:!0,width:l,height:a,icon:f}}var A6={found:!1,width:512,height:512};function F6(c,l){!x4&&!M.showMissingIcons&&c&&console.error('Icon with name "'.concat(c,'" and prefix "').concat(l,'" is missing.'))}function q1(c,l){var a=l;return l==="fa"&&M.styleDefault!==null&&(l=R()),new Promise(function(e,r){if(a==="fa"){var i=E4(c)||{};c=i.iconName||c,l=i.prefix||l}if(c&&l&&S1[l]&&S1[l][c]){var f=S1[l][c];return e(R1(f))}F6(c,l),e(o(o({},A6),{},{icon:M.showMissingIcons&&c?q("missingIconAbstract")||{}:{}}))})}var B2=function(){},E1=M.measurePerformance&&a1&&a1.mark&&a1.measure?a1:{mark:B2,measure:B2},$='FA "7.1.0"',P6=function(l){return E1.mark("".concat($," ").concat(l," begins")),function(){return W4(l)}},W4=function(l){E1.mark("".concat($," ").concat(l," ends")),E1.measure("".concat($," ").concat(l),"".concat($," ").concat(l," begins"),"".concat($," ").concat(l," ends"))},J1={begin:P6,end:W4},r1=function(){};function D2(c){var l=c.getAttribute?c.getAttribute(I):null;return typeof l=="string"}function T6(c){var l=c.getAttribute?c.getAttribute(O1):null,a=c.getAttribute?c.getAttribute(j1):null;return l&&a}function B6(c){return c&&c.classList&&c.classList.contains&&c.classList.contains(M.replacementClass)}function D6(){if(M.autoReplaceSvg===!0)return i1.replace;var c=i1[M.autoReplaceSvg];return c||i1.replace}function H6(c){return d.createElementNS("http://www.w3.org/2000/svg",c)}function R6(c){return d.createElement(c)}function G4(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},a=l.ceFn,e=a===void 0?c.tag==="svg"?H6:R6:a;if(typeof c=="string")return d.createTextNode(c);var r=e(c.tag);Object.keys(c.attributes||[]).forEach(function(f){r.setAttribute(f,c.attributes[f])});var i=c.children||[];return i.forEach(function(f){r.appendChild(G4(f,{ceFn:e}))}),r}function q6(c){var l=" ".concat(c.outerHTML," ");return l="".concat(l,"Font Awesome fontawesome.com "),l}var i1={replace:function(l){var a=l[0];if(a.parentNode)if(l[1].forEach(function(r){a.parentNode.insertBefore(G4(r),a)}),a.getAttribute(I)===null&&M.keepOriginalSource){var e=d.createComment(q6(a));a.parentNode.replaceChild(e,a)}else a.remove()},nest:function(l){var a=l[0],e=l[1];if(~_1(a).indexOf(M.replacementClass))return i1.replace(l);var r=new RegExp("".concat(M.cssPrefix,"-.*"));if(delete e[0].attributes.id,e[0].attributes.class){var i=e[0].attributes.class.split(" ").reduce(function(s,n){return n===M.replacementClass||n.match(r)?s.toSvg.push(n):s.toNode.push(n),s},{toNode:[],toSvg:[]});e[0].attributes.class=i.toSvg.join(" "),i.toNode.length===0?a.removeAttribute("class"):a.setAttribute("class",i.toNode.join(" "))}var f=e.map(function(s){return Z(s)}).join(`
`);a.setAttribute(I,""),a.innerHTML=f}};function H2(c){c()}function O4(c,l){var a=typeof l=="function"?l:r1;if(c.length===0)a();else{var e=H2;M.mutateApproach===I0&&(e=H.requestAnimationFrame||H2),e(function(){var r=D6(),i=J1.begin("mutate");c.map(r),i(),a()})}}var Q1=!1;function j4(){Q1=!0}function U1(){Q1=!1}var n1=null;function R2(c){if(C2&&M.observeMutations){var l=c.treeCallback,a=l===void 0?r1:l,e=c.nodeCallback,r=e===void 0?r1:e,i=c.pseudoElementsCallback,f=i===void 0?r1:i,s=c.observeMutationsRoot,n=s===void 0?d:s;n1=new C2(function(t){if(!Q1){var m=R();_(t).forEach(function(z){if(z.type==="childList"&&z.addedNodes.length>0&&!D2(z.addedNodes[0])&&(M.searchPseudoElements&&f(z.target),a(z.target)),z.type==="attributes"&&z.target.parentNode&&M.searchPseudoElements&&f([z.target],!0),z.type==="attributes"&&D2(z.target)&&~_0.indexOf(z.attributeName))if(z.attributeName==="class"&&T6(z.target)){var u=m1(_1(z.target)),L=u.prefix,C=u.iconName;z.target.setAttribute(O1,L||m),C&&z.target.setAttribute(j1,C)}else B6(z.target)&&r(z.target)})}}),B&&n1.observe(n,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function E6(){n1&&n1.disconnect()}function U6(c){var l=c.getAttribute("style"),a=[];return l&&(a=l.split(";").reduce(function(e,r){var i=r.split(":"),f=i[0],s=i.slice(1);return f&&s.length>0&&(e[f]=s.join(":").trim()),e},{})),a}function I6(c){var l=c.getAttribute("data-prefix"),a=c.getAttribute("data-icon"),e=c.innerText!==void 0?c.innerText.trim():"",r=m1(_1(c));return r.prefix||(r.prefix=R()),l&&a&&(r.prefix=l,r.iconName=a),r.iconName&&r.prefix||(r.prefix&&e.length>0&&(r.iconName=t6(r.prefix,c.innerText)||K1(r.prefix,F4(c.innerText))),!r.iconName&&M.autoFetchSvg&&c.firstChild&&c.firstChild.nodeType===Node.TEXT_NODE&&(r.iconName=c.firstChild.data)),r}function W6(c){var l=_(c.attributes).reduce(function(a,e){return a.name!=="class"&&a.name!=="style"&&(a[e.name]=e.value),a},{});return l}function G6(){return{iconName:null,prefix:null,transform:A,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function q2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},a=I6(c),e=a.iconName,r=a.prefix,i=a.rest,f=W6(c),s=D1("parseNodeAttributes",{},c),n=l.styleParser?U6(c):[];return o({iconName:e,prefix:r,transform:A,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:i,styles:n,attributes:f}},s)}var O6=k.styles;function V4(c){var l=M.autoReplaceSvg==="nest"?q2(c,{styleParser:!1}):q2(c);return~l.extra.classes.indexOf(S4)?q("generateLayersText",c,l):q("generateSvgReplacementMutation",c,l)}function j6(){return[].concat(w(u4),w(d4))}function E2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!B)return Promise.resolve();var a=d.documentElement.classList,e=function(z){return a.add("".concat(x2,"-").concat(z))},r=function(z){return a.remove("".concat(x2,"-").concat(z))},i=M.autoFetchSvg?j6():Q2.concat(Object.keys(O6));i.includes("fa")||i.push("fa");var f=[".".concat(S4,":not([").concat(I,"])")].concat(i.map(function(m){return".".concat(m,":not([").concat(I,"])")})).join(", ");if(f.length===0)return Promise.resolve();var s=[];try{s=_(c.querySelectorAll(f))}catch{}if(s.length>0)e("pending"),r("complete");else return Promise.resolve();var n=J1.begin("onTree"),t=s.reduce(function(m,z){try{var u=V4(z);u&&m.push(u)}catch(L){x4||L.name==="MissingIcon"&&console.error(L)}return m},[]);return new Promise(function(m,z){Promise.all(t).then(function(u){O4(u,function(){e("active"),e("complete"),r("pending"),typeof l=="function"&&l(),n(),m()})}).catch(function(u){n(),z(u)})})}function V6(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;V4(c).then(function(a){a&&O4([a],l)})}function _6(c){return function(l){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=(l||{}).icon?l:H1(l||{}),r=a.mask;return r&&(r=(r||{}).icon?r:H1(r||{})),c(e,o(o({},a),{},{mask:r}))}}var $6=function(l){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=a.transform,r=e===void 0?A:e,i=a.symbol,f=i===void 0?!1:i,s=a.mask,n=s===void 0?null:s,t=a.maskId,m=t===void 0?null:t,z=a.classes,u=z===void 0?[]:z,L=a.attributes,C=L===void 0?{}:L,v=a.styles,x=v===void 0?{}:v;if(l){var h=l.prefix,S=l.iconName,y=l.icon;return M1(o({type:"icon"},l),function(){return W("beforeDOMElementCreation",{iconDefinition:l,params:a}),Y1({icons:{main:R1(y),mask:n?R1(n.icon):{found:!1,width:null,height:null,icon:{}}},prefix:h,iconName:S,transform:o(o({},A),r),symbol:f,maskId:m,extra:{attributes:C,styles:x,classes:u}})})}},X6={mixout:function(){return{icon:_6($6)}},hooks:function(){return{mutationObserverCallbacks:function(a){return a.treeCallback=E2,a.nodeCallback=V6,a}}},provides:function(l){l.i2svg=function(a){var e=a.node,r=e===void 0?d:e,i=a.callback,f=i===void 0?function(){}:i;return E2(r,f)},l.generateSvgReplacementMutation=function(a,e){var r=e.iconName,i=e.prefix,f=e.transform,s=e.symbol,n=e.mask,t=e.maskId,m=e.extra;return new Promise(function(z,u){Promise.all([q1(r,i),n.iconName?q1(n.iconName,n.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(L){var C=o1(L,2),v=C[0],x=C[1];z([a,Y1({icons:{main:v,mask:x},prefix:i,iconName:r,transform:f,symbol:s,maskId:t,extra:m,watchable:!0})])}).catch(u)})},l.generateAbstractIcon=function(a){var e=a.children,r=a.attributes,i=a.main,f=a.transform,s=a.styles,n=t1(s);n.length>0&&(r.style=n);var t;return $1(f)&&(t=q("generateAbstractTransformGrouping",{main:i,transform:f,containerWidth:i.width,iconWidth:i.width})),e.push(t||i.icon),{children:e,attributes:r}}}},K6={mixout:function(){return{layer:function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.classes,i=r===void 0?[]:r;return M1({type:"layer"},function(){W("beforeDOMElementCreation",{assembler:a,params:e});var f=[];return a(function(s){Array.isArray(s)?s.map(function(n){f=f.concat(n.abstract)}):f=f.concat(s.abstract)}),[{tag:"span",attributes:{class:["".concat(M.cssPrefix,"-layers")].concat(w(i)).join(" ")},children:f}]})}}}},Y6={mixout:function(){return{counter:function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.title,i=r===void 0?null:r,f=e.classes,s=f===void 0?[]:f,n=e.attributes,t=n===void 0?{}:n,m=e.styles,z=m===void 0?{}:m;return M1({type:"counter",content:a},function(){return W("beforeDOMElementCreation",{content:a,params:e}),w6({content:a.toString(),title:i,extra:{attributes:t,styles:z,classes:["".concat(M.cssPrefix,"-layers-counter")].concat(w(s))}})})}}}},J6={mixout:function(){return{text:function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.transform,i=r===void 0?A:r,f=e.classes,s=f===void 0?[]:f,n=e.attributes,t=n===void 0?{}:n,m=e.styles,z=m===void 0?{}:m;return M1({type:"text",content:a},function(){return W("beforeDOMElementCreation",{content:a,params:e}),T2({content:a,transform:o(o({},A),i),extra:{attributes:t,styles:z,classes:["".concat(M.cssPrefix,"-layers-text")].concat(w(s))}})})}}},provides:function(l){l.generateLayersText=function(a,e){var r=e.transform,i=e.extra,f=null,s=null;if(Y2){var n=parseInt(getComputedStyle(a).fontSize,10),t=a.getBoundingClientRect();f=t.width/n,s=t.height/n}return Promise.resolve([a,T2({content:a.innerHTML,width:f,height:s,transform:r,extra:i,watchable:!0})])}}},_4=new RegExp('"',"ug"),U2=[1105920,1112319],I2=o(o(o(o({},{FontAwesome:{normal:"fas",400:"fas"}}),B3),E0),G3),I1=Object.keys(I2).reduce(function(c,l){return c[l.toLowerCase()]=I2[l],c},{}),Q6=Object.keys(I1).reduce(function(c,l){var a=I1[l];return c[l]=a[900]||w(Object.entries(a))[0][1],c},{});function Z6(c){var l=c.replace(_4,"");return F4(w(l)[0]||"")}function c5(c){var l=c.getPropertyValue("font-feature-settings").includes("ss01"),a=c.getPropertyValue("content"),e=a.replace(_4,""),r=e.codePointAt(0),i=r>=U2[0]&&r<=U2[1],f=e.length===2?e[0]===e[1]:!1;return i||f||l}function a5(c,l){var a=c.replace(/^['"]|['"]$/g,"").toLowerCase(),e=parseInt(l),r=isNaN(e)?"normal":e;return(I1[a]||{})[r]||Q6[a]}function W2(c,l){var a="".concat(U0).concat(l.replace(":","-"));return new Promise(function(e,r){if(c.getAttribute(a)!==null)return e();var i=_(c.children),f=i.filter(function(p1){return p1.getAttribute(A1)===l})[0],s=H.getComputedStyle(c,l),n=s.getPropertyValue("font-family"),t=n.match(j0),m=s.getPropertyValue("font-weight"),z=s.getPropertyValue("content");if(f&&!t)return c.removeChild(f),e();if(t&&z!=="none"&&z!==""){var u=s.getPropertyValue("content"),L=a5(n,m),C=Z6(u),v=t[0].startsWith("FontAwesome"),x=c5(s),h=K1(L,C),S=h;if(v){var y=z6(C);y.iconName&&y.prefix&&(h=y.iconName,L=y.prefix)}if(h&&!x&&(!f||f.getAttribute(O1)!==L||f.getAttribute(j1)!==S)){c.setAttribute(a,S),f&&c.removeChild(f);var G=G6(),F=G.extra;F.attributes[A1]=l,q1(h,L).then(function(p1){var Z4=Y1(o(o({},G),{},{icons:{main:p1,mask:U4()},prefix:L,iconName:S,extra:F,watchable:!0})),L1=d.createElementNS("http://www.w3.org/2000/svg","svg");l==="::before"?c.insertBefore(L1,c.firstChild):c.appendChild(L1),L1.outerHTML=Z4.map(function(c3){return Z(c3)}).join(`
`),c.removeAttribute(a),e()}).catch(r)}else e()}else e()})}function l5(c){return Promise.all([W2(c,"::before"),W2(c,"::after")])}function e5(c){return c.parentNode!==document.head&&!~W0.indexOf(c.tagName.toUpperCase())&&!c.getAttribute(A1)&&(!c.parentNode||c.parentNode.tagName!=="svg")}var r5=function(l){return!!l&&g4.some(function(a){return l.includes(a)})},i5=function(l){if(!l)return[];var a=new Set,e=l.split(/,(?![^()]*\))/).map(function(n){return n.trim()});e=e.flatMap(function(n){return n.includes("(")?n:n.split(",").map(function(t){return t.trim()})});var r=e1(e),i;try{for(r.s();!(i=r.n()).done;){var f=i.value;if(r5(f)){var s=g4.reduce(function(n,t){return n.replace(t,"")},f);s!==""&&s!=="*"&&a.add(s)}}}catch(n){r.e(n)}finally{r.f()}return a};function G2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(B){var a;if(l)a=c;else if(M.searchPseudoElementsFullScan)a=c.querySelectorAll("*");else{var e=new Set,r=e1(document.styleSheets),i;try{for(r.s();!(i=r.n()).done;){var f=i.value;try{var s=e1(f.cssRules),n;try{for(s.s();!(n=s.n()).done;){var t=n.value,m=i5(t.selectorText),z=e1(m),u;try{for(z.s();!(u=z.n()).done;){var L=u.value;e.add(L)}}catch(v){z.e(v)}finally{z.f()}}}catch(v){s.e(v)}finally{s.f()}}catch(v){M.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(f.href," (").concat(v.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(v){r.e(v)}finally{r.f()}if(!e.size)return;var C=Array.from(e).join(", ");try{a=c.querySelectorAll(C)}catch{}}return new Promise(function(v,x){var h=_(a).filter(e5).map(l5),S=J1.begin("searchPseudoElements");j4(),Promise.all(h).then(function(){S(),U1(),v()}).catch(function(){S(),U1(),x()})})}}var f5={hooks:function(){return{mutationObserverCallbacks:function(a){return a.pseudoElementsCallback=G2,a}}},provides:function(l){l.pseudoElements2svg=function(a){var e=a.node,r=e===void 0?d:e;M.searchPseudoElements&&G2(r)}}},O2=!1,s5={mixout:function(){return{dom:{unwatch:function(){j4(),O2=!0}}}},hooks:function(){return{bootstrap:function(){R2(D1("mutationObserverCallbacks",{}))},noAuto:function(){E6()},watch:function(a){var e=a.observeMutationsRoot;O2?U1():R2(D1("mutationObserverCallbacks",{observeMutationsRoot:e}))}}}},j2=function(l){var a={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return l.toLowerCase().split(" ").reduce(function(e,r){var i=r.toLowerCase().split("-"),f=i[0],s=i.slice(1).join("-");if(f&&s==="h")return e.flipX=!0,e;if(f&&s==="v")return e.flipY=!0,e;if(s=parseFloat(s),isNaN(s))return e;switch(f){case"grow":e.size=e.size+s;break;case"shrink":e.size=e.size-s;break;case"left":e.x=e.x-s;break;case"right":e.x=e.x+s;break;case"up":e.y=e.y-s;break;case"down":e.y=e.y+s;break;case"rotate":e.rotate=e.rotate+s;break}return e},a)},n5={mixout:function(){return{parse:{transform:function(a){return j2(a)}}}},hooks:function(){return{parseNodeAttributes:function(a,e){var r=e.getAttribute("data-fa-transform");return r&&(a.transform=j2(r)),a}}},provides:function(l){l.generateAbstractTransformGrouping=function(a){var e=a.main,r=a.transform,i=a.containerWidth,f=a.iconWidth,s={transform:"translate(".concat(i/2," 256)")},n="translate(".concat(r.x*32,", ").concat(r.y*32,") "),t="scale(".concat(r.size/16*(r.flipX?-1:1),", ").concat(r.size/16*(r.flipY?-1:1),") "),m="rotate(".concat(r.rotate," 0 0)"),z={transform:"".concat(n," ").concat(t," ").concat(m)},u={transform:"translate(".concat(f/2*-1," -256)")},L={outer:s,inner:z,path:u};return{tag:"g",attributes:o({},L.outer),children:[{tag:"g",attributes:o({},L.inner),children:[{tag:e.icon.tag,children:e.icon.children,attributes:o(o({},e.icon.attributes),L.path)}]}]}}}},N1={x:0,y:0,width:"100%",height:"100%"};function V2(c){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return c.attributes&&(c.attributes.fill||l)&&(c.attributes.fill="black"),c}function o5(c){return c.tag==="g"?c.children:[c]}var t5={hooks:function(){return{parseNodeAttributes:function(a,e){var r=e.getAttribute("data-fa-mask"),i=r?m1(r.split(" ").map(function(f){return f.trim()})):U4();return i.prefix||(i.prefix=R()),a.mask=i,a.maskId=e.getAttribute("data-fa-mask-id"),a}}},provides:function(l){l.generateAbstractMask=function(a){var e=a.children,r=a.attributes,i=a.main,f=a.mask,s=a.maskId,n=a.transform,t=i.width,m=i.icon,z=f.width,u=f.icon,L=c6({transform:n,containerWidth:z,iconWidth:t}),C={tag:"rect",attributes:o(o({},N1),{},{fill:"white"})},v=m.children?{children:m.children.map(V2)}:{},x={tag:"g",attributes:o({},L.inner),children:[V2(o({tag:m.tag,attributes:o(o({},m.attributes),L.path)},v))]},h={tag:"g",attributes:o({},L.outer),children:[x]},S="mask-".concat(s||N2()),y="clip-".concat(s||N2()),G={tag:"mask",attributes:o(o({},N1),{},{id:S,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[C,h]},F={tag:"defs",children:[{tag:"clipPath",attributes:{id:y},children:o5(u)},G]};return e.push(F,{tag:"rect",attributes:o({fill:"currentColor","clip-path":"url(#".concat(y,")"),mask:"url(#".concat(S,")")},N1)}),{children:e,attributes:r}}}},z5={provides:function(l){var a=!1;H.matchMedia&&(a=H.matchMedia("(prefers-reduced-motion: reduce)").matches),l.missingIconAbstract=function(){var e=[],r={fill:"currentColor"},i={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};e.push({tag:"path",attributes:o(o({},r),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var f=o(o({},i),{},{attributeName:"opacity"}),s={tag:"circle",attributes:o(o({},r),{},{cx:"256",cy:"364",r:"28"}),children:[]};return a||s.children.push({tag:"animate",attributes:o(o({},i),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:o(o({},f),{},{values:"1;0;1;1;0;1;"})}),e.push(s),e.push({tag:"path",attributes:o(o({},r),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:a?[]:[{tag:"animate",attributes:o(o({},f),{},{values:"1;0;0;0;0;1;"})}]}),a||e.push({tag:"path",attributes:o(o({},r),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:o(o({},f),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:e}}}},m5={hooks:function(){return{parseNodeAttributes:function(a,e){var r=e.getAttribute("data-fa-symbol"),i=r===null?!1:r===""?!0:r;return a.symbol=i,a}}}},M5=[e6,X6,K6,Y6,J6,f5,s5,n5,t5,z5,m5];h6(M5,{mixoutsTo:N});var D5=N.noAuto,$4=N.config,H5=N.library,X4=N.dom,K4=N.parse,R5=N.findIconDefinition,q5=N.toHtml,Y4=N.icon,E5=N.layer,p5=N.text,L5=N.counter;var u5=["*"],d5=(()=>{class c{defaultPrefix="fas";fallbackIcon=null;fixedWidth;set autoAddCss(a){$4.autoAddCss=a,this._autoAddCss=a}get autoAddCss(){return this._autoAddCss}_autoAddCss=!0;static \u0275fac=function(e){return new(e||c)};static \u0275prov=u1({token:c,factory:c.\u0275fac,providedIn:"root"})}return c})(),v5=(()=>{class c{definitions={};addIcons(...a){for(let e of a){e.prefix in this.definitions||(this.definitions[e.prefix]={}),this.definitions[e.prefix][e.iconName]=e;for(let r of e.icon[2])typeof r=="string"&&(this.definitions[e.prefix][r]=e)}}addIconPacks(...a){for(let e of a){let r=Object.keys(e).map(i=>e[i]);this.addIcons(...r)}}getIconDefinition(a,e){return a in this.definitions&&e in this.definitions[a]?this.definitions[a][e]:null}static \u0275fac=function(e){return new(e||c)};static \u0275prov=u1({token:c,factory:c.\u0275fac,providedIn:"root"})}return c})(),C5=c=>{throw new Error(`Could not find icon with iconName=${c.iconName} and prefix=${c.prefix} in the icon library.`)},h5=()=>{throw new Error("Property `icon` is required for `fa-icon`/`fa-duotone-icon` components.")},Q4=c=>c!=null&&(c===90||c===180||c===270||c==="90"||c==="180"||c==="270"),g5=c=>{let l=Q4(c.rotate),a={[`fa-${c.animation}`]:c.animation!=null&&!c.animation.startsWith("spin"),"fa-spin":c.animation==="spin"||c.animation==="spin-reverse","fa-spin-pulse":c.animation==="spin-pulse"||c.animation==="spin-pulse-reverse","fa-spin-reverse":c.animation==="spin-reverse"||c.animation==="spin-pulse-reverse","fa-pulse":c.animation==="spin-pulse"||c.animation==="spin-pulse-reverse","fa-fw":c.fixedWidth,"fa-border":c.border,"fa-inverse":c.inverse,"fa-layers-counter":c.counter,"fa-flip-horizontal":c.flip==="horizontal"||c.flip==="both","fa-flip-vertical":c.flip==="vertical"||c.flip==="both",[`fa-${c.size}`]:c.size!==null,[`fa-rotate-${c.rotate}`]:l,"fa-rotate-by":c.rotate!=null&&!l,[`fa-pull-${c.pull}`]:c.pull!==null,[`fa-stack-${c.stackItemSize}`]:c.stackItemSize!=null};return Object.keys(a).map(e=>a[e]?e:null).filter(e=>e!=null)},Z1=new WeakSet,J4="fa-auto-css";function x5(c,l){if(!l.autoAddCss||Z1.has(c))return;if(c.getElementById(J4)!=null){l.autoAddCss=!1,Z1.add(c);return}let a=c.createElement("style");a.setAttribute("type","text/css"),a.setAttribute("id",J4),a.innerHTML=X4.css();let e=c.head.childNodes,r=null;for(let i=e.length-1;i>-1;i--){let f=e[i],s=f.nodeName.toUpperCase();["STYLE","LINK"].indexOf(s)>-1&&(r=f)}c.head.insertBefore(a,r),l.autoAddCss=!1,Z1.add(c)}var b5=c=>c.prefix!==void 0&&c.iconName!==void 0,S5=(c,l)=>b5(c)?c:Array.isArray(c)&&c.length===2?{prefix:c[0],iconName:c[1]}:{prefix:l,iconName:c},N5=(()=>{class c{stackItemSize=c1("1x");size=c1();_effect=m2(()=>{if(this.size())throw new Error('fa-icon is not allowed to customize size when used inside fa-stack. Set size on the enclosing fa-stack instead: <fa-stack size="4x">...</fa-stack>.')});static \u0275fac=function(e){return new(e||c)};static \u0275dir=f2({type:c,selectors:[["fa-icon","stackItemSize",""],["fa-duotone-icon","stackItemSize",""]],inputs:{stackItemSize:[1,"stackItemSize"],size:[1,"size"]}})}return c})(),y5=(()=>{class c{size=c1();classes=v1(()=>{let a=this.size(),e=a?{[`fa-${a}`]:!0}:{};return a2(c2({},e),{"fa-stack":!0})});static \u0275fac=function(e){return new(e||c)};static \u0275cmp=d1({type:c,selectors:[["fa-stack"]],hostVars:2,hostBindings:function(e,r){e&2&&z2(r.classes())},inputs:{size:[1,"size"]},ngContentSelectors:u5,decls:1,vars:0,template:function(e,r){e&1&&(o2(),t2(0))},encapsulation:2,changeDetection:0})}return c})(),J5=(()=>{class c{icon=b();title=b();animation=b();mask=b();flip=b();size=b();pull=b();border=b();inverse=b();symbol=b();rotate=b();fixedWidth=b();transform=b();a11yRole=b();renderedIconHTML=v1(()=>{let a=this.icon()??this.config.fallbackIcon;if(!a)return h5(),"";let e=this.findIconDefinition(a);if(!e)return"";let r=this.buildParams();x5(this.document,this.config);let i=Y4(e,r);return this.sanitizer.bypassSecurityTrustHtml(i.html.join(`
`))});document=E(e2);sanitizer=E(M2);config=E(d5);iconLibrary=E(v5);stackItem=E(N5,{optional:!0});stack=E(y5,{optional:!0});constructor(){this.stack!=null&&this.stackItem==null&&console.error('FontAwesome: fa-icon and fa-duotone-icon elements must specify stackItemSize attribute when wrapped into fa-stack. Example: <fa-icon stackItemSize="2x" />.')}findIconDefinition(a){let e=S5(a,this.config.defaultPrefix);if("icon"in e)return e;let r=this.iconLibrary.getIconDefinition(e.prefix,e.iconName);return r??(C5(e),null)}buildParams(){let a=this.fixedWidth(),e={flip:this.flip(),animation:this.animation(),border:this.border(),inverse:this.inverse(),size:this.size(),pull:this.pull(),rotate:this.rotate(),fixedWidth:typeof a=="boolean"?a:this.config.fixedWidth,stackItemSize:this.stackItem!=null?this.stackItem.stackItemSize():void 0},r=this.transform(),i=typeof r=="string"?K4.transform(r):r,f=this.mask(),s=f!=null?this.findIconDefinition(f):null,n={},t=this.a11yRole();t!=null&&(n.role=t);let m={};return e.rotate!=null&&!Q4(e.rotate)&&(m["--fa-rotate-angle"]=`${e.rotate}`),{title:this.title(),transform:i,classes:g5(e),mask:s??void 0,symbol:this.symbol(),attributes:n,styles:m}}static \u0275fac=function(e){return new(e||c)};static \u0275cmp=d1({type:c,selectors:[["fa-icon"]],hostAttrs:[1,"ng-fa-icon"],hostVars:2,hostBindings:function(e,r){e&2&&(n2("innerHTML",r.renderedIconHTML(),r2),s2("title",r.title()??void 0))},inputs:{icon:[1,"icon"],title:[1,"title"],animation:[1,"animation"],mask:[1,"mask"],flip:[1,"flip"],size:[1,"size"],pull:[1,"pull"],border:[1,"border"],inverse:[1,"inverse"],symbol:[1,"symbol"],rotate:[1,"rotate"],fixedWidth:[1,"fixedWidth"],transform:[1,"transform"],a11yRole:[1,"a11yRole"]},outputs:{icon:"iconChange",title:"titleChange",animation:"animationChange",mask:"maskChange",flip:"flipChange",size:"sizeChange",pull:"pullChange",border:"borderChange",inverse:"inverseChange",symbol:"symbolChange",rotate:"rotateChange",fixedWidth:"fixedWidthChange",transform:"transformChange",a11yRole:"a11yRoleChange"},decls:0,vars:0,template:function(e,r){},encapsulation:2,changeDetection:0})}return c})();var Q5=(()=>{class c{static \u0275fac=function(e){return new(e||c)};static \u0275mod=i2({type:c});static \u0275inj=l2({})}return c})();var a8={prefix:"fab",iconName:"jira",icon:[512,512,[],"f7b1","M498.5 241.7c-72.9-72.7-169.4-169.9-241.5-241.7-165.5 164.9-242.5 241.7-242.5 241.7-7.9 7.9-7.9 20.7 0 28.7 132.8 132.3 61.8 61.5 242.5 241.6 379.4-378 15.7-16.7 241.5-241.7 8-7.9 8-20.7 0-28.6zM257 331.7l-76-75.7 76-75.7 76 75.7-76 75.7z"]};var l8={prefix:"fab",iconName:"css3-alt",icon:[384,512,[],"f38b","M0 32L34.9 427.8 192 480 349.1 427.8 384 32 0 32zm313.1 80l-4.8 47.3-115.3 49.3-.3 .1 111.5 0-12.8 146.6-98.2 28.7-98.8-29.2-6.4-73.9 48.9 0 3.2 38.3 52.6 13.3 54.7-15.4 3.7-61.6-166.3-.5 0-.1-.2 .1-3.6-46.3 112.1-46.7 6.5-2.7-122.9 0-5.8-47.3 242.2 0z"]};var e8={prefix:"fab",iconName:"vuejs",icon:[448,512,[],"f41f","M356.9 64.3l-76.9 0-56 88.6-48-88.6-176 0 224 383.7 224-383.7-91.1 0zM55.7 96.3l53.8 0 114.5 198.2 114.4-198.2 53.8 0-168.2 288.2-168.3-288.2z"]};var r8={prefix:"fab",iconName:"github",icon:[512,512,[],"f09b","M173.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM252.8 8c-138.7 0-244.8 105.3-244.8 244 0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1 100-33.2 167.8-128.1 167.8-239 0-138.7-112.5-244-251.2-244zM105.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9s4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"]};var i8={prefix:"fab",iconName:"laravel",icon:[512,512,[],"f3bd","M504.6 115.8c-.1-.2-.2-.5-.3-.7-.1-.4-.3-.8-.5-1.2-.2-.2-.3-.5-.5-.7-.2-.3-.5-.6-.7-.9-.2-.2-.5-.4-.8-.6-.3-.2-.6-.5-.9-.7L404.6 55.5c-1.2-.7-2.6-1.1-4-1.1s-2.8 .4-4 1.1L300.3 111c-.3 .2-.6 .4-.9 .7-.3 .2-.5 .4-.8 .6-.3 .3-.5 .6-.7 .9-.2 .2-.4 .4-.5 .7-.2 .4-.4 .8-.5 1.2-.1 .2-.2 .4-.3 .7-.2 .7-.3 1.4-.3 2.1l0 105.2-80.2 46.2 0-205.9c0-.7-.1-1.4-.3-2.1-.1-.2-.2-.4-.3-.7-.1-.4-.3-.8-.5-1.2-.1-.3-.4-.5-.5-.7-.2-.3-.5-.6-.7-.9-.2-.2-.5-.4-.8-.6-.3-.2-.6-.5-.9-.7L115.8 1.1c-1.2-.7-2.6-1.1-4-1.1s-2.8 .4-4 1.1L11.5 56.5c-.3 .2-.6 .4-.9 .7-.3 .2-.5 .4-.8 .6-.3 .3-.5 .6-.7 .9-.2 .3-.4 .5-.6 .7-.2 .4-.4 .8-.5 1.2-.1 .2-.2 .4-.3 .7-.2 .7-.3 1.4-.3 2.1l0 329.7c0 1.4 .4 2.8 1.1 4s1.7 2.2 2.9 2.9L204 510.9c.4 .2 .9 .4 1.3 .5 .2 .1 .4 .2 .6 .3 1.3 .4 2.8 .4 4.1 0 .2-.1 .4-.2 .6-.2 .5-.2 1-.3 1.4-.6L404.6 400.1c1.2-.7 2.2-1.7 2.9-2.9s1.1-2.6 1.1-4l0-105.3 92.2-53.1c1.2-.7 2.2-1.7 2.9-3s1.1-2.6 1.1-4l0-109.8c0-.7-.1-1.4-.2-2.1zM111.8 17.3l80.2 46.1-80.2 46.2-80.2-46.2 80.2-46.2zm88.2 60l0 201.3c-33.2 19.1-59.9 34.5-80.2 46.2l0-201.3C153 104.4 179.7 89 200 77.3zm0 412.8L23.5 388.5 23.5 77.3c20.3 11.7 47.1 27.1 80.2 46.2l0 215.2c0 .3 .1 .6 .1 .9 0 .4 .1 .8 .2 1.2 .1 .3 .2 .6 .4 .9 .1 .3 .3 .7 .4 1 .2 .3 .4 .5 .6 .8 .2 .3 .4 .6 .7 .8 .2 .2 .5 .4 .8 .6 .3 .2 .6 .5 .9 .7l92.2 52.2 .1 92.4zm8-106.2L128 338.6c54.7-31.5 113.5-65.3 176.3-101.5l80.1 46.1C355 300 296.2 333.5 208 383.9zm184.5 4.6l-176.5 101.6 0-92.3C317.4 340 376.2 306.4 392.5 297l0 91.4zm0-119.1c-20.3-11.6-47.1-27-80.2-46.1l0-91.4c20.3 11.7 47.1 27.1 80.2 46.2l0 91.3zm8-105.3l-80.2-46.2 80.2-46.2 80.2 46.1-80.2 46.2zm8 105.3l0-91.3c33.2-19.1 60-34.5 80.3-46.2l0 91.4-80.3 46.2z"]};var f8={prefix:"fab",iconName:"angular",icon:[448,512,[],"f420","M185.7 268.1l76.2 0-38.1-91.6-38.1 91.6zM223.8 32L16 106.4 47.8 382.1 223.8 480 399.8 382.1 431.6 106.4 223.8 32zM354 373.8l-48.6 0-26.2-65.4-110.6 0-26.2 65.4-48.7 0 130.1-292.3 130.2 292.3z"]};var s8={prefix:"fab",iconName:"aws",icon:[640,512,[],"f375","M180.4 203c-.7 22.6 10.6 32.7 10.9 39-.1 1.3-.6 2.5-1.3 3.6s-1.7 2-2.8 2.6l-12.8 9c-1.7 1.2-3.6 1.8-5.6 1.9-.4 0-8.2 1.8-20.5-25.6-7.5 9.4-17 16.9-27.9 22s-22.7 7.7-34.7 7.5c-16.3 .9-60.4-9.2-58.1-56.2-1.6-38.3 34.1-62.1 70.9-60 7.1 0 21.6 .4 47 6.3l0-15.6c2.7-26.5-14.7-47-44.8-43.9-2.4 0-19.4-.5-45.8 10.1-7.4 3.4-8.3 2.8-10.8 2.8-7.4 0-4.4-21.5-2.9-24.2 5.2-6.4 35.9-18.4 65.9-18.2 20.1-1.8 40.1 4.4 55.7 17.3 6.3 7.1 11.2 15.4 14.2 24.4s4.2 18.5 3.5 28l0 69.3zM94 235.4c32.4-.5 46.2-20 49.3-30.5 2.5-10.1 2.1-16.4 2.1-27.4-9.7-2.3-23.6-4.9-39.6-4.9-15.2-1.1-42.8 5.6-41.7 32.3-1.2 16.8 11.1 31.4 30 30.5zm170.9 23.1c-7.9 .7-11.5-4.9-12.7-10.4L202.4 83.4c-1-2.8-1.6-5.6-1.9-8.6-.2-1.2 .1-2.4 .8-3.4s1.8-1.6 3-1.8c.2 0-2.1 0 22.2 0 8.8-.9 11.6 6 12.6 10.4L274.9 220.8 308.1 80c.5-3.2 2.9-11.1 12.8-10.2l17.2 0c2.2-.2 11.1-.5 12.7 10.4L384.1 222.7 421 80.1c.5-2.2 2.7-11.4 12.7-10.4l19.7 0c.9-.1 6.2-.8 5.3 8.6-.4 1.8 3.4-10.7-52.8 169.9-1.1 5.5-4.8 11.1-12.7 10.4l-18.7 0c-10.9 1.2-12.5-9.7-12.7-10.7l-33.2-137.1-32.8 137c-.2 1.1-1.7 11.9-12.7 10.7l-18.3 0 0 0zm273.5 5.6c-5.9 0-33.9-.3-57.4-12.3-2.3-1-4.3-2.6-5.7-4.8s-2.1-4.6-2.1-7.1l0-10.7c0-8.5 6.2-6.9 8.8-5.9 10 4.1 16.5 7.1 28.8 9.6 36.7 7.5 52.8-2.3 56.7-4.5 13.2-7.8 14.2-25.7 5.3-34.9-10.5-8.8-15.5-9.1-53.1-21-4.6-1.3-43.7-13.6-43.8-52.4-.6-28.2 25-56.2 69.5-56 12.7 0 46.4 4.1 55.6 15.6 1.4 2.1 2 4.6 1.9 7l0 10.1c0 4.4-1.6 6.7-4.9 6.7-7.7-.9-21.4-11.2-49.2-10.8-6.9-.4-39.9 .9-38.4 25-.4 19 26.6 26.1 29.7 26.9 36.5 11 48.6 12.8 63.1 29.6 17.1 22.2 7.9 48.3 4.3 55.4-19.1 37.5-68.4 34.4-69.3 34.4zm40.2 104.9c-70 51.7-171.7 79.2-258.5 79.2-117.1 .8-230.3-42.3-317.3-120.7-6.5-5.9-.8-14 7.2-9.5 96.5 55.2 205.7 84.2 316.9 84.1 83-.4 165.1-17.3 241.6-49.5 11.8-5 21.8 7.8 10.1 16.4zm29.2-33.3c-9-11.5-59.3-5.4-81.8-2.7-6.8 .8-7.9-5.1-1.8-9.5 40.1-28.2 105.9-20.1 113.4-10.6 7.5 9.5-2.1 75.4-39.6 106.9-5.8 4.9-11.3 2.3-8.7-4.1 8.4-21.3 27.4-68.5 18.4-80z"]};var n8={prefix:"fab",iconName:"docker",icon:[640,512,[],"f395","M349.9 236.3l-66.1 0 0-59.4 66.1 0 0 59.4zm0-204.3l-66.1 0 0 60.7 66.1 0 0-60.7zm78.2 144.8l-66.1 0 0 59.4 66.1 0 0-59.4zM271.8 104.7l-66.1 0 0 60.1 66.1 0 0-60.1zm78.1 0l-66.1 0 0 60.1 66.1 0 0-60.1zm276.8 100c-14.4-9.7-47.6-13.2-73.1-8.4-3.3-24-16.7-44.9-41.1-63.7l-14-9.3-9.3 14c-18.4 27.8-23.4 73.6-3.7 103.8-8.7 4.7-25.8 11.1-48.4 10.7l-434.7 0c-8.7 50.8 5.8 116.8 44 162.1 37.1 43.9 92.7 66.2 165.4 66.2 157.4 0 273.9-72.5 328.4-204.2 21.4 .4 67.6 .1 91.3-45.2 1.5-2.5 6.6-13.2 8.5-17.1l-13.3-8.9zM115.6 176.8l-66 0 0 59.4 66.1 0 0-59.4-.1 0zm78.1 0l-66.1 0 0 59.4 66.1 0 0-59.4zm78.1 0l-66.1 0 0 59.4 66.1 0 0-59.4zm-78.1-72.1l-66.1 0 0 60.1 66.1 0 0-60.1z"]};var o8={prefix:"fab",iconName:"git-alt",icon:[448,512,[],"f841","M439.6 236.1L244 40.5C238.6 35 231.2 32 223.6 32s-15 3-20.4 8.4l-40.7 40.6 51.5 51.5c27.1-9.1 52.7 16.8 43.4 43.7l49.7 49.7c34.2-11.8 61.2 31 35.5 56.7-26.5 26.5-70.2-2.9-56-37.3l-46.3-46.3 0 121.9c25.3 12.5 22.3 41.8 9.1 55-6.4 6.4-15.2 10.1-24.3 10.1s-17.8-3.6-24.3-10.1c-17.6-17.6-11.1-46.9 11.2-56l0-123c-20.8-8.5-24.6-30.7-18.6-45L142.6 101 8.5 235.1C3 240.6 0 247.9 0 255.5s3 15 8.5 20.4L204.1 471.6c5.4 5.4 12.7 8.4 20.4 8.4s15-3 20.4-8.4L439.6 276.9c5.4-5.4 8.4-12.8 8.4-20.4s-3-15-8.4-20.4z"]};var t8={prefix:"fab",iconName:"react",icon:[512,512,[],"f41b","M418.2 177.2c-5.4-1.8-10.8-3.5-16.2-5.1 .9-3.7 1.7-7.4 2.5-11.1 12.3-59.6 4.2-107.5-23.1-123.3-26.3-15.1-69.2 .6-112.6 38.4-4.3 3.7-8.5 7.6-12.5 11.5-2.7-2.6-5.5-5.2-8.3-7.7-45.5-40.4-91.1-57.4-118.4-41.5-26.2 15.2-34 60.3-23 116.7 1.1 5.6 2.3 11.1 3.7 16.7-6.4 1.8-12.7 3.8-18.6 5.9-53.4 18.5-91.7 47.7-91.7 77.9 0 31.2 40.8 62.5 96.3 81.5 4.5 1.5 9 3 13.6 4.3-1.5 6-2.8 11.9-4 18-10.5 55.5-2.3 99.5 23.9 114.6 27 15.6 72.4-.4 116.6-39.1 3.5-3.1 7-6.3 10.5-9.7 4.4 4.3 9 8.4 13.6 12.4 42.8 36.8 85.1 51.7 111.2 36.6 27-15.6 35.8-62.9 24.4-120.5-.9-4.4-1.9-8.9-3-13.5 3.2-.9 6.3-1.9 9.4-2.9 57.7-19.1 99.5-50 99.5-81.7 0-30.3-39.4-59.7-93.8-78.4zM282.9 92.3c37.2-32.4 71.9-45.1 87.7-36 16.9 9.7 23.4 48.9 12.8 100.4-.7 3.4-1.4 6.7-2.3 10-22.2-5-44.7-8.6-67.3-10.6-13-18.6-27.2-36.4-42.6-53.1 3.9-3.7 7.7-7.2 11.7-10.7zM167.2 307.5c5.1 8.7 10.3 17.4 15.8 25.9-15.6-1.7-31.1-4.2-46.4-7.5 4.4-14.4 9.9-29.3 16.3-44.5 4.6 8.8 9.3 17.5 14.3 26.1zM136.9 187.2c14.4-3.2 29.7-5.8 45.6-7.8-5.3 8.3-10.5 16.8-15.4 25.4-4.9 8.5-9.7 17.2-14.2 26-6.3-14.9-11.6-29.5-16-43.6zm27.4 68.9c6.6-13.8 13.8-27.3 21.4-40.6s15.8-26.2 24.4-38.9c15-1.1 30.3-1.7 45.9-1.7s31 .6 45.9 1.7c8.5 12.6 16.6 25.5 24.3 38.7s14.9 26.7 21.7 40.4c-6.7 13.8-13.9 27.4-21.6 40.8-7.6 13.3-15.7 26.2-24.2 39-14.9 1.1-30.4 1.6-46.1 1.6s-30.9-.5-45.6-1.4c-8.7-12.7-16.9-25.7-24.6-39s-14.8-26.8-21.5-40.6zm180.6 51.2c5.1-8.8 9.9-17.7 14.6-26.7 6.4 14.5 12 29.2 16.9 44.3-15.5 3.5-31.2 6.2-47 8 5.4-8.4 10.5-17 15.5-25.6zm14.4-76.5c-4.7-8.8-9.5-17.6-14.5-26.2-4.9-8.5-10-16.9-15.3-25.2 16.1 2 31.5 4.7 45.9 8-4.6 14.8-10 29.2-16.1 43.4zM256.2 118.3c10.5 11.4 20.4 23.4 29.6 35.8-19.8-.9-39.7-.9-59.5 0 9.8-12.9 19.9-24.9 29.9-35.8zM140.2 57c16.8-9.8 54.1 4.2 93.4 39 2.5 2.2 5 4.6 7.6 7-15.5 16.7-29.8 34.5-42.9 53.1-22.6 2-45 5.5-67.2 10.4-1.3-5.1-2.4-10.3-3.5-15.5-9.4-48.4-3.2-84.9 12.6-94zM115.7 320.6c-4.2-1.2-8.3-2.5-12.4-3.9-21.3-6.7-45.5-17.3-63-31.2-10.1-7-16.9-17.8-18.8-29.9 0-18.3 31.6-41.7 77.2-57.6 5.7-2 11.5-3.8 17.3-5.5 6.8 21.7 15 43 24.5 63.6-9.6 20.9-17.9 42.5-24.8 64.5zm116.6 98c-16.5 15.1-35.6 27.1-56.4 35.3-11.1 5.3-23.9 5.8-35.3 1.3-15.9-9.2-22.5-44.5-13.5-92 1.1-5.6 2.3-11.2 3.7-16.7 22.4 4.8 45 8.1 67.9 9.8 13.2 18.7 27.7 36.6 43.2 53.4-3.2 3.1-6.4 6.1-9.6 8.9zm24.5-24.3c-10.2-11-20.4-23.2-30.3-36.3 9.6 .4 19.5 .6 29.5 .6 10.3 0 20.4-.2 30.4-.7-9.2 12.7-19.1 24.8-29.6 36.4zm130.7 30c-.9 12.2-6.9 23.6-16.5 31.3-15.9 9.2-49.8-2.8-86.4-34.2-4.2-3.6-8.4-7.5-12.7-11.5 15.3-16.9 29.4-34.8 42.2-53.6 22.9-1.9 45.7-5.4 68.2-10.5 1 4.1 1.9 8.2 2.7 12.2 4.9 21.6 5.7 44.1 2.5 66.3zm18.2-107.5c-2.8 .9-5.6 1.8-8.5 2.6-7-21.8-15.6-43.1-25.5-63.8 9.6-20.4 17.7-41.4 24.5-62.9 5.2 1.5 10.2 3.1 15 4.7 46.6 16 79.3 39.8 79.3 58 0 19.6-34.9 44.9-84.8 61.4zM256 301.8a45.8 45.8 0 1 0 0-91.6 45.8 45.8 0 1 0 0 91.6z"]};var z8={prefix:"fab",iconName:"linux",icon:[448,512,[],"f17c","M220.9 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5 .2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4 .2-.8 .7-.6 1.1 .3 1.3 2.3 1.1 3.4 1.7zM199 125c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6 .2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5 .1-1.3 .6-3.4 1.5-3.2 2.9 .1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72 .5-45.9 5.1-131.2-75.8-131.3-102.4-.2-76.8 103.4-77.9 135.2-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9 .6 7.9 1.2 11.8 1.2 8.1 2.5 15.7 .8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1 .6 2.3 1.4 4.6 2.5 6.7l0 .1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3 .4-8.2-4.4-17.3-15.5-29.7zM223.8 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183.1 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4 .7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4l0-.2c2.4-7.6 .6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7 .8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4 .6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1 .8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7 .4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6 .8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1 .3-.2 .7-.3 1-.5 .8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.4 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z"]};var m8={prefix:"fab",iconName:"whatsapp",icon:[448,512,[],"f232","M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z"]};var M8={prefix:"fab",iconName:"python",icon:[448,512,[],"f3e2","M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2l-40.1 0 0 47.4c0 36.8-31.2 67.8-66.8 67.8l-106.8 0c-29.2 0-53.4 25-53.4 54.3l0 101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3l0-40.7-106.7 0 0-13.6 160.2 0c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 444.7a20.4 20.4 0 1 1 0-40.7 20.4 20.4 0 1 1 0 40.7zM167.8 248.1l106.8 0c29.7 0 53.4-24.5 53.4-54.3l0-101.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8 .1-45.2 8-53.4 24.7-53.4 55.6l0 40.7 106.9 0 0 13.6-147 0c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2l36.7 0 0-48.8c0-35.3 30.5-66.4 66.8-66.4zM161.2 64.7a20.4 20.4 0 1 1 0 40.8 20.4 20.4 0 1 1 0-40.8z"]};var p8={prefix:"fab",iconName:"js",icon:[448,512,[],"f3b8","M0 32l0 448 448 0 0-448-448 0zM243.8 381.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5L152 385.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5l0-143.1 42.1 0 0 143.7zm99.6 63.5c-39.1 0-64.4-18.6-76.7-43L301 382.1c9 14.7 20.8 25.6 41.5 25.6 17.4 0 28.6-8.7 28.6-20.8 0-14.4-11.4-19.5-30.7-28l-10.5-4.5c-30.4-12.9-50.5-29.2-50.5-63.5 0-31.6 24.1-55.6 61.6-55.6 26.8 0 46 9.3 59.8 33.7L368 290c-7.2-12.9-15-18-27.1-18-12.3 0-20.1 7.8-20.1 18 0 12.6 7.8 17.7 25.9 25.6l10.5 4.5c35.8 15.3 55.9 31 55.9 66.2 0 37.8-29.8 58.6-69.7 58.6z"]};var L8={prefix:"fab",iconName:"linkedin-in",icon:[448,512,[],"f0e1","M100.3 448l-92.9 0 0-299.1 92.9 0 0 299.1zM53.8 108.1C24.1 108.1 0 83.5 0 53.8 0 39.5 5.7 25.9 15.8 15.8s23.8-15.8 38-15.8 27.9 5.7 38 15.8 15.8 23.8 15.8 38c0 29.7-24.1 54.3-53.8 54.3zM447.9 448l-92.7 0 0-145.6c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7l0 148.1-92.8 0 0-299.1 89.1 0 0 40.8 1.3 0c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3l0 164.3-.1 0z"]},u8={prefix:"fab",iconName:"html5",icon:[384,512,[],"f13b","M0 32L34.9 427.8 191.5 480 349.1 427.8 384 32 0 32zM308.2 159.9l-183.8 0 4.1 49.4 175.6 0-13.6 148.4-97.9 27 0 .3-1.1 0-98.7-27.3-6-75.8 47.7 0 3.5 38.1 53.5 14.5 53.7-14.5 6-62.2-166.9 0-12.8-145.6 241.1 0-4.4 47.7z"]};var d8={prefix:"fab",iconName:"php",icon:[640,512,[],"f457","M320 104.5c171.4 0 303.2 72.2 303.2 151.5S491.3 407.5 320 407.5C148.6 407.5 16.8 335.3 16.8 256S148.7 104.5 320 104.5zm0-16.8C143.3 87.7 0 163 0 256S143.3 424.3 320 424.3 640 349 640 256 496.7 87.7 320 87.7zM218.2 242.5c-7.9 40.5-35.8 36.3-70.1 36.3l13.7-70.6c38 0 63.8-4.1 56.4 34.3zM97.4 350.3l36.7 0 8.7-44.8c41.1 0 66.6 3 90.2-19.1 26.1-24 32.9-66.7 14.3-88.1-9.7-11.2-25.3-16.7-46.5-16.7l-70.7 0-32.7 168.7zM283.1 136.7l36.5 0-8.7 44.8c31.5 0 60.7-2.3 74.8 10.7 14.8 13.6 7.7 31-8.3 113.1l-37 0c15.4-79.4 18.3-86 12.7-92-5.4-5.8-17.7-4.6-47.4-4.6l-18.8 96.6-36.5 0 32.7-168.6zM505 242.5c-8 41.1-36.7 36.3-70.1 36.3l13.7-70.6c38.2 0 63.8-4.1 56.4 34.3zM384.2 350.3l36.8 0 8.7-44.8c43.2 0 67.1 2.5 90.2-19.1 26.1-24 32.9-66.7 14.3-88.1-9.7-11.2-25.3-16.7-46.5-16.7l-70.7 0-32.8 168.7z"]};var v8={prefix:"fab",iconName:"node-js",icon:[448,512,[],"f3d3","M224.5 508c-6.7 0-13.5-1.8-19.4-5.2l-61.7-36.5c-9.2-5.2-4.7-7-1.7-8 12.3-4.3 14.8-5.2 27.9-12.7 1.4-.8 3.2-.5 4.6 .4l47.4 28.1c1.7 1 4.1 1 5.7 0L412 367.5c1.7-1 2.8-3 2.8-5l0-213.2c0-2.1-1.1-4-2.9-5.1L227.3 37.7c-1.7-1-4-1-5.7 0L37.1 144.3c-1.8 1-2.9 3-2.9 5.1l0 213.1c0 2 1.1 4 2.9 4.9l50.6 29.2c27.5 13.7 44.3-2.4 44.3-18.7l0-210.4c0-3 2.4-5.3 5.4-5.3l23.4 0c2.9 0 5.4 2.3 5.4 5.3l0 210.5c0 36.6-20 57.6-54.7 57.6-10.7 0-19.1 0-42.5-11.6L20.6 396.1c-12-6.9-19.4-19.8-19.4-33.7l0-213.1c0-13.8 7.4-26.8 19.4-33.7L205.1 9c11.7-6.6 27.2-6.6 38.8 0L428.6 115.7c12 6.9 19.4 19.8 19.4 33.7l0 213.1c0 13.8-7.4 26.7-19.4 33.7L243.9 502.8c-5.9 3.4-12.6 5.2-19.4 5.2zM373.6 297.9c0-39.9-27-50.5-83.7-58-57.4-7.6-63.2-11.5-63.2-24.9 0-11.1 4.9-25.9 47.4-25.9 37.9 0 51.9 8.2 57.7 33.8 .5 2.4 2.7 4.2 5.2 4.2l24 0c1.5 0 2.9-.6 3.9-1.7s1.5-2.6 1.4-4.1c-3.7-44.1-33-64.6-92.2-64.6-52.7 0-84.1 22.2-84.1 59.5 0 40.4 31.3 51.6 81.8 56.6 60.5 5.9 65.2 14.8 65.2 26.7 0 20.6-16.6 29.4-55.5 29.4-48.9 0-59.6-12.3-63.2-36.6-.4-2.6-2.6-4.5-5.3-4.5l-23.9 0c-3 0-5.3 2.4-5.3 5.3 0 31.1 16.9 68.2 97.8 68.2 58.4-.1 92-23.2 92-63.4z"]};var h8={prefix:"far",iconName:"envelope",icon:[512,512,[128386,9993,61443],"f0e0","M61.4 64C27.5 64 0 91.5 0 125.4 0 126.3 0 127.1 .1 128L0 128 0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256-.1 0c0-.9 .1-1.7 .1-2.6 0-33.9-27.5-61.4-61.4-61.4L61.4 64zM464 192.3L464 384c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-191.7 154.8 117.4c31.4 23.9 74.9 23.9 106.4 0L464 192.3zM48 125.4C48 118 54 112 61.4 112l389.2 0c7.4 0 13.4 6 13.4 13.4 0 4.2-2 8.2-5.3 10.7L280.2 271.5c-14.3 10.8-34.1 10.8-48.4 0L53.3 136.1c-3.3-2.5-5.3-6.5-5.3-10.7z"]};var x8={prefix:"fas",iconName:"gears",icon:[640,512,["cogs"],"f085","M415.9 210.5c12.2-3.3 25 2.5 30.5 13.8L465 261.9c10.3 1.4 20.4 4.2 29.9 8.1l35-23.3c10.5-7 24.4-5.6 33.3 3.3l19.2 19.2c8.9 8.9 10.3 22.9 3.3 33.3l-23.3 34.9c1.9 4.7 3.6 9.6 5 14.7 1.4 5.1 2.3 10.1 3 15.2l37.7 18.6c11.3 5.6 17.1 18.4 13.8 30.5l-7 26.2c-3.3 12.1-14.6 20.3-27.2 19.5l-42-2.7c-6.3 8.1-13.6 15.6-21.9 22l2.7 41.9c.8 12.6-7.4 24-19.5 27.2l-26.2 7c-12.2 3.3-24.9-2.5-30.5-13.8l-18.6-37.6c-10.3-1.4-20.4-4.2-29.9-8.1l-35 23.3c-10.5 7-24.4 5.6-33.3-3.3l-19.2-19.2c-8.9-8.9-10.3-22.8-3.3-33.3l23.3-35c-1.9-4.7-3.6-9.6-5-14.7s-2.3-10.2-3-15.2l-37.7-18.6c-11.3-5.6-17-18.4-13.8-30.5l7-26.2c3.3-12.1 14.6-20.3 27.2-19.5l41.9 2.7c6.3-8.1 13.6-15.6 21.9-22l-2.7-41.8c-.8-12.6 7.4-24 19.5-27.2l26.2-7zM448.4 340a44 44 0 1 0 .1 88 44 44 0 1 0 -.1-88zM224.9-45.5l26.2 7c12.1 3.3 20.3 14.7 19.5 27.2l-2.7 41.8c8.3 6.4 15.6 13.8 21.9 22l42-2.7c12.5-.8 23.9 7.4 27.2 19.5l7 26.2c3.2 12.1-2.5 24.9-13.8 30.5l-37.7 18.6c-.7 5.1-1.7 10.2-3 15.2s-3.1 10-5 14.7l23.3 35c7 10.5 5.6 24.4-3.3 33.3L307.3 262c-8.9 8.9-22.8 10.3-33.3 3.3L239 242c-9.5 3.9-19.6 6.7-29.9 8.1l-18.6 37.6c-5.6 11.3-18.4 17-30.5 13.8l-26.2-7c-12.2-3.3-20.3-14.7-19.5-27.2l2.7-41.9c-8.3-6.4-15.6-13.8-21.9-22l-42 2.7c-12.5 .8-23.9-7.4-27.2-19.5l-7-26.2c-3.2-12.1 2.5-24.9 13.8-30.5l37.7-18.6c.7-5.1 1.7-10.1 3-15.2 1.4-5.1 3-10 5-14.7L55.1 46.5c-7-10.5-5.6-24.4 3.3-33.3L77.6-6c8.9-8.9 22.8-10.3 33.3-3.3l35 23.3c9.5-3.9 19.6-6.7 29.9-8.1l18.6-37.6c5.6-11.3 18.3-17 30.5-13.8zM192.4 84a44 44 0 1 0 0 88 44 44 0 1 0 0-88z"]};var b8={prefix:"fas",iconName:"fire",icon:[448,512,[128293],"f06d","M160.5-26.4c9.3-7.8 23-7.5 31.9 .9 12.3 11.6 23.3 24.4 33.9 37.4 13.5 16.5 29.7 38.3 45.3 64.2 5.2-6.8 10-12.8 14.2-17.9 1.1-1.3 2.2-2.7 3.3-4.1 7.9-9.8 17.7-22.1 30.8-22.1 13.4 0 22.8 11.9 30.8 22.1 1.3 1.7 2.6 3.3 3.9 4.8 10.3 12.4 24 30.3 37.7 52.4 27.2 43.9 55.6 106.4 55.6 176.6 0 123.7-100.3 224-224 224S0 411.7 0 288c0-91.1 41.1-170 80.5-225 19.9-27.7 39.7-49.9 54.6-65.1 8.2-8.4 16.5-16.7 25.5-24.2zM225.7 416c25.3 0 47.7-7 68.8-21 42.1-29.4 53.4-88.2 28.1-134.4-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5-17.3-22.1-49.1-62.4-65.3-83-5.4-6.9-15.2-8-21.5-1.9-18.3 17.8-51.5 56.8-51.5 104.3 0 68.6 50.6 109.2 113.7 109.2z"]};var S8={prefix:"fas",iconName:"database",icon:[448,512,[],"f1c0","M448 205.8c-14.8 9.8-31.8 17.7-49.5 24-47 16.8-108.7 26.2-174.5 26.2S96.4 246.5 49.5 229.8c-17.6-6.3-34.7-14.2-49.5-24L0 288c0 44.2 100.3 80 224 80s224-35.8 224-80l0-82.2zm0-77.8l0-48C448 35.8 347.7 0 224 0S0 35.8 0 80l0 48c0 44.2 100.3 80 224 80s224-35.8 224-80zM398.5 389.8C351.6 406.5 289.9 416 224 416S96.4 406.5 49.5 389.8c-17.6-6.3-34.7-14.2-49.5-24L0 432c0 44.2 100.3 80 224 80s224-35.8 224-80l0-66.2c-14.8 9.8-31.8 17.7-49.5 24z"]};var N8={prefix:"fas",iconName:"code",icon:[576,512,[],"f121","M360.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm64.6 136.1c-12.5 12.5-12.5 32.8 0 45.3l73.4 73.4-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0zm-274.7 0c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 150.6 182.6c12.5-12.5 12.5-32.8 0-45.3z"]};var y8={prefix:"fas",iconName:"cloud",icon:[576,512,[9729],"f0c2","M0 336c0 79.5 64.5 144 144 144l304 0c70.7 0 128-57.3 128-128 0-51.6-30.5-96.1-74.5-116.3 6.7-13.1 10.5-28 10.5-43.7 0-53-43-96-96-96-17.7 0-34.2 4.8-48.4 13.1-24.1-45.8-72.2-77.1-127.6-77.1-79.5 0-144 64.5-144 144 0 8 .7 15.9 1.9 23.5-56.9 19.2-97.9 73.1-97.9 136.5z"]};var k8={prefix:"fas",iconName:"chart-bar",icon:[512,512,["bar-chart"],"f080","M32 32c17.7 0 32 14.3 32 32l0 336c0 8.8 7.2 16 16 16l400 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L80 480c-44.2 0-80-35.8-80-80L0 64C0 46.3 14.3 32 32 32zm96 64c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0c-17.7 0-32-14.3-32-32zm32 80l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 112l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"]};var w8={prefix:"fas",iconName:"arrow-right",icon:[512,512,[8594],"f061","M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"]};var A8={prefix:"fas",iconName:"location-dot",icon:[384,512,["map-marker-alt"],"f3c5","M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"]};export{J5 as a,Q5 as b,a8 as c,l8 as d,e8 as e,r8 as f,i8 as g,f8 as h,s8 as i,n8 as j,o8 as k,t8 as l,z8 as m,m8 as n,M8 as o,p8 as p,L8 as q,u8 as r,d8 as s,v8 as t,h8 as u,x8 as v,b8 as w,S8 as x,N8 as y,y8 as z,k8 as A,w8 as B,A8 as C};
