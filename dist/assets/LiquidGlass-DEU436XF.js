import{k as i,n as e}from"./index-DXhAa1v6.js";/**
 * @license lucide-react v0.387.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=i("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);function x({children:t,className:l="",style:d={},radius:a=28,strong:o=!1,tint:r}){const s=typeof a=="number"?`${a}px`:a;return e.jsxs("div",{className:`relative overflow-hidden ${l}`,style:{borderRadius:s,boxShadow:"0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",background:"transparent",...d},children:[e.jsx("div",{className:"glass-filter",style:{borderRadius:s,filter:`url(#${o?"lg-dist-strong":"lg-dist"})`}}),e.jsx("div",{className:"glass-overlay",style:{borderRadius:s,...r?{background:r}:{}}}),e.jsx("div",{className:"glass-specular",style:{borderRadius:s}}),e.jsx("div",{className:"glass-content",style:{borderRadius:s},children:t})]})}export{x as L,n as a};
