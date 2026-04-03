import"./DsnmJJEf.js";import{n as ve,o as N,q as ee,k as P,an as Re,a5 as ke,a6 as ye,a7 as oe,Y as H,a8 as z,z as R,T as Be,aC as Fe,w as Y,y as be,x as Le,aD as ue,v as ne,ae as Oe,av as de,aE as pe,F as Pe,aF as G,aa as se,A as _e,aG as J,aH as He,aI as Z,aJ as re,U as ze,aK as We,aL as Ve,aM as qe,_ as me,R as he,ac as Ye,aN as ge,aO as $e,aP as Ge,E as Je,aQ as Ke,X as Xe,p as Ee,$ as Qe,b as te,c as we,d as Ze,s as je,a4 as Ue,r as et,a0 as Ne,a as Ae,az as tt,aR as at}from"./r3kq2iZU.js";import{i as nt,e as ce,a as Se,w as y,f as ie,g as M}from"./BLY_Nqnf.js";import{p as O,r as Te,s as st}from"./DMNfheuf.js";import{a as fe}from"./CtsjAV9X.js";function rt(a,e){return e}function it(a,e,t){for(var n=a.items,s=[],o=e.length,l=0;l<o;l++)We(e[l].e,s,!0);var f=o>0&&s.length===0&&t!==null;if(f){var m=t.parentNode;Ve(m),m.append(t),n.clear(),C(a,e[0].prev,e[o-1].next)}qe(s,()=>{for(var u=0;u<o;u++){var p=e[u];f||(n.delete(p.k),C(a,p.prev,p.next)),re(p.e,!f)}})}function lt(a,e,t,n,s,o=null){var l=a,f={flags:e,items:new Map,first:null},m=(e&ge)!==0;if(m){var u=a;l=N?H(me(u)):u.appendChild(ne())}N&&ee();var p=null,h=!1,_=new Map,A=Re(()=>{var g=t();return Pe(g)?g:g==null?[]:pe(g)}),r,v;function d(){ot(v,r,f,_,l,s,e,n,t),o!==null&&(r.length===0?p?se(p):p=Y(()=>o(l)):p!==null&&_e(p,()=>{p=null}))}ve(()=>{v??=he,r=P(A);var g=r.length;if(h&&g===0)return;h=g===0;let E=!1;if(N){var S=ke(l)===ye;S!==(g===0)&&(l=oe(),H(l),z(!1),E=!0)}if(N){for(var I=null,w,i=0;i<g;i++){if(R.nodeType===Be&&R.data===Fe){l=R,E=!0,z(!1);break}var c=r[i],U=n(c,i);w=ae(R,f,I,null,c,U,i,s,e,t),f.items.set(U,w),I=w}g>0&&H(oe())}if(N)g===0&&o&&(p=Y(()=>o(l)));else if(be()){var b=new Set,V=Le;for(i=0;i<g;i+=1){c=r[i],U=n(c,i);var k=f.items.get(U)??_.get(U);k?(e&(J|G))!==0&&Ce(k,c,i,e):(w=ae(null,f,null,null,c,U,i,s,e,t,!0),_.set(U,w)),b.add(U)}for(const[T,q]of f.items)b.has(T)||V.skipped_effects.add(q.e);V.add_callback(d)}else d();E&&z(!0),P(A)}),N&&(l=R)}function ot(a,e,t,n,s,o,l,f,m){var u=(l&$e)!==0,p=(l&(J|G))!==0,h=e.length,_=t.items,A=t.first,r=A,v,d=null,g,E=[],S=[],I,w,i,c;if(u)for(c=0;c<h;c+=1)I=e[c],w=f(I,c),i=_.get(w),i!==void 0&&(i.a?.measure(),(g??=new Set).add(i));for(c=0;c<h;c+=1){if(I=e[c],w=f(I,c),i=_.get(w),i===void 0){var U=n.get(w);if(U!==void 0){n.delete(w),_.set(w,U);var b=d?d.next:r;C(t,d,U),C(t,U,b),j(U,b,s),d=U}else{var V=r?r.e.nodes_start:s;d=ae(V,t,d,d===null?t.first:d.next,I,w,c,o,l,m)}_.set(w,d),E=[],S=[],r=d.next;continue}if(p&&Ce(i,I,c,l),(i.e.f&Z)!==0&&(se(i.e),u&&(i.a?.unfix(),(g??=new Set).delete(i))),i!==r){if(v!==void 0&&v.has(i)){if(E.length<S.length){var k=S[0],T;d=k.prev;var q=E[0],X=E[E.length-1];for(T=0;T<E.length;T+=1)j(E[T],k,s);for(T=0;T<S.length;T+=1)v.delete(S[T]);C(t,q.prev,X.next),C(t,d,q),C(t,X,k),r=k,d=X,c-=1,E=[],S=[]}else v.delete(i),j(i,r,s),C(t,i.prev,i.next),C(t,i,d===null?t.first:d.next),C(t,d,i),d=i;continue}for(E=[],S=[];r!==null&&r.k!==w;)(r.e.f&Z)===0&&(v??=new Set).add(r),S.push(r),r=r.next;if(r===null)continue;i=r}E.push(i),d=i,r=i.next}if(r!==null||v!==void 0){for(var L=v===void 0?[]:pe(v);r!==null;)(r.e.f&Z)===0&&L.push(r),r=r.next;var Q=L.length;if(Q>0){var Me=(l&ge)!==0&&h===0?s:null;if(u){for(c=0;c<Q;c+=1)L[c].a?.measure();for(c=0;c<Q;c+=1)L[c].a?.fix()}it(t,L,Me)}}u&&Ye(()=>{if(g!==void 0)for(i of g)i.a?.apply()}),a.first=t.first&&t.first.e,a.last=d&&d.e;for(var De of n.values())re(De.e);n.clear()}function Ce(a,e,t,n){(n&J)!==0&&ue(a.v,e),(n&G)!==0?ue(a.i,t):a.i=t}function ae(a,e,t,n,s,o,l,f,m,u,p){var h=(m&J)!==0,_=(m&He)===0,A=h?_?Oe(s,!1,!1):de(s):s,r=(m&G)===0?l:de(l),v={i:r,v:A,k:o,a:null,e:null,prev:t,next:n};try{if(a===null){var d=document.createDocumentFragment();d.append(a=ne())}return v.e=Y(()=>f(a,A,r,u),N),v.e.prev=t&&t.e,v.e.next=n&&n.e,t===null?p||(e.first=v):(t.next=v,t.e.next=v.e),n!==null&&(n.prev=v,n.e.prev=v.e),v}finally{}}function j(a,e,t){for(var n=a.next?a.next.e.nodes_start:t,s=e?e.e.nodes_start:t,o=a.e.nodes_start;o!==null&&o!==n;){var l=ze(o);s.before(o),o=l}}function C(a,e,t){e===null?a.first=t:(e.next=t,e.e.next=t&&t.e),t!==null&&(t.prev=e,t.e.prev=e&&e.e)}function ut(a,e,t,n,s,o){let l=N;N&&ee();var f,m,u=null;N&&R.nodeType===Ge&&(u=R,ee());var p=N?R:a,h;ve(()=>{const _=e()||null;var A=Ke;_!==f&&(h&&(_===null?_e(h,()=>{h=null,m=null}):_===m?se(h):(re(h),ce(!1))),_&&_!==m&&(h=Y(()=>{if(u=N?u:document.createElementNS(A,_),Xe(u,u),n){N&&nt(_)&&u.append(document.createComment(""));var r=N?me(u):u.appendChild(ne());N&&(r===null?z(!1):H(r)),n(u,r)}he.nodes_end=u,p.before(u)})),f=_,f&&(m=f),ce(!0))},Je),l&&(z(!0),H(p))}/**
 * @license @lucide/svelte v0.544.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */const dt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var ct=Qe("<svg><!><!></svg>");function ft(a,e){Ee(e,!0);const t=O(e,"color",3,"currentColor"),n=O(e,"size",3,24),s=O(e,"strokeWidth",3,2),o=O(e,"absoluteStrokeWidth",3,!1),l=O(e,"iconNode",19,()=>[]),f=Te(e,["$$slots","$$events","$$legacy","name","color","size","strokeWidth","absoluteStrokeWidth","iconNode","children"]);var m=ct();fe(m,h=>({...dt,...f,width:n(),height:n(),stroke:t(),"stroke-width":h,class:["lucide-icon lucide",e.name&&`lucide-${e.name}`,e.class]}),[()=>o()?Number(s())*24/Number(n()):s()]);var u=Ze(m);lt(u,17,l,rt,(h,_)=>{var A=tt(()=>at(P(_),2));let r=()=>P(A)[0],v=()=>P(A)[1];var d=Ne(),g=Ae(d);ut(g,r,!0,(E,S)=>{fe(E,()=>({...v()}))}),te(h,d)});var p=je(u);Se(p,()=>e.children??Ue),et(m),te(a,m),we()}function wt(a,e){Ee(e,!0);/**
 * @license @lucide/svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */let t=Te(e,["$$slots","$$events","$$legacy"]);const n=[["path",{d:"M10 11v6"}],["path",{d:"M14 11v6"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"}],["path",{d:"M3 6h18"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"}]];ft(a,st({name:"trash-2"},()=>t,{get iconNode(){return n},children:(s,o)=>{var l=Ne(),f=Ae(l);Se(f,()=>e.children??Ue),te(s,l)},$$slots:{default:!0}})),we()}const xe="wars_battles";function K(){return crypto.randomUUID()}function vt(){if(typeof localStorage>"u")return[];try{const a=localStorage.getItem(xe);return a?JSON.parse(a):[]}catch{return[]}}function pt(a){typeof localStorage>"u"||localStorage.setItem(xe,JSON.stringify(a))}const F=y(vt());F.subscribe(pt);const B=y(null),W=ie([F,B],([a,e])=>a.find(t=>t.id===e)??null),D=y(null),Ut=ie([W,D],([a,e])=>a?.factions.find(t=>t.id===e)??null),Nt=y("army"),$=y(null),At=ie([W,$],([a,e])=>a?.placedUnits.find(t=>t.id===e)??null);function x(a){const e=M(B);e&&F.update(t=>t.map(n=>{if(n.id!==e)return n;const s=a(n);return s.updatedAt=Date.now(),s}))}function St(a){const e=K(),t={id:e,name:a,createdAt:Date.now(),updatedAt:Date.now(),mapCenter:[35,105],mapZoom:5,factions:[],placedUnits:[],actionLog:[]};return F.update(n=>[...n,t]),B.set(e),e}function Tt(a){F.update(e=>e.filter(t=>t.id!==a)),M(B)===a&&(B.set(null),D.set(null))}function Ct(a){const e=M(F).find(t=>t.id===a);e&&(B.set(a),D.set(e.factions[0]?.id??null))}function xt(a,e){const t=K(),n={id:t,name:a,color:e,units:[]};return x(s=>({...s,factions:[...s.factions,n]})),M(D)||D.set(t),le(`添加阵营: ${a}`),t}function It(a){if(x(e=>({...e,factions:e.factions.filter(t=>t.id!==a),placedUnits:e.placedUnits.filter(t=>t.factionId!==a)})),M(D)===a){const e=M(W);D.set(e?.factions[0]?.id??null)}}function Mt(a){D.update(e=>e===a?null:a)}function Dt(a,e){x(t=>({...t,factions:t.factions.map(n=>n.id===a?{...n,units:[...n.units,e]}:n)})),le(`${M(W)?.factions.find(t=>t.id===a)?.name??""} 创建单位: ${e.name}`)}function Rt(a,e){x(t=>({...t,factions:t.factions.map(n=>n.id===a?{...n,units:n.units.filter(s=>s.id!==e)}:n),placedUnits:t.placedUnits.filter(n=>n.unitId!==e)}))}function kt(a,e,t){x(n=>({...n,factions:n.factions.map(s=>s.id===a?{...s,units:s.units.map(o=>o.id===e?t(o):o)}:s)}))}function yt(a,e,t,n){const s=K(),o={id:s,unitId:a,factionId:e,lat:t,lng:n,route:[],strikeRadius:0,status:"idle"};return x(l=>({...l,placedUnits:[...l.placedUnits,o]})),le(`在 (${t.toFixed(3)}, ${n.toFixed(3)}) 放置单位`),s}function Bt(a){x(e=>({...e,placedUnits:e.placedUnits.filter(t=>t.id!==a)})),M($)===a&&$.set(null)}function Ie(a,e){x(t=>({...t,placedUnits:t.placedUnits.map(n=>n.id===a?{...n,...e}:n)}))}function Ft(a,e,t){const s=M(W)?.placedUnits.find(o=>o.id===a);s&&Ie(a,{route:[...s.route,[e,t]]})}function bt(a){Ie(a,{route:[]})}function le(a){const e={id:K(),timestamp:Date.now(),message:a};x(t=>({...t,actionLog:[...t.actionLog,e]}))}function Lt(){x(a=>({...a,factions:[],placedUnits:[],actionLog:[],updatedAt:Date.now()})),D.set(null),$.set(null)}const Ot=y("select"),Pt=y(null);export{kt as A,xt as B,ft as I,wt as T,St as a,F as b,B as c,Tt as d,lt as e,W as f,Pt as g,Ft as h,Ot as i,rt as j,D as k,Ct as l,At as m,le as n,bt as o,yt as p,Mt as q,Bt as r,$ as s,Ut as t,Ie as u,Lt as v,It as w,Nt as x,Dt as y,Rt as z};
