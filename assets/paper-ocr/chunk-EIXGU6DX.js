import{a as $t}from"./chunk-VUJKWCT3.js";var Aa=Object.defineProperty,zg=Object.getOwnPropertyDescriptor,Cg=Object.getOwnPropertyNames,Ag=Object.prototype.hasOwnProperty,Og=(e=>typeof $t<"u"?$t:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof $t<"u"?$t:t)[r]}):e)(function(e){if(typeof $t<"u")return $t.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),U=(e,t)=>()=>(e&&(t=e(e=0)),t),Vt=(e,t)=>{for(var r in t)Aa(e,r,{get:t[r],enumerable:!0})},Rg=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Cg(t))!Ag.call(e,a)&&a!==r&&Aa(e,a,{get:()=>t[a],enumerable:!(i=zg(t,a))||i.enumerable});return e},dr=e=>Rg(Aa({},"__esModule",{value:!0}),e),Kt,ct,Pt,Js,Rd,Bd=U(()=>{"use strict";Kt=new Map,ct=[],Pt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=Kt.get(e);if(i===void 0)Kt.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=ct.indexOf(e);a!==-1&&ct.splice(a,1);for(let n=0;n<ct.length;n++)if(Kt.get(ct[n]).priority<=r){ct.splice(n,0,e);return}ct.push(e)}return}throw new TypeError("not a valid backend")},Js=async e=>{let t=Kt.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},Rd=async e=>{let t=e.executionProviders||[],r=t.map(d=>typeof d=="string"?d:d.name),i=r.length===0?ct:r,a,n=[],s=new Set;for(let d of i){let p=await Js(d);typeof p=="string"?n.push({name:d,err:p}):(a||(a=p),a===p&&s.add(d))}if(!a)throw new Error(`no available backend found. ERR: ${n.map(d=>`[${d.name}] ${d.err}`).join(", ")}`);for(let{name:d,err:p}of n)r.includes(d)&&console.warn(`removing requested execution provider "${d}" from session options because it is not available: ${p}`);let u=t.filter(d=>s.has(typeof d=="string"?d:d.name));return[a,new Proxy(e,{get:(d,p)=>p==="executionProviders"?u:Reflect.get(d,p)})]}}),Bg=U(()=>{"use strict";Bd()}),Nd,Ng=U(()=>{"use strict";Nd="1.24.3"}),wi,Ie,Md=U(()=>{"use strict";Ng(),wi="warning",Ie={wasm:{},webgl:{},webgpu:{},versions:{common:Nd},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);wi=e}},get logLevel(){return wi}},Object.defineProperty(Ie,"logLevel",{enumerable:!0})}),_e,Mg=U(()=>{"use strict";Md(),_e=Ie}),Dd,Ud,Dg=U(()=>{"use strict";Dd=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,n;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[3]):(a=e.dims[3],n=e.dims[2]);let s=t?.format!==void 0?t.format:"RGB",u=t?.norm,d,p;u===void 0||u.mean===void 0?d=[255,255,255,255]:typeof u.mean=="number"?d=[u.mean,u.mean,u.mean,u.mean]:(d=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(d[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let m=n*a,h=0,g=m,_=m*2,y=-1;s==="RGBA"?(h=0,g=m,_=m*2,y=m*3):s==="RGB"?(h=0,g=m,_=m*2):s==="RBG"&&(h=0,_=m,g=m*2);for(let $=0;$<n;$++)for(let S=0;S<a;S++){let v=(e.data[h++]-p[0])*d[0],w=(e.data[g++]-p[1])*d[1],I=(e.data[_++]-p[2])*d[2],k=y===-1?255:(e.data[y++]-p[3])*d[3];i.fillStyle="rgba("+v+","+w+","+I+","+k+")",i.fillRect(S,$,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},Ud=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,n,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[1],s=e.dims[3]):(a=e.dims[3],n=e.dims[2],s=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",d=t?.norm,p,m;d===void 0||d.mean===void 0?p=[255,255,255,255]:typeof d.mean=="number"?p=[d.mean,d.mean,d.mean,d.mean]:(p=[d.mean[0],d.mean[1],d.mean[2],255],d.mean[3]!==void 0&&(p[3]=d.mean[3])),d===void 0||d.bias===void 0?m=[0,0,0,0]:typeof d.bias=="number"?m=[d.bias,d.bias,d.bias,d.bias]:(m=[d.bias[0],d.bias[1],d.bias[2],0],d.bias[3]!==void 0&&(m[3]=d.bias[3]));let h=n*a;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,_=0,y=1,$=2,S=3,v=0,w=h,I=h*2,k=-1;u==="RGBA"?(v=0,w=h,I=h*2,k=h*3):u==="RGB"?(v=0,w=h,I=h*2):u==="RBG"&&(v=0,I=h,w=h*2),i=r.createImageData(a,n);for(let E=0;E<n*a;_+=g,y+=g,$+=g,S+=g,E++)i.data[_]=(e.data[v++]-m[0])*p[0],i.data[y]=(e.data[w++]-m[1])*p[1],i.data[$]=(e.data[I++]-m[2])*p[2],i.data[S]=k===-1?255:(e.data[k++]-m[3])*p[3]}else throw new Error("Can not access image data");return i}}),Tr,Pd,qd,Wd,Ld,Vd,Ug=U(()=>{"use strict";Oa(),Tr=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},n,s;typeof a.mean=="number"?n=[a.mean,a.mean,a.mean,a.mean]:n=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?s=[a.bias,a.bias,a.bias,a.bias]:s=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",d=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*i,m=d==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),h=4,g=0,_=1,y=2,$=3,S=0,v=p,w=p*2,I=-1;u==="RGB"&&(h=3,g=0,_=1,y=2,$=-1),d==="RGBA"?I=p*3:d==="RBG"?(S=0,w=p,v=p*2):d==="BGR"&&(w=0,v=p,S=p*2);for(let k=0;k<p;k++,g+=h,y+=h,_+=h,$+=h)m[S++]=(e[g]+s[0])/n[0],m[v++]=(e[_]+s[1])/n[1],m[w++]=(e[y]+s[2])/n[2],I!==-1&&$!==-1&&(m[I++]=(e[$]+s[3])/n[3]);return d==="RGBA"?new Be("float32",m,[1,4,r,i]):new Be("float32",m,[1,3,r,i])},Pd=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,n=typeof e=="string",s,u=t??{},d=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},p=m=>typeof HTMLCanvasElement<"u"&&m instanceof HTMLCanvasElement||m instanceof OffscreenCanvas?m.getContext("2d"):null;if(r){let m=d();m.width=e.width,m.height=e.height;let h=p(m);if(h!=null){let g=e.height,_=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,_=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=_}else u.tensorFormat="RGBA",u.height=g,u.width=_;h.drawImage(e,0,0),s=h.getImageData(0,0,_,g).data}else throw new Error("Can not access image data")}else if(i){let m,h;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(m=t.resizedHeight,h=t.resizedWidth):(m=e.height,h=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=m,u.width=h,t!==void 0){let g=d();g.width=h,g.height=m;let _=p(g);if(_!=null)_.putImageData(e,0,0),s=_.getImageData(0,0,h,m).data;else throw new Error("Can not access image data")}else s=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let m=d();m.width=e.width,m.height=e.height;let h=p(m);if(h!=null){let g=e.height,_=e.width;return h.drawImage(e,0,0,_,g),s=h.getImageData(0,0,_,g).data,u.height=g,u.width=_,Tr(s,u)}else throw new Error("Can not access image data")}else{if(n)return new Promise((m,h)=>{let g=d(),_=p(g);if(!e||!_)return h();let y=new Image;y.crossOrigin="Anonymous",y.src=e,y.onload=()=>{g.width=y.width,g.height=y.height,_.drawImage(y,0,0,g.width,g.height);let $=_.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,m(Tr($.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return Tr(s,u);throw new Error("Input data provided is not supported - aborted tensor creation")},qd=(e,t)=>{let{width:r,height:i,download:a,dispose:n}=t,s=[1,i,r,4];return new Be({location:"texture",type:"float32",texture:e,dims:s,download:a,dispose:n})},Wd=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Be({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:n})},Ld=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Be({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:n})},Vd=(e,t,r)=>new Be({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),kt,nr,bi,Gd,Pg=U(()=>{"use strict";kt=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),nr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),bi=!1,Gd=()=>{if(!bi){bi=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(kt.set("int64",BigInt64Array),nr.set(BigInt64Array,"int64")),t&&(kt.set("uint64",BigUint64Array),nr.set(BigUint64Array,"uint64")),i?(kt.set("float16",r),nr.set(r,"float16")):kt.set("float16",Uint16Array)}}}),Hd,Fd,qg=U(()=>{"use strict";Oa(),Hd=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},Fd=(e,t)=>{switch(e.location){case"cpu":return new Be(e.type,e.data,t);case"cpu-pinned":return new Be({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Be({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Be({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Be({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Be,Oa=U(()=>{"use strict";Dg(),Ug(),Pg(),qg(),Be=class{constructor(e,t,r){Gd();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let s=kt.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let d=kt.get(e);if(d===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&d===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${d.name} as data.`);e==="uint64"||e==="int64"?s=d.from(t,BigInt):s=d.from(t)}else if(t instanceof d)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&d!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${d}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let d=typeof e[0];if(d==="string")i="string",s=e;else if(d==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${d}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let d=nr.get(e.constructor);if(d===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=d,s=e}if(u===void 0)u=[s.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");a=u,this.cpuData=s,this.dataLocation="cpu"}let n=Hd(a);if(this.cpuData&&n!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(n/2)===this.cpuData.length))throw new Error(`Tensor's size(${n}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=n}static async fromImage(e,t){return Pd(e,t)}static fromTexture(e,t){return qd(e,t)}static fromGpuBuffer(e,t){return Wd(e,t)}static fromMLTensor(e,t){return Ld(e,t)}static fromPinnedBuffer(e,t,r){return Vd(e,t,r)}toDataURL(e){return Dd(this,e)}toImageData(e){return Ud(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return Fd(this,e)}}}),Xe,jd=U(()=>{"use strict";Oa(),Xe=Be}),qr,$i,Je,je,zt,Ct,Kd=U(()=>{"use strict";Md(),qr=(e,t)=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||console.timeStamp(`${e}::ORT::${t}`)},$i=(e,t)=>{let r=new Error().stack?.split(/\r\n|\r|\n/g)||[],i=!1;for(let a=0;a<r.length;a++){if(i&&!r[a].includes("TRACE_FUNC")){let n=`FUNC_${e}::${r[a].trim().split(" ")[1]}`;t&&(n+=`::${t}`),qr("CPU",n);return}r[a].includes("TRACE_FUNC")&&(i=!0)}},Je=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||$i("BEGIN",e)},je=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||$i("END",e)},zt=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||console.time(`ORT::${e}`)},Ct=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||console.timeEnd(`ORT::${e}`)}}),Qd,Wg=U(()=>{"use strict";Bd(),jd(),Kd(),Qd=class Zd{constructor(t){this.handler=t}async run(t,r,i){Je(),zt("InferenceSession.run");let a={},n={};if(typeof t!="object"||t===null||t instanceof Xe||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Xe)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let p of r){if(typeof p!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(p)===-1)throw new RangeError(`'fetches' contains invalid output name: ${p}.`);a[p]=null}if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let p=!1,m=Object.getOwnPropertyNames(r);for(let h of this.outputNames)if(m.indexOf(h)!==-1){let g=r[h];(g===null||g instanceof Xe)&&(p=!0,s=!1,a[h]=g)}if(p){if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else n=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let p of this.inputNames)if(typeof t[p]>"u")throw new Error(`input '${p}' is missing in 'feeds'.`);if(s)for(let p of this.outputNames)a[p]=null;let u=await this.handler.run(t,a,n),d={};for(let p in u)if(Object.hasOwnProperty.call(u,p)){let m=u[p];m instanceof Xe?d[p]=m:d[p]=new Xe(m.type,m.data,m.dims)}return Ct("InferenceSession.run"),je(),d}async release(){return this.handler.dispose()}static async create(t,r,i,a){Je(),zt("InferenceSession.create");let n,s={};if(typeof t=="string"){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let m=t,h=0,g=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(h=r,!Number.isSafeInteger(h))throw new RangeError("'byteOffset' must be an integer.");if(h<0||h>=m.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${m.byteLength}).`);if(g=t.byteLength-h,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||h+g>m.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${m.byteLength-h}].`);if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");n=new Uint8Array(m,h,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,d]=await Rd(s),p=await u.createInferenceSessionHandler(n,d);return Ct("InferenceSession.create"),je(),new Zd(p)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),Yd,Lg=U(()=>{"use strict";Wg(),Yd=Qd}),Vg=U(()=>{"use strict"}),Gg=U(()=>{"use strict"}),Hg=U(()=>{"use strict"}),Fg=U(()=>{"use strict"}),Xd={};Vt(Xd,{InferenceSession:()=>Yd,TRACE:()=>qr,TRACE_EVENT_BEGIN:()=>zt,TRACE_EVENT_END:()=>Ct,TRACE_FUNC_BEGIN:()=>Je,TRACE_FUNC_END:()=>je,Tensor:()=>Xe,env:()=>_e,registerBackend:()=>Pt});var Ue=U(()=>{"use strict";Bg(),Mg(),Lg(),jd(),Vg(),Gg(),Kd(),Hg(),Fg()}),Ra=U(()=>{"use strict"}),Jd={};Vt(Jd,{default:()=>ep});var vi,xi,ep,jg=U(()=>{"use strict";sf(),Bt(),Ba(),vi="ort-wasm-proxy-worker",xi=globalThis.self?.name===vi,xi&&(self.onmessage=e=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":Na(r.wasm).then(()=>{Xa(r).then(()=>{postMessage({type:t})},i=>{postMessage({type:t,err:i})})},i=>{postMessage({type:t,err:i})});break;case"init-ep":{let{epName:i,env:a}=r;Ja(a,i).then(()=>{postMessage({type:t})},n=>{postMessage({type:t,err:n})});break}case"copy-from":{let{buffer:i}=r,a=jr(i);postMessage({type:t,out:a});break}case"create":{let{model:i,options:a}=r;en(i,a).then(n=>{postMessage({type:t,out:n})},n=>{postMessage({type:t,err:n})});break}case"release":tn(r),postMessage({type:t});break;case"run":{let{sessionId:i,inputIndices:a,inputs:n,outputIndices:s,options:u}=r;rn(i,a,n,s,new Array(s.length).fill(null),u).then(d=>{d.some(p=>p[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:d},nn([...n,...d]))},d=>{postMessage({type:t,err:d})});break}case"end-profiling":an(r),postMessage({type:t});break;default:}}catch(i){postMessage({type:t,err:i})}}),ep=xi?null:e=>new Worker(e??Re,{type:"module",name:vi})}),tp={};Vt(tp,{default:()=>rp});async function eo(e={}){var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,a=i&&self.name?.startsWith("em-pthread");t.mountExternalData=(o,l)=>{o.startsWith("./")&&(o=o.substring(2)),(t.Zc||(t.Zc=new Map)).set(o,l)},t.unmountExternalData=()=>{delete t.Zc},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,ae:!0}).buffer.constructor;let n=o=>async(...l)=>{try{if(t.$c)throw Error("Session already started");let f=t.$c={Nd:l[0],errors:[]},c=await o(...l);if(t.$c!==f)throw Error("Session mismatch");t.gd?.flush();let b=f.errors;if(0<b.length){let T=await Promise.all(b);if(T=T.filter(z=>z),0<T.length)throw Error(T.join(`
`))}return c}finally{t.$c=null}};t.jsepInit=(o,l)=>{if(o==="webgpu"){[t.gd,t.Dd,t.Hd,t.jd,t.Gd,t.ac,t.Id,t.Kd,t.Ed,t.Fd,t.Jd]=l;let f=t.gd;t.jsepRegisterBuffer=(c,b,T,z)=>f.registerBuffer(c,b,T,z),t.jsepGetBuffer=c=>f.getBuffer(c),t.jsepCreateDownloader=(c,b,T)=>f.createDownloader(c,b,T),t.jsepOnCreateSession=c=>{f.onCreateSession(c)},t.jsepOnReleaseSession=c=>{f.onReleaseSession(c)},t.jsepOnRunStart=c=>f.onRunStart(c),t.Ld=(c,b)=>{f.upload(c,b)}}else if(o==="webnn"){let f=l[0];[t.Zd,t.vd,t.webnnEnsureTensor,t.xd,t.webnnDownloadTensor,t.Yd,t.webnnEnableTraceEvent]=l.slice(1),t.webnnReleaseTensorId=t.vd,t.webnnUploadTensor=t.xd,t.webnnRegisterMLContext=t.Yd,t.webnnOnRunStart=c=>f.onRunStart(c),t.webnnOnRunEnd=f.onRunEnd.bind(f),t.webnnOnReleaseSession=c=>{f.onReleaseSession(c)},t.webnnCreateMLTensorDownloader=(c,b)=>f.createMLTensorDownloader(c,b),t.webnnRegisterMLTensor=(c,b,T,z)=>f.registerMLTensor(c,b,T,z),t.webnnCreateMLContext=c=>f.createMLContext(c),t.webnnRegisterMLConstant=(c,b,T,z,B,q)=>f.registerMLConstant(c,b,T,z,B,t.Zc,q),t.webnnRegisterGraphInput=f.registerGraphInput.bind(f),t.webnnIsGraphInput=f.isGraphInput.bind(f),t.webnnRegisterGraphOutput=f.registerGraphOutput.bind(f),t.webnnIsGraphOutput=f.isGraphOutput.bind(f),t.webnnCreateTemporaryTensor=f.createTemporaryTensor.bind(f),t.webnnIsGraphInputOutputTypeSupported=f.isGraphInputOutputTypeSupported.bind(f)}};let s=()=>{let o=l=>(...f)=>{let c=Qe;return f=l(...f),Qe!=c?new Promise((b,T)=>{si={resolve:b,reject:T}}):f};(()=>{for(let l of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[l]=o(t[l])})(),n!==void 0&&(t._OrtRun=n(t._OrtRun),t._OrtRunWithBinding=n(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s?.()};var u,d,p=(o,l)=>{throw l},m=import.meta.url,h="";if(r||i){try{h=new URL(".",m).href}catch{}i&&(d=o=>{var l=new XMLHttpRequest;return l.open("GET",o,!1),l.responseType="arraybuffer",l.send(null),new Uint8Array(l.response)}),u=async o=>{if(O(o))return new Promise((f,c)=>{var b=new XMLHttpRequest;b.open("GET",o,!0),b.responseType="arraybuffer",b.onload=()=>{b.status==200||b.status==0&&b.response?f(b.response):c(b.status)},b.onerror=c,b.send(null)});var l=await fetch(o,{credentials:"same-origin"});if(l.ok)return l.arrayBuffer();throw Error(l.status+" : "+l.url)}}var g,_,y,$,S,v,w=console.log.bind(console),I=console.error.bind(console),k=w,E=I,C=!1,O=o=>o.startsWith("file://");function x(){ut.buffer!=Z.buffer&&J()}if(a){let o=function(l){try{var f=l.data,c=f.Uc;if(c==="load"){let b=[];self.onmessage=T=>b.push(T),v=()=>{postMessage({Uc:"loaded"});for(let T of b)o(T);self.onmessage=o};for(let T of f.Ad)t[T]&&!t[T].proxy||(t[T]=(...z)=>{postMessage({Uc:"callHandler",zd:T,args:z})},T=="print"&&(k=t[T]),T=="printErr"&&(E=t[T]));ut=f.Vd,J(),_=f.Wd,Pe(),Sr()}else if(c==="run"){(function(b){var T=(x(),P)[b+52>>>2>>>0];b=(x(),P)[b+56>>>2>>>0],us(T,T-b),ae(T)})(f.Tc),pi(f.Tc,0,0,1,0,0),ln(),ii(f.Tc),W||(rs(),W=!0);try{_f(f.Pd,f.dd)}catch(b){if(b!="unwind")throw b}}else f.target!=="setimmediate"&&(c==="checkMailbox"?W&&yr():c&&(E(`worker: received unknown command ${c}`),E(f)))}catch(b){throw is(),b}};var D=o,W=!1;self.onunhandledrejection=l=>{throw l.reason||l},self.onmessage=o}var Z,L,K,se,A,P,ee,Y,F,le,M,V=!1;function J(){var o=ut.buffer;t.HEAP8=Z=new Int8Array(o),K=new Int16Array(o),t.HEAPU8=L=new Uint8Array(o),se=new Uint16Array(o),t.HEAP32=A=new Int32Array(o),t.HEAPU32=P=new Uint32Array(o),ee=new Float32Array(o),Y=new Float64Array(o),F=new BigInt64Array(o),le=new BigUint64Array(o)}function de(){V=!0,a?v():rt.tb()}function Te(o){throw E(o="Aborted("+o+")"),C=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),S?.(o),o}function Oe(){return{a:{ma:Vm,hb:Lm,g:wf,J:bf,f:$f,o:vf,h:xf,ha:Sf,b:Tf,T:kf,Ia:mn,n:If,_:wn,Ya:bn,Ea:$n,Ga:vn,Za:xn,Wa:Sn,Pa:Tn,Va:kn,ka:In,Fa:En,Ca:zn,Xa:Cn,Da:An,cb:Ef,ea:Cf,xa:Af,va:Rf,da:Nf,O:Mf,H:Df,wa:Uf,Z:Hf,ya:Ff,Sa:jf,Aa:Qf,Ja:Zf,ta:Yf,fa:Xf,Ra:ii,$a:Jf,R:im,s:um,c:ti,ib:lm,y:dm,M:pm,D:cm,m:hm,t:Pn,jb:fm,I:mm,S:gm,j:ym,v:_m,r:wm,l:bm,Ma:$m,Na:vm,Oa:xm,Ka:Vn,La:Gn,ua:Hn,eb:Tm,bb:Em,u:zm,aa:Cm,ga:Am,ab:km,V:Om,_a:Rm,Ba:Bm,F:Sm,U:Nm,la:vr,za:Dm,gb:Mm,fb:Um,Ta:Qn,Ua:Zn,Ha:Zr,$:Yn,ja:Xn,Qa:Jn,ia:es,lb:kg,na:wg,mb:Tg,oa:_g,G:lg,d:jm,q:Hm,w:Gm,B:ig,pb:mg,K:sg,x:Qm,pa:gg,X:bg,ba:fg,nb:Sg,ob:xg,ra:dg,qa:hg,qb:pg,N:og,Y:yg,e:Km,A:Zm,k:Fm,kb:Ig,p:Xm,z:Jm,C:Ym,E:eg,L:ag,rb:ug,Q:$g,ca:ng,W:vg,sb:rg,sa:tg,P:cg,i:qm,a:ut,db:Qr}}}async function Pe(){function o(c,b){var T=rt=c.exports;c={};for(let[z,B]of Object.entries(T))typeof B=="function"?(T=em(B),c[z]=T):c[z]=B;return rt=c,rt=(function(){var z=rt,B=G=>ie=>G(ie)>>>0,q=G=>()=>G()>>>0;return(z=Object.assign({},z)).ub=B(z.ub),z.Yb=q(z.Yb),z._b=B(z._b),z.mc=B(z.mc),z.nc=q(z.nc),z.rc=B(z.rc),z})(),on.push(rt.$b),ts=(c=rt).ub,rs=c.vb,t._OrtInit=c.wb,t._OrtGetLastError=c.xb,t._OrtCreateSessionOptions=c.yb,t._OrtAppendExecutionProvider=c.zb,t._OrtAddFreeDimensionOverride=c.Ab,t._OrtAddSessionConfigEntry=c.Bb,t._OrtReleaseSessionOptions=c.Cb,t._OrtCreateSession=c.Db,t._OrtReleaseSession=c.Eb,t._OrtGetInputOutputCount=c.Fb,t._OrtGetInputOutputMetadata=c.Gb,t._OrtFree=c.Hb,t._OrtCreateTensor=c.Ib,t._OrtGetTensorData=c.Jb,t._OrtReleaseTensor=c.Kb,t._OrtCreateRunOptions=c.Lb,t._OrtAddRunConfigEntry=c.Mb,t._OrtReleaseRunOptions=c.Nb,t._OrtCreateBinding=c.Ob,t._OrtBindInput=c.Pb,t._OrtBindOutput=c.Qb,t._OrtClearBoundOutputs=c.Rb,t._OrtReleaseBinding=c.Sb,t._OrtRunWithBinding=c.Tb,t._OrtRun=c.Ub,t._OrtEndProfiling=c.Vb,t._JsepOutput=c.Wb,t._JsepGetNodeName=c.Xb,xr=c.Yb,Ze=t._free=c.Zb,Ft=t._malloc=c._b,pi=c.bc,is=c.cc,as=c.dc,ns=c.ec,ci=c.fc,ss=c.gc,os=c.hc,oe=c.ic,jt=c.jc,us=c.kc,ae=c.lc,hi=c.mc,ne=c.nc,ls=c.oc,fi=c.pc,ds=c.qc,ps=c.rc,cs=c.sc,mi=c.tc,hs=c.uc,fs=c.vc,ms=c.wc,gs=c.xc,ys=c.yc,_s=c.zc,ws=c.Ac,bs=c.Bc,$s=c.Cc,vs=c.Dc,xs=c.Ec,Ss=c.Fc,Ts=c.Gc,ks=c.Hc,Is=c.Ic,Es=c.Jc,zs=c.Kc,Cs=c.Lc,As=c.Mc,Os=c.Nc,Rs=c.Oc,Bs=c.Pc,Ns=c.Rc,Ms=c.Sc,Ds=c.bd,Us=c.cd,Ps=c.hd,qs=c.kd,Ws=c.ld,Ls=c.md,Vs=c.nd,Gs=c.od,Hs=c.pd,Fs=c.qd,js=c.rd,Ks=c.wd,Qs=c.Rd,Zs=c.Sd,Ys=c.Td,Xs=c.Ud,_=b,rt}var l,f=Oe();return t.instantiateWasm?new Promise(c=>{t.instantiateWasm(f,(b,T)=>{c(o(b,T))})}):a?o(new WebAssembly.Instance(_,Oe()),_):(M??=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",h):h+"ort-wasm-simd-threaded.jsep.wasm":new URL("ort-wasm-simd-threaded.jsep.wasm",import.meta.url).href,l=await(async function(c){var b=M;if(!g&&!O(b))try{var T=fetch(b,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(T,c)}catch(z){E(`wasm streaming compile failed: ${z}`),E("falling back to ArrayBuffer instantiation")}return(async function(z,B){try{var q=await(async function(G){if(!g)try{var ie=await u(G);return new Uint8Array(ie)}catch{}if(G==M&&g)G=new Uint8Array(g);else{if(!d)throw"both async and sync fetching of the wasm failed";G=d(G)}return G})(z);return await WebAssembly.instantiate(q,B)}catch(G){E(`failed to asynchronously prepare wasm: ${G}`),Te(G)}})(b,c)})(f),o(l.instance,l.module))}class et{name="ExitStatus";constructor(l){this.message=`Program terminated with exit(${l})`,this.status=l}}var xe=o=>{o.terminate(),o.onmessage=()=>{}},be=[],Ae=0,yt=null,cr=o=>{ot.length==0&&(pn(),dn(ot[0]));var l=ot.pop();if(!l)return 6;Gt.push(l),_t[o.Tc]=l,l.Tc=o.Tc;var f={Uc:"run",Pd:o.Od,dd:o.dd,Tc:o.Tc};return l.postMessage(f,o.ud),0},st=0,we=(o,l,...f)=>{var c,b=16*f.length,T=ne(),z=hi(b),B=z>>>3;for(c of f)typeof c=="bigint"?((x(),F)[B++>>>0]=1n,(x(),F)[B++>>>0]=c):((x(),F)[B++>>>0]=0n,(x(),Y)[B++>>>0]=c);return o=as(o,0,b,z,l),ae(T),o};function Qr(o){if(a)return we(0,1,o);if(y=o,!(0<st)){for(var l of Gt)xe(l);for(l of ot)xe(l);ot=[],Gt=[],_t={},C=!0}p(0,new et(o))}function sn(o){if(a)return we(1,0,o);Zr(o)}var Zr=o=>{if(y=o,a)throw sn(o),"unwind";Qr(o)},ot=[],Gt=[],on=[],_t={},un=o=>{var l=o.Tc;delete _t[l],ot.push(o),Gt.splice(Gt.indexOf(o),1),o.Tc=0,ns(l)};function ln(){on.forEach(o=>o())}var dn=o=>new Promise(l=>{o.onmessage=b=>{var T=b.data;if(b=T.Uc,T.ad&&T.ad!=xr()){var z=_t[T.ad];z?z.postMessage(T,T.ud):E(`Internal error! Worker sent a message "${b}" to target pthread ${T.ad}, but that thread no longer exists!`)}else b==="checkMailbox"?yr():b==="spawnThread"?cr(T):b==="cleanupThread"?gr(()=>{un(_t[T.Qd])}):b==="loaded"?(o.loaded=!0,l(o)):T.target==="setimmediate"?o.postMessage(T):b==="uncaughtException"?o.onerror(T.error):b==="callHandler"?t[T.zd](...T.args):b&&E(`worker sent an unknown command ${b}`)},o.onerror=b=>{throw E(`worker sent an error! ${b.filename}:${b.lineno}: ${b.message}`),b};var f,c=[];for(f of[])t.propertyIsEnumerable(f)&&c.push(f);o.postMessage({Uc:"load",Ad:c,Vd:ut,Wd:_})});function pn(){var o=new Worker((()=>{let l=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new l("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});ot.push(o)}var ut,_f=(o,l)=>{st=0,o=mi(o,l),0<st?y=o:ci(o)},hr=[],fr=0;function wf(o){var l=new Yr(o>>>=0);return(x(),Z)[l.Vc+12>>>0]==0&&(cn(l,!0),fr--),hn(l,!1),hr.push(l),ps(o)}var Mt=0,bf=()=>{oe(0,0);var o=hr.pop();ls(o.ed),Mt=0};function cn(o,l){l=l?1:0,(x(),Z)[o.Vc+12>>>0]=l}function hn(o,l){l=l?1:0,(x(),Z)[o.Vc+13>>>0]=l}class Yr{constructor(l){this.ed=l,this.Vc=l-24}}var Xr=o=>{var l=Mt;if(!l)return jt(0),0;var f=new Yr(l);(x(),P)[f.Vc+16>>>2>>>0]=l;var c=(x(),P)[f.Vc+4>>>2>>>0];if(!c)return jt(0),l;for(var b of o){if(b===0||b===c)break;if(ds(b,c,f.Vc+16))return jt(b),l}return jt(c),l};function $f(){return Xr([])}function vf(o){return Xr([o>>>0])}function xf(o,l,f,c){return Xr([o>>>0,l>>>0,f>>>0,c>>>0])}var Sf=()=>{var o=hr.pop();o||Te("no exception to throw");var l=o.ed;throw(x(),Z)[o.Vc+13>>>0]==0&&(hr.push(o),hn(o,!0),cn(o,!1),fr++),fi(l),Mt=l};function Tf(o,l,f){var c=new Yr(o>>>=0);throw l>>>=0,f>>>=0,(x(),P)[c.Vc+16>>>2>>>0]=0,(x(),P)[c.Vc+4>>>2>>>0]=l,(x(),P)[c.Vc+8>>>2>>>0]=f,fi(o),fr++,Mt=o}var kf=()=>fr;function fn(o,l,f,c){return a?we(2,1,o,l,f,c):mn(o,l,f,c)}function mn(o,l,f,c){if(o>>>=0,l>>>=0,f>>>=0,c>>>=0,!globalThis.SharedArrayBuffer)return 6;var b=[];return a&&b.length===0?fn(o,l,f,c):(o={Od:f,Tc:o,dd:c,ud:b},a?(o.Uc="spawnThread",postMessage(o,b),0):cr(o))}function If(o){throw Mt||=o>>>0,Mt}var gn=globalThis.TextDecoder&&new TextDecoder,yn=(o,l,f,c)=>{if(f=l+f,c)return f;for(;o[l]&&!(l>=f);)++l;return l},_n=(o,l=0,f,c)=>{if(16<(f=yn(o,l>>>=0,f,c))-l&&o.buffer&&gn)return gn.decode(o.buffer instanceof ArrayBuffer?o.subarray(l,f):o.slice(l,f));for(c="";l<f;){var b=o[l++];if(128&b){var T=63&o[l++];if((224&b)==192)c+=String.fromCharCode((31&b)<<6|T);else{var z=63&o[l++];65536>(b=(240&b)==224?(15&b)<<12|T<<6|z:(7&b)<<18|T<<12|z<<6|63&o[l++])?c+=String.fromCharCode(b):(b-=65536,c+=String.fromCharCode(55296|b>>10,56320|1023&b))}}else c+=String.fromCharCode(b)}return c},Se=(o,l,f)=>(o>>>=0)?_n((x(),L),o,l,f):"";function wn(o,l,f){return a?we(3,1,o,l,f):0}function bn(o,l){if(a)return we(4,1,o,l)}function $n(o,l){if(a)return we(5,1,o,l)}function vn(o,l,f){if(a)return we(6,1,o,l,f)}function xn(o,l,f){return a?we(7,1,o,l,f):0}function Sn(o,l){if(a)return we(8,1,o,l)}function Tn(o,l,f){if(a)return we(9,1,o,l,f)}function kn(o,l,f,c){if(a)return we(10,1,o,l,f,c)}function In(o,l,f,c){if(a)return we(11,1,o,l,f,c)}function En(o,l,f,c){if(a)return we(12,1,o,l,f,c)}function zn(o){if(a)return we(13,1,o)}function Cn(o,l){if(a)return we(14,1,o,l)}function An(o,l,f){if(a)return we(15,1,o,l,f)}var Ef=()=>Te(""),Ke=o=>{o>>>=0;for(var l="";;){var f=(x(),L)[o++>>>0];if(!f)return l;l+=String.fromCharCode(f)}},Jr={},ei={},zf={},Dt=class extends Error{constructor(o){super(o),this.name="BindingError"}};function tt(o,l,f={}){return(function(c,b,T={}){var z=b.name;if(!c)throw new Dt(`type "${z}" must have a positive integer typeid pointer`);if(ei.hasOwnProperty(c)){if(T.Bd)return;throw new Dt(`Cannot register type '${z}' twice`)}ei[c]=b,delete zf[c],Jr.hasOwnProperty(c)&&(b=Jr[c],delete Jr[c],b.forEach(B=>B()))})(o,l,f)}var On=(o,l,f)=>{switch(l){case 1:return f?c=>(x(),Z)[c>>>0]:c=>(x(),L)[c>>>0];case 2:return f?c=>(x(),K)[c>>>1>>>0]:c=>(x(),se)[c>>>1>>>0];case 4:return f?c=>(x(),A)[c>>>2>>>0]:c=>(x(),P)[c>>>2>>>0];case 8:return f?c=>(x(),F)[c>>>3>>>0]:c=>(x(),le)[c>>>3>>>0];default:throw new TypeError(`invalid integer width (${l}): ${o}`)}};function Cf(o,l,f,c,b){o>>>=0,f>>>=0,l=Ke(l>>>0);let T=z=>z;if(c=c===0n){let z=8*f;T=B=>BigInt.asUintN(z,B),b=T(b)}tt(o,{name:l,Qc:T,Xc:(z,B)=>(typeof B=="number"&&(B=BigInt(B)),B),Wc:On(l,f,!c),Yc:null})}function Af(o,l,f,c){tt(o>>>=0,{name:l=Ke(l>>>0),Qc:function(b){return!!b},Xc:function(b,T){return T?f:c},Wc:function(b){return this.Qc((x(),L)[b>>>0])},Yc:null})}var Rn=[],wt=[0,1,,1,null,1,!0,1,!1,1];function ti(o){9<(o>>>=0)&&--wt[o+1]==0&&(wt[o]=void 0,Rn.push(o))}var Me=o=>{if(!o)throw new Dt(`Cannot use deleted val. handle = ${o}`);return wt[o]},qe=o=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let l=Rn.pop()||wt.length;return wt[l]=o,wt[l+1]=1,l}};function ri(o){return this.Qc((x(),P)[o>>>2>>>0])}var Of={name:"emscripten::val",Qc:o=>{var l=Me(o);return ti(o),l},Xc:(o,l)=>qe(l),Wc:ri,Yc:null};function Rf(o){return tt(o>>>0,Of)}var Bf=(o,l)=>{switch(l){case 4:return function(f){return this.Qc((x(),ee)[f>>>2>>>0])};case 8:return function(f){return this.Qc((x(),Y)[f>>>3>>>0])};default:throw new TypeError(`invalid float width (${l}): ${o}`)}};function Nf(o,l,f){f>>>=0,tt(o>>>=0,{name:l=Ke(l>>>0),Qc:c=>c,Xc:(c,b)=>b,Wc:Bf(l,f),Yc:null})}function Mf(o,l,f,c,b){o>>>=0,f>>>=0,l=Ke(l>>>0);let T=B=>B;if(c===0){var z=32-8*f;T=B=>B<<z>>>z,b=T(b)}tt(o,{name:l,Qc:T,Xc:(B,q)=>q,Wc:On(l,f,c!==0),Yc:null})}function Df(o,l,f){function c(T){var z=(x(),P)[T>>>2>>>0];return T=(x(),P)[T+4>>>2>>>0],new b((x(),Z).buffer,T,z)}var b=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][l];tt(o>>>=0,{name:f=Ke(f>>>0),Qc:c,Wc:c},{Bd:!0})}var lt=(o,l,f)=>{var c=(x(),L);if(l>>>=0,0<f){var b=l;f=l+f-1;for(var T=0;T<o.length;++T){var z=o.codePointAt(T);if(127>=z){if(l>=f)break;c[l++>>>0]=z}else if(2047>=z){if(l+1>=f)break;c[l++>>>0]=192|z>>6,c[l++>>>0]=128|63&z}else if(65535>=z){if(l+2>=f)break;c[l++>>>0]=224|z>>12,c[l++>>>0]=128|z>>6&63,c[l++>>>0]=128|63&z}else{if(l+3>=f)break;c[l++>>>0]=240|z>>18,c[l++>>>0]=128|z>>12&63,c[l++>>>0]=128|z>>6&63,c[l++>>>0]=128|63&z,T++}}c[l>>>0]=0,o=l-b}else o=0;return o},mr=o=>{for(var l=0,f=0;f<o.length;++f){var c=o.charCodeAt(f);127>=c?l++:2047>=c?l+=2:55296<=c&&57343>=c?(l+=4,++f):l+=3}return l};function Uf(o,l){tt(o>>>=0,{name:l=Ke(l>>>0),Qc(f){var c=(x(),P)[f>>>2>>>0];return c=Se(f+4,c,!0),Ze(f),c},Xc(f,c){c instanceof ArrayBuffer&&(c=new Uint8Array(c));var b=typeof c=="string";if(!(b||ArrayBuffer.isView(c)&&c.BYTES_PER_ELEMENT==1))throw new Dt("Cannot pass non-string to std::string");var T=b?mr(c):c.length,z=Ft(4+T+1),B=z+4;return(x(),P)[z>>>2>>>0]=T,b?lt(c,B,T+1):(x(),L).set(c,B>>>0),f!==null&&f.push(Ze,z),z},Wc:ri,Yc(f){Ze(f)}})}var Bn=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,Pf=(o,l,f)=>{if(o>>>=1,16<(l=yn((x(),se),o,l/2,f))-o&&Bn)return Bn.decode((x(),se).slice(o,l));for(f="";o<l;++o){var c=(x(),se)[o>>>0];f+=String.fromCharCode(c)}return f},qf=(o,l,f)=>{if(f??=2147483647,2>f)return 0;var c=l;f=(f-=2)<2*o.length?f/2:o.length;for(var b=0;b<f;++b){var T=o.charCodeAt(b);(x(),K)[l>>>1>>>0]=T,l+=2}return(x(),K)[l>>>1>>>0]=0,l-c},Wf=o=>2*o.length,Lf=(o,l,f)=>{var c="";o>>>=2;for(var b=0;!(b>=l/4);b++){var T=(x(),P)[o+b>>>0];if(!T&&!f)break;c+=String.fromCodePoint(T)}return c},Vf=(o,l,f)=>{if(l>>>=0,f??=2147483647,4>f)return 0;var c=l;f=c+f-4;for(var b=0;b<o.length;++b){var T=o.codePointAt(b);if(65535<T&&b++,(x(),A)[l>>>2>>>0]=T,(l+=4)+4>f)break}return(x(),A)[l>>>2>>>0]=0,l-c},Gf=o=>{for(var l=0,f=0;f<o.length;++f)65535<o.codePointAt(f)&&f++,l+=4;return l};function Hf(o,l,f){if(o>>>=0,l>>>=0,f=Ke(f>>>=0),l===2)var c=Pf,b=qf,T=Wf;else c=Lf,b=Vf,T=Gf;tt(o,{name:f,Qc:z=>{var B=(x(),P)[z>>>2>>>0];return B=c(z+4,B*l,!0),Ze(z),B},Xc:(z,B)=>{if(typeof B!="string")throw new Dt(`Cannot pass non-string to C++ string type ${f}`);var q=T(B),G=Ft(4+q+l);return(x(),P)[G>>>2>>>0]=q/l,b(B,G+4,q+l),z!==null&&z.push(Ze,G),G},Wc:ri,Yc(z){Ze(z)}})}function Ff(o,l){tt(o>>>=0,{Cd:!0,name:l=Ke(l>>>0),Qc:()=>{},Xc:()=>{}})}function jf(o){pi(o>>>0,!i,1,!r,131072,!1),ln()}var gr=o=>{if(!C)try{if(o(),!(0<st))try{a?xr()&&ci(y):Zr(y)}catch(l){l instanceof et||l=="unwind"||p(0,l)}}catch(l){l instanceof et||l=="unwind"||p(0,l)}},Kf=!Atomics.waitAsync||globalThis.navigator?.userAgent&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function ii(o){o>>>=0,Kf||(Atomics.waitAsync((x(),A),o>>>2,o).value.then(yr),o+=128,Atomics.store((x(),A),o>>>2,1))}var yr=()=>gr(()=>{var o=xr();o&&(ii(o),os())});function Qf(o,l){(o>>>=0)==l>>>0?setTimeout(yr):a?postMessage({ad:o,Uc:"checkMailbox"}):(o=_t[o])&&o.postMessage({Uc:"checkMailbox"})}var ai=[];function Zf(o,l,f,c,b){for(l>>>=0,b>>>=0,ai.length=0,f=b>>>3,c=b+c>>>3;f<c;){var T;T=(x(),F)[f++>>>0]?(x(),F)[f++>>>0]:(x(),Y)[f++>>>0],ai.push(T)}return(l?gi[l]:Wm[o])(...ai)}var Yf=()=>{st=0};function Xf(o){o>>>=0,a?postMessage({Uc:"cleanupThread",Qd:o}):un(_t[o])}function Jf(o){}var _r=o=>{try{o()}catch(l){Te(l)}};function em(o){var l=(...f)=>{wr.push(o);try{return o(...f)}finally{C||(wr.pop(),Qe&&dt===1&&wr.length===0&&(dt=0,st+=1,_r(Zs),typeof Fibers<"u"&&Fibers.ce()))}};return Dn.set(o,l),l}var dt=0,Qe=null,Nn=0,wr=[],ni=new Map,Mn=new Map,Dn=new Map,tm=0,si=null,rm=[],Un=o=>(function(l){if(!C){if(dt===0){var f=!1,c=!1;l((b=0)=>{if(!C&&(Nn=b,f=!0,c)){dt=2,_r(()=>Ys(Qe)),typeof MainLoop<"u"&&MainLoop.yd&&MainLoop.resume(),b=!1;try{var T=(function(){var q=(x(),A)[Qe+8>>>2>>>0];return q=Mn.get(q),q=Dn.get(q),--st,q()})()}catch(q){T=q,b=!0}var z=!1;if(!Qe){var B=si;B&&(si=null,(b?B.reject:B.resolve)(T),z=!0)}if(b&&!z)throw T}}),c=!0,f||(dt=1,Qe=(function(){var b=Ft(65548),T=b+12;if((x(),P)[b>>>2>>>0]=T,(x(),P)[b+4>>>2>>>0]=T+65536,T=wr[0],!ni.has(T)){var z=tm++;ni.set(T,z),Mn.set(z,T)}return T=ni.get(T),(x(),A)[b+8>>>2>>>0]=T,b})(),typeof MainLoop<"u"&&MainLoop.yd&&MainLoop.pause(),_r(()=>Qs(Qe)))}else dt===2?(dt=0,_r(Xs),Ze(Qe),Qe=null,rm.forEach(gr)):Te(`invalid state: ${dt}`);return Nn}})(l=>{o().then(l)});function im(o){return o>>>=0,Un(async()=>{var l=await Me(o);return qe(l)})}var oi=[],am=o=>{var l=oi.length;return oi.push(o),l},nm=(o,l)=>{for(var f=Array(o),c=0;c<o;++c){var b=c,T=(x(),P)[l+4*c>>>2>>>0],z=ei[T];if(z===void 0)throw o=`parameter ${c}`,T=ts(T),l=Ke(T),Ze(T),new Dt(`${o} has unknown type ${l}`);f[b]=z}return f},sm=(o,l,f)=>{var c=[];return o=o(c,f),c.length&&((x(),P)[l>>>2>>>0]=qe(c)),o},om={},br=o=>{var l=om[o];return l===void 0?Ke(o):l};function um(o,l,f){var[c,...b]=nm(o,l>>>0);l=c.Xc.bind(c);var T=b.map(q=>q.Wc.bind(q));o--;var z={toValue:Me};switch(o=T.map((q,G)=>{var ie=`argFromPtr${G}`;return z[ie]=q,`${ie}(args${G?"+"+8*G:""})`}),f){case 0:var B="toValue(handle)";break;case 2:B="new (toValue(handle))";break;case 3:B="";break;case 1:z.getStringOrSymbol=br,B="toValue(handle)[getStringOrSymbol(methodName)]"}return B+=`(${o})`,c.Cd||(z.toReturnWire=l,z.emval_returnValue=sm,B=`return emval_returnValue(toReturnWire, destructorsRef, ${B})`),B=`return function (handle, methodName, destructorsRef, args) {
  ${B}
  }`,f=new Function(Object.keys(z),B)(...Object.values(z)),B=`methodCaller<(${b.map(q=>q.name)}) => ${c.name}>`,am(Object.defineProperty(f,"name",{value:B}))}function lm(o,l){return l>>>=0,(o=Me(o>>>0))==Me(l)}function dm(o){return(o>>>=0)?(o=br(o),qe(globalThis[o])):qe(globalThis)}function pm(o){return o=br(o>>>0),qe(t[o])}function cm(o,l){return l>>>=0,o=Me(o>>>0),l=Me(l),qe(o[l])}function hm(o){9<(o>>>=0)&&(wt[o+1]+=1)}function Pn(o,l,f,c,b){return oi[o>>>0](l>>>0,f>>>0,c>>>0,b>>>0)}function fm(o,l,f,c,b){return Pn(o>>>0,l>>>0,f>>>0,c>>>0,b>>>0)}function mm(){return qe([])}function gm(o){o=Me(o>>>0);for(var l=Array(o.length),f=0;f<o.length;f++)l[f]=o[f];return qe(l)}function ym(o){return qe(br(o>>>0))}function _m(){return qe({})}function wm(o){for(var l=Me(o>>>=0);l.length;){var f=l.pop();l.pop()(f)}ti(o)}function bm(o,l,f){l>>>=0,f>>>=0,o=Me(o>>>0),l=Me(l),f=Me(f),o[l]=f}function $m(o,l){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),l>>>=0,o=new Date(1e3*o),(x(),A)[l>>>2>>>0]=o.getUTCSeconds(),(x(),A)[l+4>>>2>>>0]=o.getUTCMinutes(),(x(),A)[l+8>>>2>>>0]=o.getUTCHours(),(x(),A)[l+12>>>2>>>0]=o.getUTCDate(),(x(),A)[l+16>>>2>>>0]=o.getUTCMonth(),(x(),A)[l+20>>>2>>>0]=o.getUTCFullYear()-1900,(x(),A)[l+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(x(),A)[l+28>>>2>>>0]=o}var qn=o=>o%4==0&&(o%100!=0||o%400==0),Wn=[0,31,60,91,121,152,182,213,244,274,305,335],Ln=[0,31,59,90,120,151,181,212,243,273,304,334];function vm(o,l){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),l>>>=0,o=new Date(1e3*o),(x(),A)[l>>>2>>>0]=o.getSeconds(),(x(),A)[l+4>>>2>>>0]=o.getMinutes(),(x(),A)[l+8>>>2>>>0]=o.getHours(),(x(),A)[l+12>>>2>>>0]=o.getDate(),(x(),A)[l+16>>>2>>>0]=o.getMonth(),(x(),A)[l+20>>>2>>>0]=o.getFullYear()-1900,(x(),A)[l+24>>>2>>>0]=o.getDay();var f=(qn(o.getFullYear())?Wn:Ln)[o.getMonth()]+o.getDate()-1|0;(x(),A)[l+28>>>2>>>0]=f,(x(),A)[l+36>>>2>>>0]=-60*o.getTimezoneOffset(),f=new Date(o.getFullYear(),6,1).getTimezoneOffset();var c=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(f!=c&&o.getTimezoneOffset()==Math.min(c,f)),(x(),A)[l+32>>>2>>>0]=o}function xm(o){o>>>=0;var l=new Date((x(),A)[o+20>>>2>>>0]+1900,(x(),A)[o+16>>>2>>>0],(x(),A)[o+12>>>2>>>0],(x(),A)[o+8>>>2>>>0],(x(),A)[o+4>>>2>>>0],(x(),A)[o>>>2>>>0],0),f=(x(),A)[o+32>>>2>>>0],c=l.getTimezoneOffset(),b=new Date(l.getFullYear(),6,1).getTimezoneOffset(),T=new Date(l.getFullYear(),0,1).getTimezoneOffset(),z=Math.min(T,b);return 0>f?(x(),A)[o+32>>>2>>>0]=+(b!=T&&z==c):0<f!=(z==c)&&(b=Math.max(T,b),l.setTime(l.getTime()+6e4*((0<f?z:b)-c))),(x(),A)[o+24>>>2>>>0]=l.getDay(),f=(qn(l.getFullYear())?Wn:Ln)[l.getMonth()]+l.getDate()-1|0,(x(),A)[o+28>>>2>>>0]=f,(x(),A)[o>>>2>>>0]=l.getSeconds(),(x(),A)[o+4>>>2>>>0]=l.getMinutes(),(x(),A)[o+8>>>2>>>0]=l.getHours(),(x(),A)[o+12>>>2>>>0]=l.getDate(),(x(),A)[o+16>>>2>>>0]=l.getMonth(),(x(),A)[o+20>>>2>>>0]=l.getYear(),o=l.getTime(),BigInt(isNaN(o)?-1:o/1e3)}function Vn(o,l,f,c,b,T,z){return a?we(16,1,o,l,f,c,b,T,z):-52}function Gn(o,l,f,c,b,T){if(a)return we(17,1,o,l,f,c,b,T)}var Ht={},Sm=()=>performance.timeOrigin+performance.now();function Hn(o,l){if(a)return we(18,1,o,l);if(Ht[o]&&(clearTimeout(Ht[o].id),delete Ht[o]),!l)return 0;var f=setTimeout(()=>{delete Ht[o],gr(()=>ss(o,performance.timeOrigin+performance.now()))},l);return Ht[o]={id:f,be:l},0}function Tm(o,l,f,c){o>>>=0,l>>>=0,f>>>=0,c>>>=0;var b=new Date().getFullYear(),T=new Date(b,0,1).getTimezoneOffset();b=new Date(b,6,1).getTimezoneOffset();var z=Math.max(T,b);(x(),P)[o>>>2>>>0]=60*z,(x(),A)[l>>>2>>>0]=+(T!=b),o=(l=B=>{var q=Math.abs(B);return`UTC${0<=B?"-":"+"}${String(Math.floor(q/60)).padStart(2,"0")}${String(q%60).padStart(2,"0")}`})(T),l=l(b),b<T?(lt(o,f,17),lt(l,c,17)):(lt(o,c,17),lt(l,f,17))}var km=()=>Date.now(),Im=1;function Em(o,l,f){if(f>>>=0,!(0<=o&&3>=o))return 28;if(o===0)o=Date.now();else{if(!Im)return 52;o=performance.timeOrigin+performance.now()}return o=Math.round(1e6*o),(x(),F)[f>>>3>>>0]=BigInt(o),0}var ui=[],Fn=(o,l)=>{ui.length=0;for(var f;f=(x(),L)[o++>>>0];){var c=f!=105;l+=(c&=f!=112)&&l%8?4:0,ui.push(f==112?(x(),P)[l>>>2>>>0]:f==106?(x(),F)[l>>>3>>>0]:f==105?(x(),A)[l>>>2>>>0]:(x(),Y)[l>>>3>>>0]),l+=c?8:4}return ui};function zm(o,l,f){return o>>>=0,l=Fn(l>>>0,f>>>0),gi[o](...l)}function Cm(o,l,f){return o>>>=0,l=Fn(l>>>0,f>>>0),gi[o](...l)}var Am=()=>{};function Om(o,l){return E(Se(o>>>0,l>>>0))}var Rm=()=>{throw st+=1,"unwind"};function Bm(){return 4294901760}var Nm=()=>navigator.hardwareConcurrency,bt={},$r=o=>{var l;return(l=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+l[1]:(l=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+l[1]:0},jn=o=>{for(var l of o)(o=$r(l))&&(bt[o]=l)};function Mm(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),jn(o),bt.sd=$r(o[3]),bt.Md=o,bt.sd}function vr(o){if(!(o=bt[o>>>0]))return 0;var l;if(l=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=l[1];else if(l=/^\s+at (.*) \(.*\)$/.exec(o))o=l[1];else{if(!(l=/^(.+?)@/.exec(o)))return 0;o=l[1]}Ze(vr.td??0),l=mr(o)+1;var f=Ft(l);return f&&lt(o,f,l),vr.td=f,vr.td}function Dm(o){o>>>=0;var l=(x(),L).length;if(o<=l||4294901760<o)return!1;for(var f=1;4>=f;f*=2){var c=l*(1+.2/f);c=Math.min(c,o+100663296);e:{c=(Math.min(4294901760,65536*Math.ceil(Math.max(o,c)/65536))-ut.buffer.byteLength+65535)/65536|0;try{ut.grow(c),J();var b=1;break e}catch{}b=void 0}if(b)return!0}return!1}function Um(o,l,f){if(o>>>=0,l>>>=0,bt.sd==o)var c=bt.Md;else(c=Error().stack.toString().split(`
`))[0]=="Error"&&c.shift(),jn(c);for(var b=3;c[b]&&$r(c[b])!=o;)++b;for(o=0;o<f&&c[o+b];++o)(x(),A)[l+4*o>>>2>>>0]=$r(c[o+b]);return o}var li,di={},Kn=()=>{if(!li){var o,l={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(globalThis.navigator?.language??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in di)di[o]===void 0?delete l[o]:l[o]=di[o];var f=[];for(o in l)f.push(`${o}=${l[o]}`);li=f}return li};function Qn(o,l){if(a)return we(19,1,o,l);o>>>=0,l>>>=0;var f,c=0,b=0;for(f of Kn()){var T=l+c;(x(),P)[o+b>>>2>>>0]=T,c+=lt(f,T,1/0)+1,b+=4}return 0}function Zn(o,l){if(a)return we(20,1,o,l);o>>>=0,l>>>=0;var f=Kn();for(var c of((x(),P)[o>>>2>>>0]=f.length,o=0,f))o+=mr(c)+1;return(x(),P)[l>>>2>>>0]=o,0}function Yn(o){return a?we(21,1,o):52}function Xn(o,l,f,c){return a?we(22,1,o,l,f,c):52}function Jn(o,l,f,c){return a?we(23,1,o,l,f,c):70}var Pm=[null,[],[]];function es(o,l,f,c){if(a)return we(24,1,o,l,f,c);l>>>=0,f>>>=0,c>>>=0;for(var b=0,T=0;T<f;T++){var z=(x(),P)[l>>>2>>>0],B=(x(),P)[l+4>>>2>>>0];l+=8;for(var q=0;q<B;q++){var G=o,ie=(x(),L)[z+q>>>0],pe=Pm[G];ie===0||ie===10?((G===1?k:E)(_n(pe)),pe.length=0):pe.push(ie)}b+=B}return(x(),P)[c>>>2>>>0]=b,0}function qm(o){return o>>>0}a||(function(){for(var o=t.numThreads-1;o--;)pn();be.push(async()=>{var l=(async function(){if(!a)return Promise.all(ot.map(dn))})();Ae++,await l,--Ae==0&&yt&&(l=yt,yt=null,l())})})(),a||(ut=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),J()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>ne(),t.stackRestore=o=>ae(o),t.stackAlloc=o=>hi(o),t.setValue=function(o,l,f="i8"){switch(f.endsWith("*")&&(f="*"),f){case"i1":case"i8":(x(),Z)[o>>>0]=l;break;case"i16":(x(),K)[o>>>1>>>0]=l;break;case"i32":(x(),A)[o>>>2>>>0]=l;break;case"i64":(x(),F)[o>>>3>>>0]=BigInt(l);break;case"float":(x(),ee)[o>>>2>>>0]=l;break;case"double":(x(),Y)[o>>>3>>>0]=l;break;case"*":(x(),P)[o>>>2>>>0]=l;break;default:Te(`invalid type for setValue: ${f}`)}},t.getValue=function(o,l="i8"){switch(l.endsWith("*")&&(l="*"),l){case"i1":case"i8":return(x(),Z)[o>>>0];case"i16":return(x(),K)[o>>>1>>>0];case"i32":return(x(),A)[o>>>2>>>0];case"i64":return(x(),F)[o>>>3>>>0];case"float":return(x(),ee)[o>>>2>>>0];case"double":return(x(),Y)[o>>>3>>>0];case"*":return(x(),P)[o>>>2>>>0];default:Te(`invalid type for getValue: ${l}`)}},t.UTF8ToString=Se,t.stringToUTF8=lt,t.lengthBytesUTF8=mr;var ts,rs,xr,Ze,Ft,pi,is,as,ns,ci,ss,os,oe,jt,us,ae,hi,ne,ls,fi,ds,ps,cs,mi,hs,fs,ms,gs,ys,_s,ws,bs,$s,vs,xs,Ss,Ts,ks,Is,Es,zs,Cs,As,Os,Rs,Bs,Ns,Ms,Ds,Us,Ps,qs,Ws,Ls,Vs,Gs,Hs,Fs,js,Ks,Qs,Zs,Ys,Xs,rt,Wm=[Qr,sn,fn,wn,bn,$n,vn,xn,Sn,Tn,kn,In,En,zn,Cn,An,Vn,Gn,Hn,Qn,Zn,Yn,Xn,Jn,es],gi={929356:(o,l,f,c,b)=>{if(t===void 0||!t.Zc)return 1;if((o=Se(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.Zc.get(o)))return 2;if(l=Number(l>>>0),f=Number(f>>>0),c=Number(c>>>0),l+f>o.byteLength)return 3;try{let T=o.subarray(l,l+f);switch(b){case 0:(x(),L).set(T,c>>>0);break;case 1:t.Xd?t.Xd(c,T):t.Ld(c,T);break;default:return 4}return 0}catch{return 4}},930180:(o,l,f)=>{t.xd(o,(x(),L).subarray(l>>>0,l+f>>>0))},930244:()=>t.Zd(),930286:o=>{t.vd(o)},930323:()=>{t.Ed()},930354:()=>{t.Fd()},930383:()=>{t.Jd()},930408:o=>t.Dd(o),930441:o=>t.Hd(o),930473:(o,l,f)=>{t.jd(Number(o),Number(l),Number(f),!0)},930536:(o,l,f)=>{t.jd(Number(o),Number(l),Number(f))},930593:()=>typeof wasmOffsetConverter<"u",930650:o=>{t.ac("Abs",o,void 0)},930701:o=>{t.ac("Neg",o,void 0)},930752:o=>{t.ac("Floor",o,void 0)},930805:o=>{t.ac("Ceil",o,void 0)},930857:o=>{t.ac("Reciprocal",o,void 0)},930915:o=>{t.ac("Sqrt",o,void 0)},930967:o=>{t.ac("Exp",o,void 0)},931018:o=>{t.ac("Erf",o,void 0)},931069:o=>{t.ac("Sigmoid",o,void 0)},931124:(o,l,f)=>{t.ac("HardSigmoid",o,{alpha:l,beta:f})},931203:o=>{t.ac("Log",o,void 0)},931254:o=>{t.ac("Sin",o,void 0)},931305:o=>{t.ac("Cos",o,void 0)},931356:o=>{t.ac("Tan",o,void 0)},931407:o=>{t.ac("Asin",o,void 0)},931459:o=>{t.ac("Acos",o,void 0)},931511:o=>{t.ac("Atan",o,void 0)},931563:o=>{t.ac("Sinh",o,void 0)},931615:o=>{t.ac("Cosh",o,void 0)},931667:o=>{t.ac("Asinh",o,void 0)},931720:o=>{t.ac("Acosh",o,void 0)},931773:o=>{t.ac("Atanh",o,void 0)},931826:o=>{t.ac("Tanh",o,void 0)},931878:o=>{t.ac("Not",o,void 0)},931929:(o,l,f)=>{t.ac("Clip",o,{min:l,max:f})},931998:o=>{t.ac("Clip",o,void 0)},932050:(o,l)=>{t.ac("Elu",o,{alpha:l})},932108:o=>{t.ac("Gelu",o,void 0)},932160:o=>{t.ac("Relu",o,void 0)},932212:(o,l)=>{t.ac("LeakyRelu",o,{alpha:l})},932276:(o,l)=>{t.ac("ThresholdedRelu",o,{alpha:l})},932346:(o,l)=>{t.ac("Cast",o,{to:l})},932404:o=>{t.ac("Add",o,void 0)},932455:o=>{t.ac("Sub",o,void 0)},932506:o=>{t.ac("Mul",o,void 0)},932557:o=>{t.ac("Div",o,void 0)},932608:o=>{t.ac("Pow",o,void 0)},932659:o=>{t.ac("Equal",o,void 0)},932712:o=>{t.ac("Greater",o,void 0)},932767:o=>{t.ac("GreaterOrEqual",o,void 0)},932829:o=>{t.ac("Less",o,void 0)},932881:o=>{t.ac("LessOrEqual",o,void 0)},932940:(o,l,f,c,b)=>{t.ac("ReduceMean",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},933115:(o,l,f,c,b)=>{t.ac("ReduceMax",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},933289:(o,l,f,c,b)=>{t.ac("ReduceMin",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},933463:(o,l,f,c,b)=>{t.ac("ReduceProd",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},933638:(o,l,f,c,b)=>{t.ac("ReduceSum",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},933812:(o,l,f,c,b)=>{t.ac("ReduceL1",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},933985:(o,l,f,c,b)=>{t.ac("ReduceL2",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},934158:(o,l,f,c,b)=>{t.ac("ReduceLogSum",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},934335:(o,l,f,c,b)=>{t.ac("ReduceSumSquare",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},934515:(o,l,f,c,b)=>{t.ac("ReduceLogSumExp",o,{keepDims:!!l,noopWithEmptyAxes:!!f,axes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},934695:o=>{t.ac("Where",o,void 0)},934748:(o,l,f)=>{t.ac("Transpose",o,{perm:l?Array.from((x(),A).subarray(Number(l)>>>0,Number(f)>>>0)):[]})},934872:(o,l,f,c)=>{t.ac("DepthToSpace",o,{blocksize:l,mode:Se(f),format:c?"NHWC":"NCHW"})},935005:(o,l,f,c)=>{t.ac("DepthToSpace",o,{blocksize:l,mode:Se(f),format:c?"NHWC":"NCHW"})},935138:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye,pt)=>{t.ac("ConvTranspose",o,{format:q?"NHWC":"NCHW",autoPad:l,dilations:[f],group:c,kernelShape:[b],pads:[T,z],strides:[B],wIsConst:()=>!!(x(),Z)[G>>>0],outputPadding:ie?Array.from((x(),A).subarray(Number(ie)>>>0,Number(pe)>>>0)):[],outputShape:me?Array.from((x(),A).subarray(Number(me)>>>0,Number(ye)>>>0)):[],activation:Se(pt)})},935571:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye)=>{t.ac("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:l,dilations:Array.from((x(),A).subarray(Number(f)>>>0,2+(Number(f)>>>0)>>>0)),group:c,kernelShape:Array.from((x(),A).subarray(Number(b)>>>0,2+(Number(b)>>>0)>>>0)),pads:Array.from((x(),A).subarray(Number(T)>>>0,4+(Number(T)>>>0)>>>0)),strides:Array.from((x(),A).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(x(),Z)[q>>>0],outputPadding:G?Array.from((x(),A).subarray(Number(G)>>>0,Number(ie)>>>0)):[],outputShape:pe?Array.from((x(),A).subarray(Number(pe)>>>0,Number(me)>>>0)):[],activation:Se(ye)})},936232:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye,pt)=>{t.ac("ConvTranspose",o,{format:q?"NHWC":"NCHW",autoPad:l,dilations:[f],group:c,kernelShape:[b],pads:[T,z],strides:[B],wIsConst:()=>!!(x(),Z)[G>>>0],outputPadding:ie?Array.from((x(),A).subarray(Number(ie)>>>0,Number(pe)>>>0)):[],outputShape:me?Array.from((x(),A).subarray(Number(me)>>>0,Number(ye)>>>0)):[],activation:Se(pt)})},936665:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye)=>{t.ac("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:l,dilations:Array.from((x(),A).subarray(Number(f)>>>0,2+(Number(f)>>>0)>>>0)),group:c,kernelShape:Array.from((x(),A).subarray(Number(b)>>>0,2+(Number(b)>>>0)>>>0)),pads:Array.from((x(),A).subarray(Number(T)>>>0,4+(Number(T)>>>0)>>>0)),strides:Array.from((x(),A).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(x(),Z)[q>>>0],outputPadding:G?Array.from((x(),A).subarray(Number(G)>>>0,Number(ie)>>>0)):[],outputShape:pe?Array.from((x(),A).subarray(Number(pe)>>>0,Number(me)>>>0)):[],activation:Se(ye)})},937326:(o,l)=>{t.ac("GlobalAveragePool",o,{format:l?"NHWC":"NCHW"})},937417:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye)=>{t.ac("AveragePool",o,{format:ye?"NHWC":"NCHW",auto_pad:l,ceil_mode:f,count_include_pad:c,storage_order:b,dilations:T?Array.from((x(),A).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((x(),A).subarray(Number(B)>>>0,Number(q)>>>0)):[],pads:G?Array.from((x(),A).subarray(Number(G)>>>0,Number(ie)>>>0)):[],strides:pe?Array.from((x(),A).subarray(Number(pe)>>>0,Number(me)>>>0)):[]})},937896:(o,l)=>{t.ac("GlobalAveragePool",o,{format:l?"NHWC":"NCHW"})},937987:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye)=>{t.ac("AveragePool",o,{format:ye?"NHWC":"NCHW",auto_pad:l,ceil_mode:f,count_include_pad:c,storage_order:b,dilations:T?Array.from((x(),A).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((x(),A).subarray(Number(B)>>>0,Number(q)>>>0)):[],pads:G?Array.from((x(),A).subarray(Number(G)>>>0,Number(ie)>>>0)):[],strides:pe?Array.from((x(),A).subarray(Number(pe)>>>0,Number(me)>>>0)):[]})},938466:(o,l)=>{t.ac("GlobalMaxPool",o,{format:l?"NHWC":"NCHW"})},938553:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye)=>{t.ac("MaxPool",o,{format:ye?"NHWC":"NCHW",auto_pad:l,ceil_mode:f,count_include_pad:c,storage_order:b,dilations:T?Array.from((x(),A).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((x(),A).subarray(Number(B)>>>0,Number(q)>>>0)):[],pads:G?Array.from((x(),A).subarray(Number(G)>>>0,Number(ie)>>>0)):[],strides:pe?Array.from((x(),A).subarray(Number(pe)>>>0,Number(me)>>>0)):[]})},939028:(o,l)=>{t.ac("GlobalMaxPool",o,{format:l?"NHWC":"NCHW"})},939115:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye)=>{t.ac("MaxPool",o,{format:ye?"NHWC":"NCHW",auto_pad:l,ceil_mode:f,count_include_pad:c,storage_order:b,dilations:T?Array.from((x(),A).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((x(),A).subarray(Number(B)>>>0,Number(q)>>>0)):[],pads:G?Array.from((x(),A).subarray(Number(G)>>>0,Number(ie)>>>0)):[],strides:pe?Array.from((x(),A).subarray(Number(pe)>>>0,Number(me)>>>0)):[]})},939590:(o,l,f,c,b)=>{t.ac("Gemm",o,{alpha:l,beta:f,transA:c,transB:b})},939694:o=>{t.ac("MatMul",o,void 0)},939748:(o,l,f,c)=>{t.ac("ArgMax",o,{keepDims:!!l,selectLastIndex:!!f,axis:c})},939856:(o,l,f,c)=>{t.ac("ArgMin",o,{keepDims:!!l,selectLastIndex:!!f,axis:c})},939964:(o,l)=>{t.ac("Softmax",o,{axis:l})},940027:(o,l)=>{t.ac("Concat",o,{axis:l})},940087:(o,l,f,c,b)=>{t.ac("Split",o,{axis:l,numOutputs:f,splitSizes:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},940243:o=>{t.ac("Expand",o,void 0)},940297:(o,l)=>{t.ac("Gather",o,{axis:Number(l)})},940368:(o,l)=>{t.ac("GatherElements",o,{axis:Number(l)})},940447:(o,l)=>{t.ac("GatherND",o,{batch_dims:Number(l)})},940526:(o,l,f,c,b,T,z,B,q,G,ie)=>{t.ac("Resize",o,{antialias:l,axes:f?Array.from((x(),A).subarray(Number(f)>>>0,Number(c)>>>0)):[],coordinateTransformMode:Se(b),cubicCoeffA:T,excludeOutside:z,extrapolationValue:B,keepAspectRatioPolicy:Se(q),mode:Se(G),nearestMode:Se(ie)})},940888:(o,l,f,c,b,T,z)=>{t.ac("Slice",o,{starts:l?Array.from((x(),A).subarray(Number(l)>>>0,Number(f)>>>0)):[],ends:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[],axes:T?Array.from((x(),A).subarray(Number(T)>>>0,Number(z)>>>0)):[]})},941152:o=>{t.ac("Tile",o,void 0)},941204:(o,l,f)=>{t.ac("InstanceNormalization",o,{epsilon:l,format:f?"NHWC":"NCHW"})},941318:(o,l,f)=>{t.ac("InstanceNormalization",o,{epsilon:l,format:f?"NHWC":"NCHW"})},941432:o=>{t.ac("Range",o,void 0)},941485:(o,l)=>{t.ac("Einsum",o,{equation:Se(l)})},941566:(o,l,f,c,b)=>{t.ac("Pad",o,{mode:l,value:f,pads:c?Array.from((x(),A).subarray(Number(c)>>>0,Number(b)>>>0)):[]})},941709:(o,l,f,c,b,T)=>{t.ac("BatchNormalization",o,{epsilon:l,momentum:f,spatial:!!b,trainingMode:!!c,format:T?"NHWC":"NCHW"})},941878:(o,l,f,c,b,T)=>{t.ac("BatchNormalization",o,{epsilon:l,momentum:f,spatial:!!b,trainingMode:!!c,format:T?"NHWC":"NCHW"})},942047:(o,l,f)=>{t.ac("CumSum",o,{exclusive:Number(l),reverse:Number(f)})},942144:(o,l,f)=>{t.ac("DequantizeLinear",o,{axis:l,blockSize:f})},942234:(o,l,f,c,b)=>{t.ac("GridSample",o,{align_corners:l,mode:Se(f),padding_mode:Se(c),format:b?"NHWC":"NCHW"})},942404:(o,l,f,c,b)=>{t.ac("GridSample",o,{align_corners:l,mode:Se(f),padding_mode:Se(c),format:b?"NHWC":"NCHW"})},942574:(o,l)=>{t.ac("ScatterND",o,{reduction:Se(l)})},942659:(o,l,f,c,b,T,z,B,q)=>{t.ac("Attention",o,{numHeads:l,isUnidirectional:f,maskFilterValue:c,scale:b,doRotary:T,qkvHiddenSizes:z?Array.from((x(),A).subarray(Number(B)>>>0,Number(B)+z>>>0)):[],pastPresentShareBuffer:!!q})},942931:o=>{t.ac("BiasAdd",o,void 0)},942986:o=>{t.ac("BiasSplitGelu",o,void 0)},943047:o=>{t.ac("FastGelu",o,void 0)},943103:(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye,pt,yi)=>{t.ac("Conv",o,{format:pe?"NHWC":"NCHW",auto_pad:l,dilations:f?Array.from((x(),A).subarray(Number(f)>>>0,Number(c)>>>0)):[],group:b,kernel_shape:T?Array.from((x(),A).subarray(Number(T)>>>0,Number(z)>>>0)):[],pads:B?Array.from((x(),A).subarray(Number(B)>>>0,Number(q)>>>0)):[],strides:G?Array.from((x(),A).subarray(Number(G)>>>0,Number(ie)>>>0)):[],w_is_const:()=>!!(x(),Z)[Number(me)>>>0],activation:Se(ye),activation_params:pt?Array.from((x(),ee).subarray(Number(pt)>>>0,Number(yi)>>>0)):[]})},943687:o=>{t.ac("Gelu",o,void 0)},943739:(o,l,f,c,b,T,z,B,q)=>{t.ac("GroupQueryAttention",o,{numHeads:l,kvNumHeads:f,scale:c,softcap:b,doRotary:T,rotaryInterleaved:z,smoothSoftmax:B,localWindowSize:q})},943956:(o,l,f,c)=>{t.ac("LayerNormalization",o,{axis:l,epsilon:f,simplified:!!c})},944067:(o,l,f,c)=>{t.ac("LayerNormalization",o,{axis:l,epsilon:f,simplified:!!c})},944178:(o,l,f,c,b,T)=>{t.ac("MatMulNBits",o,{k:l,n:f,accuracyLevel:c,bits:b,blockSize:T})},944305:(o,l,f,c,b,T)=>{t.ac("MultiHeadAttention",o,{numHeads:l,isUnidirectional:f,maskFilterValue:c,scale:b,doRotary:T})},944464:(o,l)=>{t.ac("QuickGelu",o,{alpha:l})},944528:(o,l,f,c,b)=>{t.ac("RotaryEmbedding",o,{interleaved:!!l,numHeads:f,rotaryEmbeddingDim:c,scale:b})},944667:(o,l,f)=>{t.ac("SkipLayerNormalization",o,{epsilon:l,simplified:!!f})},944769:(o,l,f)=>{t.ac("SkipLayerNormalization",o,{epsilon:l,simplified:!!f})},944871:(o,l,f,c)=>{t.ac("GatherBlockQuantized",o,{gatherAxis:l,quantizeAxis:f,blockSize:c})},944992:o=>{t.Id(o)},945026:(o,l)=>t.Kd(Number(o),Number(l),t.$c.Nd,t.$c.errors)};function Lm(o,l,f){return Un(async()=>{await t.Gd(Number(o),Number(l),Number(f))})}function Vm(){return typeof wasmOffsetConverter<"u"}function Gm(o,l,f,c){var b=ne();try{return bs(o,l,f,c)}catch(T){if(ae(b),T!==T+0)throw T;oe(1,0)}}function Hm(o,l,f){var c=ne();try{return gs(o,l,f)}catch(b){if(ae(c),b!==b+0)throw b;oe(1,0)}}function Fm(o,l,f){var c=ne();try{cs(o,l,f)}catch(b){if(ae(c),b!==b+0)throw b;oe(1,0)}}function jm(o,l){var f=ne();try{return mi(o,l)}catch(c){if(ae(f),c!==c+0)throw c;oe(1,0)}}function Km(o){var l=ne();try{hs(o)}catch(f){if(ae(l),f!==f+0)throw f;oe(1,0)}}function Qm(o,l,f,c,b,T,z){var B=ne();try{return _s(o,l,f,c,b,T,z)}catch(q){if(ae(B),q!==q+0)throw q;oe(1,0)}}function Zm(o,l){var f=ne();try{$s(o,l)}catch(c){if(ae(f),c!==c+0)throw c;oe(1,0)}}function Ym(o,l,f,c,b,T){var z=ne();try{fs(o,l,f,c,b,T)}catch(B){if(ae(z),B!==B+0)throw B;oe(1,0)}}function Xm(o,l,f,c){var b=ne();try{ws(o,l,f,c)}catch(T){if(ae(b),T!==T+0)throw T;oe(1,0)}}function Jm(o,l,f,c,b){var T=ne();try{ms(o,l,f,c,b)}catch(z){if(ae(T),z!==z+0)throw z;oe(1,0)}}function eg(o,l,f,c,b,T,z){var B=ne();try{xs(o,l,f,c,b,T,z)}catch(q){if(ae(B),q!==q+0)throw q;oe(1,0)}}function tg(o,l,f,c,b,T,z){var B=ne();try{Ss(o,l,f,c,b,T,z)}catch(q){if(ae(B),q!==q+0)throw q;oe(1,0)}}function rg(o,l,f,c,b,T,z,B){var q=ne();try{Es(o,l,f,c,b,T,z,B)}catch(G){if(ae(q),G!==G+0)throw G;oe(1,0)}}function ig(o,l,f,c,b){var T=ne();try{return vs(o,l,f,c,b)}catch(z){if(ae(T),z!==z+0)throw z;oe(1,0)}}function ag(o,l,f,c,b,T,z,B){var q=ne();try{zs(o,l,f,c,b,T,z,B)}catch(G){if(ae(q),G!==G+0)throw G;oe(1,0)}}function ng(o,l,f,c,b,T,z,B,q,G,ie,pe){var me=ne();try{Ts(o,l,f,c,b,T,z,B,q,G,ie,pe)}catch(ye){if(ae(me),ye!==ye+0)throw ye;oe(1,0)}}function sg(o,l,f,c,b,T){var z=ne();try{return ks(o,l,f,c,b,T)}catch(B){if(ae(z),B!==B+0)throw B;oe(1,0)}}function og(o,l,f){var c=ne();try{return Cs(o,l,f)}catch(b){if(ae(c),b!==b+0)throw b;return oe(1,0),0n}}function ug(o,l,f,c,b,T,z,B,q){var G=ne();try{ys(o,l,f,c,b,T,z,B,q)}catch(ie){if(ae(G),ie!==ie+0)throw ie;oe(1,0)}}function lg(o){var l=ne();try{return As(o)}catch(f){if(ae(l),f!==f+0)throw f;oe(1,0)}}function dg(o,l,f){var c=ne();try{return Os(o,l,f)}catch(b){if(ae(c),b!==b+0)throw b;oe(1,0)}}function pg(o,l){var f=ne();try{return Ks(o,l)}catch(c){if(ae(f),c!==c+0)throw c;return oe(1,0),0n}}function cg(o,l,f,c,b){var T=ne();try{Rs(o,l,f,c,b)}catch(z){if(ae(T),z!==z+0)throw z;oe(1,0)}}function hg(o){var l=ne();try{return Bs(o)}catch(f){if(ae(l),f!==f+0)throw f;return oe(1,0),0n}}function fg(o,l,f,c,b,T){var z=ne();try{return qs(o,l,f,c,b,T)}catch(B){if(ae(z),B!==B+0)throw B;oe(1,0)}}function mg(o,l,f,c,b,T){var z=ne();try{return Ws(o,l,f,c,b,T)}catch(B){if(ae(z),B!==B+0)throw B;oe(1,0)}}function gg(o,l,f,c,b,T,z,B){var q=ne();try{return Is(o,l,f,c,b,T,z,B)}catch(G){if(ae(q),G!==G+0)throw G;oe(1,0)}}function yg(o,l,f,c,b){var T=ne();try{return Ls(o,l,f,c,b)}catch(z){if(ae(T),z!==z+0)throw z;return oe(1,0),0n}}function _g(o,l,f,c){var b=ne();try{return Vs(o,l,f,c)}catch(T){if(ae(b),T!==T+0)throw T;oe(1,0)}}function wg(o,l,f,c){var b=ne();try{return Gs(o,l,f,c)}catch(T){if(ae(b),T!==T+0)throw T;oe(1,0)}}function bg(o,l,f,c,b,T,z,B,q,G,ie,pe){var me=ne();try{return Hs(o,l,f,c,b,T,z,B,q,G,ie,pe)}catch(ye){if(ae(me),ye!==ye+0)throw ye;oe(1,0)}}function $g(o,l,f,c,b,T,z,B,q,G,ie){var pe=ne();try{Us(o,l,f,c,b,T,z,B,q,G,ie)}catch(me){if(ae(pe),me!==me+0)throw me;oe(1,0)}}function vg(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye,pt,yi){var Eg=ne();try{Ps(o,l,f,c,b,T,z,B,q,G,ie,pe,me,ye,pt,yi)}catch(_i){if(ae(Eg),_i!==_i+0)throw _i;oe(1,0)}}function xg(o,l,f,c){var b=ne();try{return Fs(o,l,f,c)}catch(T){if(ae(b),T!==T+0)throw T;oe(1,0)}}function Sg(o,l,f,c,b){var T=ne();try{return js(o,l,f,c,b)}catch(z){if(ae(T),z!==z+0)throw z;oe(1,0)}}function Tg(o,l,f){var c=ne();try{return Ns(o,l,f)}catch(b){if(ae(c),b!==b+0)throw b;oe(1,0)}}function kg(o,l,f){var c=ne();try{return Ms(o,l,f)}catch(b){if(ae(c),b!==b+0)throw b;oe(1,0)}}function Ig(o,l,f,c){var b=ne();try{Ds(o,l,f,c)}catch(T){if(ae(b),T!==T+0)throw T;oe(1,0)}}function Sr(){if(0<Ae)yt=Sr;else if(a)$?.(t),de();else{for(var o=be;0<o.length;)o.shift()(t);0<Ae?yt=Sr:(t.calledRun=!0,C||(de(),$?.(t)))}}return a||(rt=await Pe(),Sr()),t.PTR_SIZE=4,V?t:new Promise((o,l)=>{$=o,S=l})}var rp,to,Kg=U(()=>{"use strict";rp=eo,to=globalThis.self?.name?.startsWith("em-pthread"),to&&eo()}),Si,ma,ro,Re,ip,kr,io,ao,Ti,no,ki,ap,Ii,np,Ba=U(()=>{"use strict";Ra(),Si=typeof location>"u"?void 0:location.origin,ma=import.meta.url>"file:"&&import.meta.url<"file;",ro=()=>{if(ma){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,Si).href}return import.meta.url},Re=ro(),ip=()=>{if(Re&&!Re.startsWith("blob:"))return Re.substring(0,Re.lastIndexOf("/")+1)},kr=(e,t)=>{try{let r=t??Re;return(r?new URL(e,r):new URL(e)).origin===Si}catch{return!1}},io=(e,t)=>{let r=t??Re;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},ao=(e,t)=>`${t??"./"}${e}`,Ti=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},no=async e=>(await import(e)).default,ki=(jg(),dr(Jd)).default,ap=async()=>{if(!Re)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(kr(Re))return[void 0,ki()];let e=await Ti(Re);return[e,ki(e)]},Ii=(Kg(),dr(tp)).default,np=async(e,t,r,i)=>{let a=Ii&&!(e||t);if(a)if(Re)a=kr(Re)||i&&!r;else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,Ii];{let n="ort-wasm-simd-threaded.jsep.mjs",s=e??io(n,t),u=r&&s&&!kr(s,t),d=u?await Ti(s):s??ao(n,t);return[u?d:void 0,await no(d)]}}}),Ei,Ir,Qt,zi,so,oo,uo,Na,ge,Bt=U(()=>{"use strict";Ba(),Ir=!1,Qt=!1,zi=!1,so=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},oo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},uo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Na=async e=>{if(Ir)return Promise.resolve();if(Qt)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(zi)throw new Error("previous call to 'initializeWebAssembly()' failed.");Qt=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!uo())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!oo())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=so();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,n=typeof a=="string"?a:void 0,s=a?.mjs,u=s?.href??s,d=a?.wasm,p=d?.href??d,m=e.wasmBinary,[h,g]=await np(u,n,r>1,!!m||!!p),_=!1,y=[];if(t>0&&y.push(new Promise($=>{setTimeout(()=>{_=!0,$()},t)})),y.push(new Promise(($,S)=>{let v={numThreads:r};if(m)v.wasmBinary=m,v.locateFile=w=>w;else if(p||n)v.locateFile=w=>p??n+w;else if(u&&u.indexOf("blob:")!==0)v.locateFile=w=>new URL(w,u).href;else if(h){let w=ip();w&&(v.locateFile=I=>w+I)}g(v).then(w=>{Qt=!1,Ir=!0,Ei=w,$(),h&&URL.revokeObjectURL(h)},w=>{Qt=!1,zi=!0,S(w)})})),await Promise.race(y),_)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},ge=()=>{if(Ir&&Ei)return Ei;throw new Error("WebAssembly is not initialized yet.")}}),Fe,Wr,fe,Ma=U(()=>{"use strict";Bt(),Fe=(e,t)=>{let r=ge(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},Wr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,n])=>{let s=t?t+a:a;if(typeof n=="object")Wr(n,s+".",r,i);else if(typeof n=="string"||typeof n=="number")i(s,n.toString());else if(typeof n=="boolean")i(s,n?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof n}`)})},fe=e=>{let t=ge(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let n=Number(t.getValue(a,i===4?"i32":"i64")),s=t.getValue(a+i,"*"),u=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${n}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),sp,Qg=U(()=>{"use strict";Bt(),Ma(),sp=e=>{let t=ge(),r=0,i=[],a=e||{};try{if(e?.logSeverityLevel===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(a.terminate=!1);let n=0;return e?.tag!==void 0&&(n=Fe(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,n),r===0&&fe("Can't create run options."),e?.extra!==void 0&&Wr(e.extra,"",new WeakSet,(s,u)=>{let d=Fe(s,i),p=Fe(u,i);t._OrtAddRunConfigEntry(r,d,p)!==0&&fe(`Can't set a run config entry: ${s} - ${u}.`)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(s=>t._free(s)),n}}}),lo,po,co,Zt,ho,op,Zg=U(()=>{"use strict";Bt(),Ma(),lo=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},po=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},co=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},Zt=(e,t,r,i)=>{let a=Fe(t,i),n=Fe(r,i);ge()._OrtAddSessionConfigEntry(e,a,n)!==0&&fe(`Can't set a session config entry: ${t} - ${r}.`)},ho=async(e,t,r)=>{let i=t.executionProviders;for(let a of i){let n=typeof a=="string"?a:a.name,s=[];switch(n){case"webnn":if(n="WEBNN",typeof a!="string"){let h=a?.deviceType;h&&Zt(e,"deviceType",h,r)}break;case"webgpu":if(n="JS",typeof a!="string"){let h=a;if(h?.preferredLayout){if(h.preferredLayout!=="NCHW"&&h.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${h.preferredLayout}`);Zt(e,"preferredLayout",h.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${n}`)}let u=Fe(n,r),d=s.length,p=0,m=0;if(d>0){p=ge()._malloc(d*ge().PTR_SIZE),r.push(p),m=ge()._malloc(d*ge().PTR_SIZE),r.push(m);for(let h=0;h<d;h++)ge().setValue(p+h*ge().PTR_SIZE,s[h][0],"*"),ge().setValue(m+h*ge().PTR_SIZE,s[h][1],"*")}await ge()._OrtAppendExecutionProvider(e,u,p,m,d)!==0&&fe(`Can't append execution provider: ${n}.`)}},op=async e=>{let t=ge(),r=0,i=[],a=e||{};co(a);try{let n=lo(a.graphOptimizationLevel??"all"),s=po(a.executionMode??"sequential"),u=typeof a.logId=="string"?Fe(a.logId,i):0,d=a.logSeverityLevel??2;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log severity level is not valid: ${d}`);let p=a.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw new Error(`log verbosity level is not valid: ${p}`);let m=typeof a.optimizedModelFilePath=="string"?Fe(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(n,!!a.enableCpuMemArena,!!a.enableMemPattern,s,!!a.enableProfiling,0,u,d,p,m),r===0&&fe("Can't create session options."),a.executionProviders&&await ho(r,a,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);Zt(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[h,g]of Object.entries(a.freeDimensionOverrides)){if(typeof h!="string")throw new Error(`free dimension override name must be a string: ${h}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let _=Fe(h,i);t._OrtAddFreeDimensionOverride(r,_,g)!==0&&fe(`Can't set a free dimension override: ${h} - ${g}.`)}return a.extra!==void 0&&Wr(a.extra,"",new WeakSet,(h,g)=>{Zt(r,h,g,i)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&fe("Can't release session options."),i.forEach(s=>t._free(s)),n}}}),It,at,Et,Kr,Lr,Da,Ua,ga,X=U(()=>{"use strict";It=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},at=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},Et=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,n)=>a*n,1);return r>0?Math.ceil(i*r):void 0},Kr=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Lr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Da=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ua=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",ga=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Pa,up=U(()=>{"use strict";Ra(),Pa=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),n;try{n=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let d=Math.ceil(i/65536);n=new WebAssembly.Memory({initial:d,maximum:d}).buffer}else throw u}let s=0;for(;;){let{done:u,value:d}=await a.read();if(u)break;let p=d.byteLength;new Uint8Array(n,s,p).set(d),s+=p}return new Uint8Array(n,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),fo,mo,go,yo,qa,_o,ue,nt=U(()=>{"use strict";X(),fo=["V","I","W","E","F"],mo=(e,t)=>{console.log(`[${fo[e]},${new Date().toISOString()}]${t}`)},qa=(e,t)=>{go=e,yo=t},_o=(e,t)=>{let r=Lr(e),i=Lr(go);r>=i&&mo(r,typeof t=="function"?t():t)},ue=(...e)=>{yo&&_o(...e)}}),wo,Wt,R,Vr,lp,dp,pp,te=U(()=>{"use strict";wo=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Wt=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let n=Math.max(e.length,t.length),s=new Array(n);if(r){if(i<2||a<2)return;let u=wo.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(u===void 0)return;[s[n-2],s[n-1]]=u}for(let u=r?3:1;u<=n;u++){let d=i-u<0?1:e[i-u],p=a-u<0?1:t[a-u];if(d!==p&&d>1&&p>1)return;let m=Math.max(d,p);if(d&&p)s[n-u]=Math.max(d,p);else{if(m>1)return;s[n-u]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},R=class Ur{static size(t){return Ur.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),n=i-1;for(;n>=0;){if(t[n]%r===0){a[n]=t[n]/r;break}if(r%t[n]!==0)throw new Error("cannot convert shape");a[n]=1,r/=t[n],n--}for(n--;n>=0;n--)a[n]=t[n];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Ur.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Ur.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let n=r;n<i;n++){if(t[n]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[n])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,n)=>a+r[n]+r[n+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Vr=class sr{static adjustPoolAttributes(t,r,i,a,n,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length;u++)if(u<n.length){if(n[u]<0)throw new Error("dilations should be greater than or equal to 1")}else n.push(1);for(let u=0;u<i.length*2;u++)if(u<s.length){if(s[u]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[u]>=i[u]||s[u+i.length]>=i[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,n,s,u){if(u){if(n.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let d=0;d<t.length-2;d++)sr.adjustPadAndReturnShape(t[d+(s?1:2)],r[d],i[d],a[d],n,d,d+t.length-2,u)}}static computePoolOutputShape(t,r,i,a,n,s,u){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let d=[r[0],r[1]];return sr.computeShapeHelper(t,r,d,i,a,n,s,u),d}static computeConvOutputShape(t,r,i,a,n,s,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let d=[t[0],r[0]];return sr.computeShapeHelper(!1,t,d,i,a,n,s,u),d}static computeShapeHelper(t,r,i,a,n,s,u,d){if(t)for(let p=0;p<r.length-2;p++)i.push(1);else for(let p=0;p<r.length-2;p++)i.push(sr.adjustPadAndReturnShape(r[p+2],a[p],n[p],s[p],u,p,p+r.length-2,d))}static adjustPadAndReturnShape(t,r,i,a,n,s,u,d){let p=i*(a-1)+1;if(d&&d!=="NOTSET")switch(d){case"VALID":return n[s]=0,n[u]=0,Math.floor((t-p)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let m=((t+r-1)/r-1)*r+a-t;return n[s]=Math.floor(d==="SAME_LOWER"?(m+1)/2:m/2),n[u]=m-n[s],Math.floor((t+m-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+n[s]+n[u]-p)/r+1)}},lp=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let n,s,u;t?(n=e[1],s=e[0]):(n=e[0],s=e[1]);let d=-1;if(i?(u=r[0],d=1):(u=r[1],d=0),r[d]!==s)throw new Error("dimension mismatch");if(n<=0||u<=0||s<=0)throw new Error("invalid shape specified");if(a&&!Wt.isValidBroadcast(a,[n,u]))throw new Error("gemm: invalid bias shape for broadcast");return[n,u,s]}},dp=-34028234663852886e22,pp=34028234663852886e22}),Wa,cp=U(()=>{"use strict";X(),Wa=(e,t)=>new(Kr(t))(e)}),Ci,ya,Ai,bo,Oi,$o,Ri,Bi,Ni,vo,hp,Yg=U(()=>{"use strict";X(),nt(),Ci=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),ya=(e,t)=>{if(t==="int32")return e;let r=Ci.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,n=new(Kr(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let s=new Int32Array(a);for(let u=0;u<a;u++){let d=n[u];if(d>2147483647n||d<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[u]=Number(d)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&n.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(n,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Ai=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(n=>n<-128||n>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},bo=1,Oi=()=>bo++,$o=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Ri=(e,t)=>{let r=Ci.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},Bi=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:n,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=n,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Ri(this.dataType,this.tensorShape)}destroy(){ue("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Ai(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},Ni=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),n=this.tensorManager.getMLOpSupportLimits(e),s;if(!n?.input.dataTypes.includes(t)){if(s=$o.get(t),!s||n?.input.dataTypes.includes(s))throw new Error(`WebNN backend does not support data type: ${t}`);ue("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Ri(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=ya(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else ue("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?Ai(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},vo=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Oi();return this.tensorTrackersById.set(e,new Ni(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){ue("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let n=this.tensorTrackersById.get(t);if(!n)throw new Error("Tensor not found.");return n.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){ue("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),n=Oi(),s=new Bi({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(n,new Ni(this,s)),this.externalTensors.add(s),n}async getCachedTensor(e,t,r,i,a,n,s){let u=this.getMLContext(e);for(let[p,m]of this.freeTensors.entries())if(m.canReuseTensor(u,t,r)){ue("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let h=this.freeTensors.splice(p,1)[0];return h.sessionId=e,h}ue("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let d=await u.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:a,readable:n});return new Bi({sessionId:e,context:u,tensor:d,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},hp=(...e)=>new vo(...e)}),Yt,xo,fp,Xg=U(()=>{"use strict";X(),Bt(),cp(),Yg(),nt(),Yt=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),xo=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,n)=>a===i[n]&&e[a]===t[a])},fp=class{constructor(e){this.tensorManager=hp(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,qa(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){ue("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){ue("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)ue("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>xo(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){ue("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let n=Yt.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,n,i,a)}async createTemporaryTensor(e,t,r){ue("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=Yt.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let n=this.temporarySessionTensorIds.get(e);return n?n.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!ge().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");ue("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return Wa(r,t)}}registerMLTensor(e,t,r,i){let a=Yt.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let n=this.tensorManager.registerTensor(e,t,a,i);return ue("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${n}}`),n}registerMLConstant(e,t,r,i,a,n,s=!1){if(!n)throw new Error("External mounted files are not available.");let u=e;e.startsWith("./")&&(u=e.substring(2));let d=n.get(u);if(!d)throw new Error(`File with name ${u} not found in preloaded files.`);if(t+r>d.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let p=d.slice(t,t+r).buffer,m;switch(a.dataType){case"float32":m=new Float32Array(p);break;case"float16":m=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(p):new Uint16Array(p);break;case"int32":m=new Int32Array(p);break;case"uint32":m=new Uint32Array(p);break;case"int64":if(s){let h=ya(new Uint8Array(p),"int64");m=new Int32Array(h.buffer),a.dataType="int32"}else m=new BigInt64Array(p);break;case"uint64":m=new BigUint64Array(p);break;case"int8":m=new Int8Array(p);break;case"int4":case"uint4":case"uint8":m=new Uint8Array(p);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return ue("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${s?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,m)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=Yt.get(It(t)),a=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!a?.input.dataTypes.includes(i):!!a?.output.dataTypes.includes(i)}flush(){}}}),La=U(()=>{"use strict"}),Mi,Er,zr,So,To,Di,_a,ko,mp,Jg=U(()=>{"use strict";nt(),La(),Mi=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Er=[],zr=e=>Math.ceil(Number(e)/16)*16,So=e=>{for(let t=0;t<Er.length;t++){let r=Er[t];if(e<=r)return r}return Math.ceil(e/16)*16},To=1,Di=()=>To++,_a=async(e,t,r,i)=>{let a=zr(r),n=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,n,0,a),e.flush(),await n.mapAsync(GPUMapMode.READ);let u=n.getMappedRange();if(i){let d=i();return d.set(new Uint8Array(u,0,r)),d}else return new Uint8Array(u.slice(0,r))}finally{n.destroy()}},ko=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Mi)Er.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,n=zr(a),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${a}`);let u=this.backend.device.createBuffer({mappedAtCreation:!0,size:n,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),d=u.getMappedRange();new Uint8Array(d).set(new Uint8Array(r,i,a)),u.unmap();let p=this.backend.device.createCommandEncoder();p.copyBufferToBuffer(u,0,s.gpuData.buffer,0,n),this.backend.device.queue.submit([p.finish()]),u.destroy(),ue("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=zr(r.originalSize),n=this.backend.getCommandEncoder();this.backend.endComputePass(),n.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return ue("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Di();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),ue("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),ue("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=So(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,n=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||n){let u=(a?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Di(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),ue("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return ue("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await _a(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Mi.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(ue("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},mp=(...e)=>new ko(...e)}),Io,he,ve=U(()=>{"use strict";Io=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},he=e=>new Io(e)}),Lt,Cr,ke,ze,Q,$e,wa,qt,mt,j,Xt,N,H,gp,Va,Eo,yp,re=U(()=>{"use strict";X(),te(),Lt=64,Cr=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},ke=(e,t=1)=>{let r=Cr(e,t);return typeof r=="string"?r:r[0]},ze=(e,t=1)=>{let r=Cr(e,t);return typeof r=="string"?r:r[1]},Q=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:R.computeStrides(r)})}),t},$e=e=>e%4===0?4:e%2===0?2:1,wa=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,qt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,mt=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,j=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,Xt=(e,t,r,i,a)=>{let n=typeof r=="number",s=n?r:r.length,u=[...new Array(s).keys()],d=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,p=Cr(t,a),m=typeof p=="string"?p:p[1],h=typeof p=="string"?p:p[0],g={indices:d,value:m,storage:h,tensor:t},_=M=>typeof M=="string"?M:`${M}u`,y={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},$=n?"uniforms.":"",S=`${$}${e}_shape`,v=`${$}${e}_strides`,w="";for(let M=0;M<s-1;M++)w+=`
    let dim${M} = current / ${j(v,M,s)};
    let rest${M} = current % ${j(v,M,s)};
    indices[${M}] = dim${M};
    current = rest${M};
    `;w+=`indices[${s-1}] = current;`;let I=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${w}
    return indices;
  }`,k=M=>(y.offsetToIndices=!0,s<2?M:`o2i_${e}(${M})`),E=[];if(s>=2)for(let M=s-1;M>=0;M--)E.push(`${j(v,M,s)} * (indices[${M}])`);let C=s<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${E.join("+")};
  }`,O=M=>(y.indicesToOffset=!0,s<2?M:`i2o_${e}(${M})`),x=(...M)=>s===0?"0u":`${g.indices}(${M.map(_).join(",")})`,D=(M,V)=>s<2?`${M}`:`${j(M,V,s)}`,W=(M,V,J)=>s<2?`${M}=${J};`:`${j(M,V,s)}=${J};`,Z={},L=(M,V)=>{y.broadcastedIndicesToOffset=!0;let J=`${V.name}broadcastedIndicesTo${e}Offset`;if(J in Z)return`${J}(${M})`;let de=[];for(let Te=s-1;Te>=0;Te--){let Oe=V.indicesGet("outputIndices",Te+V.rank-s);de.push(`${D(v,Te)} * (${Oe} % ${D(S,Te)})`)}return Z[J]=`fn ${J}(outputIndices: ${V.type.indices}) -> u32 {
             return ${de.length>0?de.join("+"):"0u"};
           }`,`${J}(${M})`},K=(M,V)=>(()=>{if(g.storage===g.value)return`${e}[${M}]=${V};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${M}]=vec2<u32>(u32(${V}), select(0u, 0xFFFFFFFFu, ${V} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${M}]=vec2<u32>(u32(${V}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${M}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${V}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),se=M=>(()=>{if(g.storage===g.value)return`${e}[${M}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${M}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${M}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${M}] & 0xFFu), bool(${e}[${M}] & 0xFF00u), bool(${e}[${M}] & 0xFF0000u), bool(${e}[${M}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),A=s<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${m} {
    return ${se(`i2o_${e}(indices)`)};
  }`,P=s<2?"":(()=>{let M=u.map(J=>`d${J}: u32`).join(", "),V=u.map(J=>`d${J}`).join(", ");return`
  fn get_${e}(${M}) -> ${m} {
    return get_${e}ByIndices(${x(V)});
  }`})(),ee=(...M)=>{if(M.length!==s)throw new Error(`indices length must be ${s}`);let V=M.map(_).join(",");return s===0?se("0u"):s===1?se(V[0]):(y.get=!0,y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}(${V})`)},Y=M=>s<2?se(M):(y.getByIndices=!0,y.indicesToOffset=!0,`get_${e}ByIndices(${M})`),F=s<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${m}) {
    ${K(`i2o_${e}(indices)`,"value")}
  }`,le=s<2?"":(()=>{let M=u.map(J=>`d${J}: u32`).join(", "),V=u.map(J=>`d${J}`).join(", ");return`
  fn set_${e}(${M}, value: ${m}) {
    set_${e}ByIndices(${x(V)}, value);
  }`})();return{impl:()=>{let M=[],V=!1;return y.offsetToIndices&&(M.push(I),V=!0),y.indicesToOffset&&(M.push(C),V=!0),y.broadcastedIndicesToOffset&&(Object.values(Z).forEach(J=>M.push(J)),V=!0),y.set&&(M.push(le),V=!0),y.setByIndices&&(M.push(F),V=!0),y.get&&(M.push(P),V=!0),y.getByIndices&&(M.push(A),V=!0),!n&&V&&M.unshift(`const ${S} = ${g.indices}(${r.join(",")});`,`const ${v} = ${g.indices}(${R.computeStrides(r).join(",")});`),M.join(`
`)},type:g,offsetToIndices:k,indicesToOffset:O,broadcastedIndicesToOffset:L,indices:x,indicesGet:D,indicesSet:W,set:(...M)=>{if(M.length!==s+1)throw new Error(`indices length must be ${s}`);let V=M[s];if(typeof V!="string")throw new Error("value must be string");let J=M.slice(0,s).map(_).join(",");return s===0?K("0u",V):s===1?K(J[0],V):(y.set=!0,y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}(${J}, ${V})`)},setByOffset:K,setByIndices:(M,V)=>s<2?K(M,V):(y.setByIndices=!0,y.indicesToOffset=!0,`set_${e}ByIndices(${M}, ${V});`),get:ee,getByOffset:se,getByIndices:Y,usage:i,name:e,strides:v,shape:S,rank:s}},N=(e,t,r,i=1)=>Xt(e,t,r,"input",i),H=(e,t,r,i=1)=>Xt(e,t,r,"output",i),gp=(e,t,r)=>Xt(e,t,r,"atomicOutput",1),Va=(e,t,r,i=1)=>Xt(e,t,r,"internal",i),Eo=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Lt){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,n=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${n}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},yp=(e,t)=>new Eo(e,t)}),zo,Ui,Co,Ao,Oo,Ro,Ne,_p,wp,gt=U(()=>{"use strict";X(),te(),ve(),re(),zo=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Ui=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),Co=(e,t)=>R.sortBasedOnPerm(e,Ui(e.length,t)),Ao=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let n=0;n<t;++n)a+=`a[${e[n]}]=i[${n}];`;return a+="return a;}"},Oo=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},Ro=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Ne=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Ui(i,t),n=Co(e.dims,a),s=e.dims,u=n,d=i<2||Ro(a,e.dims),p;if(d)return p=y=>{let $=N("input",r,s,4),S=H("output",r,u,4);return`
  ${y.registerUniform("output_size","u32").declareVariables($,S)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let y=R.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64/4)},programUniforms:[{type:12,data:Math.ceil(y/4)}]}},getShaderSource:p};let{newShape:m,newPerm:h}=Oo(e.dims,a),g=R.areEqual(h,[2,3,1]),_=R.areEqual(h,[3,1,2]);if(m.length===2||g||_){s=g?[m[0],m[1]*m[2]]:_?[m[0]*m[1],m[2]]:m,u=[s[1],s[0]];let y=16;return p=$=>{let S=N("a",r,s.length),v=H("output",r,u.length);return`
  ${$.registerUniform("output_size","u32").declareVariables(S,v)}
  var<workgroup> tile : array<array<${v.type.value}, ${y+1}>, ${y}>;
  ${$.mainStart([y,y,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${y} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${y}u + local_id.x;
    let input_row = workgroup_id_x * ${y}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${S.getByIndices(`${S.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${y}u + local_id.x;
    let output_row = workgroup_id_y * ${y}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${v.setByIndices(`${v.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let $=R.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/y),y:Math.ceil(u[0]/y)},programUniforms:[{type:12,data:$},...Q(s,u)]}},getShaderSource:p}}return p=y=>{let $=N("a",r,s.length),S=H("output",r,u.length);return`
  ${y.registerUniform("output_size","u32").declareVariables($,S)}

  ${Ao(a,i,$,S)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${S.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${S.setByOffset("global_idx",$.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let y=R.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...Q(s,u)]}},getShaderSource:p}},_p=(e,t)=>{zo(e.inputs,t.perm),e.compute(Ne(e.inputs[0],t.perm))},wp=e=>he({perm:e.perm})}),Bo,No,Mo,Do,Uo,Po,qo,Wo,Lo,Vo,We,bp,$p,vp,xp,Sp,Tp,kp,Ip,Ep,zp,e0=U(()=>{"use strict";X(),te(),re(),Ga(),gt(),Bo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},No={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},Mo={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},Do={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Uo=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},Po=(e,t)=>{let r=[],i=e.length;for(let n=0;n<i;n++)t.indexOf(n)===-1&&r.push(e[n]);let a=t.map(n=>e[n]);return[r,a]},qo=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let n=0;n<r;n++)t.indexOf(n)===-1?i.push(e[a++]):i.push(1);return i},Wo=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Lo=(e,t)=>{let r=[];if(!Wo(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},Vo=(e,t,r,i,a,n,s)=>{let u=r[0].dims,d=R.size(n),p=R.size(s),m=N("_A",r[0].dataType,u),h=H("output",a,n),g=64;d===1&&(g=256);let _=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,y=$=>`
        ${$.registerUniform("reduceSize","u32").declareVariables(m,h)}
        ${_}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${$.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${Mo[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${m.getByOffset("offset + k")});
           bestValue = ${Bo[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${No[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${h.setByOffset("outputIndex",`${i==="mean"?`${h.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${h.type.storage}(${Do[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:y,getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:d},programUniforms:[{type:12,data:p}]})}},We=(e,t,r,i)=>{let a=e.inputs.length===1?r:ba(e.inputs,r),n=a.axes;n.length===0&&!a.noopWithEmptyAxes&&(n=e.inputs[0].dims.map((_,y)=>y));let s=R.normalizeAxes(n,e.inputs[0].dims.length),u=s,d=e.inputs[0],p=Lo(u,e.inputs[0].dims.length);p.length>0&&(d=e.compute(Ne(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],u=Uo(u.length,d.dims.length));let[m,h]=Po(d.dims,u),g=m;a.keepDims&&(g=qo(m,s)),e.compute(Vo(t,a.cacheKey,[d],i,e.inputs[0].dataType,g,h),{inputs:[d]})},bp=(e,t)=>{We(e,"ReduceMeanShared",t,"mean")},$p=(e,t)=>{We(e,"ReduceL1Shared",t,"l1")},vp=(e,t)=>{We(e,"ReduceL2Shared",t,"l2")},xp=(e,t)=>{We(e,"ReduceLogSumExpShared",t,"logSumExp")},Sp=(e,t)=>{We(e,"ReduceMaxShared",t,"max")},Tp=(e,t)=>{We(e,"ReduceMinShared",t,"min")},kp=(e,t)=>{We(e,"ReduceProdShared",t,"prod")},Ip=(e,t)=>{We(e,"ReduceSumShared",t,"sum")},Ep=(e,t)=>{We(e,"ReduceSumSquareShared",t,"sumSquare")},zp=(e,t)=>{We(e,"ReduceLogSumShared",t,"logSum")}}),Le,Go,Gr,ba,Ve,Ho,Fo,jo,Ko,Qo,Zo,Yo,Xo,Jo,eu,Ge,Cp,Ap,Op,Rp,Bp,Np,Mp,Dp,Up,Pp,Ga=U(()=>{"use strict";X(),te(),ve(),re(),e0(),Le=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},Go=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Gr=(e,t,r,i,a,n,s=!1,u=!1)=>{let d=[],p=r[0].dims,m=p.length,h=R.normalizeAxes(a,m),g=!u&&h.length===0;p.forEach(($,S)=>{g||h.indexOf(S)>=0?s&&d.push(1):d.push($)});let _=d.length,y=R.size(d);return{name:e,shaderCache:t,getShaderSource:$=>{let S=[],v=N("_A",r[0].dataType,m),w=H("output",n,_),I=i(v,w,h),k=I[2];for(let E=0,C=0;E<m;E++)g||h.indexOf(E)>=0?(s&&C++,k=`for(var j${E}: u32 = 0; j${E} < ${p[E]}; j${E}++) {
                  ${I[2].includes("last_index")?`let last_index = j${E};`:""}
                  ${v.indicesSet("input_indices",E,`j${E}`)}
                  ${k}
                }`):(S.push(`${v.indicesSet("input_indices",E,w.indicesGet("output_indices",C))};`),C++);return`

        ${$.registerUniform("output_size","u32").declareVariables(v,w)}

        ${$.mainStart()}
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${v.type.indices};
          let output_indices = ${w.offsetToIndices("global_idx")};

          ${S.join(`
`)}
          ${I[0]}       // init ops for reduce max/min
          ${I[1]}
          ${k}
          ${I[3]}
          ${I.length===4?w.setByOffset("global_idx","value"):I.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:d,dataType:n}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:[{type:12,data:y},...Q(p,d)]})}},ba=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),he({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Ve=(e,t,r,i)=>{let a=e.inputs,n=a.length===1?r:ba(a,r);e.compute(Gr(t,{hint:n.cacheKey,inputDependencies:["rank"]},[a[0]],n.noopWithEmptyAxes&&n.axes.length===0?Go:i,n.axes,a[0].dataType,n.keepDims,n.noopWithEmptyAxes),{inputs:[0]})},Ho=(e,t)=>{Le(e.inputs),Ve(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},Fo=(e,t)=>{Le(e.inputs),Ve(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},jo=(e,t)=>{Le(e.inputs),Ve(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Ko=(e,t)=>{Le(e.inputs),Ve(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Qo=(e,t)=>{Le(e.inputs),Ve(e,"ReduceMax",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(r.indicesSet("input_indices",s,0));return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Zo=(e,t)=>{Le(e.inputs),Ve(e,"ReduceMean",t,(r,i,a)=>{let n=1;for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&(n*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${n});`]})},Yo=(e,t)=>{Le(e.inputs),Ve(e,"ReduceMin",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(`input_indices[${s}] = 0;`);return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Xo=(e,t)=>{Le(e.inputs),Ve(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},Jo=(e,t)=>{Le(e.inputs),Ve(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},eu=(e,t)=>{Le(e.inputs),Ve(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Ge=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let n=0;n<t.length;n++)t.indexOf(n)===-1?i*=e[n]:a*=e[n];return a<32&&i>1024},Cp=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Zo(e,t):bp(e,t)},Ap=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Fo(e,t):$p(e,t)},Op=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?jo(e,t):vp(e,t)},Rp=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ko(e,t):xp(e,t)},Bp=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Qo(e,t):Sp(e,t)},Np=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Yo(e,t):Tp(e,t)},Mp=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Xo(e,t):kp(e,t)},Dp=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Jo(e,t):Ip(e,t)},Up=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?eu(e,t):Ep(e,t)},Pp=(e,t)=>{Ge(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ho(e,t):zp(e,t)}}),Pi,qp,Wp,$a,t0=U(()=>{"use strict";X(),ve(),Ga(),Pi=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},qp=(e,t)=>{Pi(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Gr("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Wp=(e,t)=>{Pi(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Gr("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},$a=e=>he(e)}),tu,Ar,ru,iu,au,pr,nu,Lp,Ha=U(()=>{"use strict";X(),te(),La(),re(),tu=(e,t)=>{let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4],u=e[5];if(s&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let d=r.dims[0],p=r.dims[1],m=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==m)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let h=a.dims[0]/3,g=h,_=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let I of t.qkvHiddenSizes)if(I%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");h=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],_=t.qkvHiddenSizes[2]}let y=p;if(h!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==h+g+_)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let $=0;if(s){if(g!==_)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==d)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||($=s.dims[3])}let S=y+$,v=-1,w=0;if(n)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==d||u.dims[1]!==t.numHeads||u.dims[2]!==p||u.dims[3]!==S)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:d,sequenceLength:p,pastSequenceLength:$,kvSequenceLength:y,totalSequenceLength:S,maxSequenceLength:v,inputHiddenSize:m,hiddenSize:h,vHiddenSize:_,headSize:Math.floor(h/t.numHeads),vHeadSize:Math.floor(_/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Ar=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,ru=(e,t,r,i,a,n,s,u)=>{let d=$e(s?1:n),p=64,m=n/d;m<p&&(p=32);let h=Math.ceil(n/d/p),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:m},{type:12,data:h}],_=ke(e.dataType,d),y=ze(1,d),$=["type"];s&&$.push("type"),u&&$.push("type");let S=v=>{let w=H("x",e.dataType,e.dims,d),I=[w],k=s?N("seq_lens",s.dataType,s.dims):void 0;k&&I.push(k);let E=u?N("total_sequence_length_input",u.dataType,u.dims):void 0;E&&I.push(E);let C=ze(e.dataType),O=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${v.registerUniforms(O).declareVariables(...I)}
  ${v.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Ar(k,E,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${y}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${y}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(d){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${y}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${y}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(d){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${w.type.value}(${C}(1.0) / ${C}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${y}(x[offset + i]);
        x[offset + i] = ${w.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${w.type.value}(${C}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${_};${d}`,inputDependencies:$},getShaderSource:S,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:g})}},iu=(e,t,r,i,a,n,s,u,d)=>{let p=s+n.kvSequenceLength,m=[n.batchSize,n.numHeads,n.sequenceLength,p],h=e>1&&i,g=n.kvNumHeads?n.kvNumHeads:n.numHeads,_=h?[n.batchSize,g,p,n.headSize]:void 0,y=n.nReps?n.nReps:1,$=n.scale===0?1/Math.sqrt(n.headSize):n.scale,S=$e(n.headSize),v=n.headSize/S,w=12,I={x:Math.ceil(p/w),y:Math.ceil(n.sequenceLength/w),z:n.batchSize*n.numHeads},k=[{type:12,data:n.sequenceLength},{type:12,data:v},{type:12,data:p},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:1,data:$},{type:12,data:s},{type:12,data:n.kvSequenceLength},{type:12,data:y}],E=h&&i&&R.size(i.dims)>0,C=["type","type"];E&&C.push("type"),a&&C.push("type"),u&&C.push("type"),d&&C.push("type");let O=[{dims:m,dataType:t.dataType,gpuDataType:0}];h&&O.push({dims:_,dataType:t.dataType,gpuDataType:0});let x=D=>{let W=N("q",t.dataType,t.dims,S),Z=N("key",r.dataType,r.dims,S),L=[W,Z];if(E){let F=N("past_key",i.dataType,i.dims,S);L.push(F)}a&&L.push(N("attention_bias",a.dataType,a.dims));let K=u?N("seq_lens",u.dataType,u.dims):void 0;K&&L.push(K);let se=d?N("total_sequence_length_input",d.dataType,d.dims):void 0;se&&L.push(se);let A=H("output",t.dataType,m),P=[A];h&&P.push(H("present_key",t.dataType,_,S));let ee=ze(1,S),Y=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;

  var<workgroup> tileQ: array<${W.type.storage}, ${w*w}>;
  var<workgroup> tileK: array<${W.type.storage}, ${w*w}>;
  ${D.registerUniforms(Y).declareVariables(...L,...P)}
  ${D.mainStart([w,w,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${y===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${y===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Ar(K,se,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E&&h?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${h?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${ee}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E&&h?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${h?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${ee}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(S){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${S}`)}})()};
        output[outputIdx] = ${A.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${S};${a!==void 0};${i!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:O,dispatchGroup:I,programUniforms:k}),getShaderSource:x}},au=(e,t,r,i,a,n,s=void 0,u=void 0)=>{let d=n+a.kvSequenceLength,p=a.nReps?a.nReps:1,m=a.vHiddenSize*p,h=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,_=h?[a.batchSize,g,d,a.headSize]:void 0,y=[a.batchSize,a.sequenceLength,m],$=12,S={x:Math.ceil(a.vHeadSize/$),y:Math.ceil(a.sequenceLength/$),z:a.batchSize*a.numHeads},v=[{type:12,data:a.sequenceLength},{type:12,data:d},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:m},{type:12,data:n},{type:12,data:a.kvSequenceLength},{type:12,data:p}],w=h&&i&&R.size(i.dims)>0,I=["type","type"];w&&I.push("type"),s&&I.push("type"),u&&I.push("type");let k=[{dims:y,dataType:t.dataType,gpuDataType:0}];h&&k.push({dims:_,dataType:t.dataType,gpuDataType:0});let E=C=>{let O=N("probs",t.dataType,t.dims),x=N("v",r.dataType,r.dims),D=[O,x];w&&D.push(N("past_value",i.dataType,i.dims));let W=s?N("seq_lens",s.dataType,s.dims):void 0;s&&D.push(W);let Z=u?N("total_sequence_length_input",u.dataType,u.dims):void 0;u&&D.push(Z);let L=[H("output",t.dataType,y)];h&&L.push(H("present_value",t.dataType,_));let K=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${$}u;
  var<workgroup> tileQ: array<${O.type.value}, ${$*$}>;
  var<workgroup> tileV: array<${O.type.value}, ${$*$}>;
  ${C.registerUniforms(K).declareVariables(...D,...L)}
  ${C.mainStart([$,$,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Ar(W,Z,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${w&&h?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${h?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${O.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${w&&h?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${h?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:I},getRunData:()=>({outputs:k,dispatchGroup:S,programUniforms:v}),getShaderSource:E}},pr=(e,t,r,i,a,n,s,u,d,p,m=void 0,h=void 0)=>{let g=Math.min(e.outputCount,1+(s?1:0)+(u?1:0)),_=g>1?p.pastSequenceLength:0,y=_+p.kvSequenceLength,$=d&&R.size(d.dims)>0?d:void 0,S=[t,r];g>1&&s&&R.size(s.dims)>0&&S.push(s),$&&S.push($),m&&S.push(m),h&&S.push(h);let v=e.compute(iu(g,t,r,s,$,p,_,m,h),{inputs:S,outputs:g>1?[-1,1]:[-1]})[0];e.compute(ru(v,p.batchSize,p.numHeads,_,p.sequenceLength,y,m,h),{inputs:m&&h?[v,m,h]:[v],outputs:[]});let w=[v,i];g>1&&u&&R.size(u.dims)>0&&w.push(u),m&&w.push(m),h&&w.push(h),e.compute(au(g,v,i,u,p,_,m,h),{inputs:w,outputs:g>1?[0,2]:[0]})},nu=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,n=t.headSize,s=12,u={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},d=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:i},{type:12,data:a},{type:12,data:n},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],m=h=>{let g=H("output_q",d[0].dataType,r),_=H("output_k",d[0].dataType,r),y=H("output_v",d[0].dataType,r),$=N("input",d[0].dataType,d[0].dims),S=N("weight",d[1].dataType,d[1].dims),v=N("bias",d[2].dataType,d[2].dims),w=$.type.storage,I=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${w}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${w}, ${s*s}>;
  var<workgroup> tileWeightK: array<${w}, ${s*s}>;
  var<workgroup> tileWeightV: array<${w}, ${s*s}>;
  ${h.registerUniforms(I).declareVariables($,S,v,g,_,y)}
  ${h.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${w}(0);
    var valueK = ${w}(0);
    var valueV = ${w}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:p}),getShaderSource:m},{inputs:d,outputs:[-1,-1,-1]})},Lp=(e,t)=>{let r=tu(e.inputs,t),[i,a,n]=nu(e,r);return pr(e,i,a,n,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),su,ou,uu,Vp,r0=U(()=>{"use strict";Ue(),X(),te(),ve(),re(),su=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,n)=>{let s=a.length;if(s!==i.length)throw new Error(`${n}: num dimensions != ${s}`);a.forEach((u,d)=>{if(u!==i[d])throw new Error(`${n}: dim[${d}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},ou=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,n=e[0].dims,s=i?$e(n[n.length-1]):1,u=a==="NHWC"&&n.length>1?s:1,d=R.size(n)/s,p=i,m=p?n.length:n,h=N("x",e[0].dataType,e[0].dims,s),g=N("scale",e[1].dataType,e[1].dims,u),_=N("bias",e[2].dataType,e[2].dims,u),y=N("inputMean",e[3].dataType,e[3].dims,u),$=N("inputVar",e[4].dataType,e[4].dims,u),S=H("y",e[0].dataType,m,s),v=()=>{let I="";if(i)I=`let cOffset = ${n.length===1?"0u":a==="NHWC"?`outputIndices[${n.length-1}] / ${s}`:"outputIndices[1]"};`;else if(a==="NCHW")I=`
            ${S.indicesSet("outputIndices","0","0")}
            let cOffset = ${S.indicesToOffset("outputIndices")};`;else{I=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${n.length-1}];`;for(let k=1;k<g.rank;k++)I+=`cIndices[${k}] = outputIndices[${k}];`;I+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return I},w=I=>`
  const epsilon = ${r};
  ${I.registerUniform("outputSize","u32").declareVariables(h,g,_,y,$,S)}
  ${I.mainStart()}
  ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${S.offsetToIndices(`global_idx * ${s}`)};
    ${v()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${_.getByOffset("cOffset")};
    let inputMean = ${y.getByOffset("cOffset")};
    let inputVar = ${$.getByOffset("cOffset")};
    let x = ${h.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${S.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p?[{type:12,data:d},...Q(n)]:[{type:12,data:d}]})}},uu=e=>he(e),Vp=(e,t)=>{let{inputs:r,outputCount:i}=e,a=uu({...t,outputCount:i});if(_e.webgpu.validateInputContent&&su(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(ou(r,a))}}),lu,du,Gp,i0=U(()=>{"use strict";te(),re(),lu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},du=e=>{let t=e[0].dims,r=e[0].dims[2],i=R.size(t)/4,a=e[0].dataType,n=N("input",a,t,4),s=N("bias",a,[r],4),u=N("residual",a,t,4),d=H("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:p=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(n,s,u,d)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${n.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${d.setByOffset("global_idx","value")}
  }`}},Gp=e=>{lu(e.inputs),e.compute(du(e.inputs))}}),pu,ce,Hp,Fp,jp,Kp,Qp,Zp,Yp,Xp,Jp,cu,ec,tc,rc,ic,or,ac,Pr,nc,sc,oc,uc,lc,dc,pc,cc,hc,fc,mc,gc,yc,_c,wc,bc,qi,$c,va,xa,vc,xc,Sc,hu,fu,Tc,Fa=U(()=>{"use strict";X(),te(),ve(),re(),pu=(e,t,r,i,a,n,s)=>{let u=Math.ceil(t/4),d="";typeof a=="string"?d=`${a}(a)`:d=a("a");let p=N("inputData",r,[u],4),m=H("outputData",i,[u],4),h=[{name:"vec_size",type:"u32"}];return s&&h.push(...s),`
      ${e.registerUniforms(h).declareVariables(p,m)}

  ${n??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${m.setByOffset("global_idx",d)}
  }`},ce=(e,t,r,i,a,n=e.dataType,s,u)=>{let d=[{type:12,data:Math.ceil(R.size(e.dims)/4)}];return s&&d.push(...s),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:p=>pu(p,R.size(e.dims),e.dataType,n,r,i,u),getRunData:p=>({outputs:[{dims:e.dims,dataType:n}],dispatchGroup:{x:Math.ceil(R.size(p[0].dims)/64/4)},programUniforms:d})}},Hp=e=>{e.compute(ce(e.inputs[0],"Abs","abs"))},Fp=e=>{e.compute(ce(e.inputs[0],"Acos","acos"))},jp=e=>{e.compute(ce(e.inputs[0],"Acosh","acosh"))},Kp=e=>{e.compute(ce(e.inputs[0],"Asin","asin"))},Qp=e=>{e.compute(ce(e.inputs[0],"Asinh","asinh"))},Zp=e=>{e.compute(ce(e.inputs[0],"Atan","atan"))},Yp=e=>{e.compute(ce(e.inputs[0],"Atanh","atanh"))},Xp=e=>he(e),Jp=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(ce(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},cu=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return he({min:t,max:r})},ec=(e,t)=>{let r=t||cu(e.inputs),i=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},tc=e=>{e.compute(ce(e.inputs[0],"Ceil","ceil"))},rc=e=>{e.compute(ce(e.inputs[0],"Cos","cos"))},ic=e=>{e.compute(ce(e.inputs[0],"Cosh","cosh"))},or=e=>he(e),ac=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Pr=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,nc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Pr(t)))},sc=e=>{e.compute(ce(e.inputs[0],"Exp","exp"))},oc=e=>{e.compute(ce(e.inputs[0],"Floor","floor"))},uc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Pr(t)))},lc=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},dc=e=>{e.compute(ce(e.inputs[0],"Not",t=>`!${t}`))},pc=e=>{e.compute(ce(e.inputs[0],"Neg",t=>`-${t}`))},cc=e=>{e.compute(ce(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},hc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},fc=e=>{e.compute(ce(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},mc=e=>he(e),gc=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},yc=e=>{e.compute(ce(e.inputs[0],"Sin","sin"))},_c=e=>{e.compute(ce(e.inputs[0],"Sinh","sinh"))},wc=e=>{e.compute(ce(e.inputs[0],"Sqrt","sqrt"))},bc=e=>{e.compute(ce(e.inputs[0],"Tan","tan"))},qi=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,$c=e=>{e.compute(ce(e.inputs[0],"Tanh",qi))},va=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${qi("v")};
}
`,xa=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,vc=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"FastGelu",xa,va(t),void 0,e.inputs[0].dataType))},xc=(e,t)=>{let r=ze(e.inputs[0].dataType);return e.compute(ce(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Sc=e=>{e.compute(ce(e.inputs[0],"Log","log"))},hu=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,fu=e=>`quick_gelu_impl(${e})`,Tc=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"QuickGelu",fu,hu(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),mu,gu,kc,a0=U(()=>{"use strict";te(),re(),Fa(),mu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},gu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=N("input",e[0].dataType,e[0].dims,4),i=N("bias",e[0].dataType,[e[0].dims[2]],4),a=H("output",e[0].dataType,t,4),n=R.size(t)/4,s=ke(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,a)}

  ${Pr(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(n)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},kc=e=>{mu(e.inputs),e.compute(gu(e.inputs))}}),yu,_u,He,Ic,Ec,zc,Cc,Ac,Oc,Rc,Bc,Nc,Mc,n0=U(()=>{"use strict";X(),te(),re(),yu=(e,t,r,i,a,n,s,u,d,p,m,h)=>{let g,_;typeof u=="string"?g=_=(w,I)=>`${u}((${w}),(${I}))`:typeof u=="function"?g=_=u:(g=u.scalar,_=u.vector);let y=H("outputData",m,i.length,4),$=N("aData",d,t.length,4),S=N("bData",p,r.length,4),v;if(a)if(n){let w=R.size(t)===1,I=R.size(r)===1,k=t.length>0&&t[t.length-1]%4===0,E=r.length>0&&r[r.length-1]%4===0;w||I?v=y.setByOffset("global_idx",_(w?`${$.type.value}(${$.getByOffset("0")}.x)`:$.getByOffset("global_idx"),I?`${S.type.value}(${S.getByOffset("0")}.x)`:S.getByOffset("global_idx"))):v=`
            let outputIndices = ${y.offsetToIndices("global_idx * 4u")};
            let offsetA = ${$.broadcastedIndicesToOffset("outputIndices",y)};
            let offsetB = ${S.broadcastedIndicesToOffset("outputIndices",y)};
            ${y.setByOffset("global_idx",_(s||k?$.getByOffset("offsetA / 4u"):`${$.type.value}(${$.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||E?S.getByOffset("offsetB / 4u"):`${S.type.value}(${S.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else v=y.setByOffset("global_idx",_($.getByOffset("global_idx"),S.getByOffset("global_idx")));else{if(!n)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let w=(I,k,E="")=>{let C=`aData[indexA${k}][componentA${k}]`,O=`bData[indexB${k}][componentB${k}]`;return`
            let outputIndices${k} = ${y.offsetToIndices(`global_idx * 4u + ${k}u`)};
            let offsetA${k} = ${$.broadcastedIndicesToOffset(`outputIndices${k}`,y)};
            let offsetB${k} = ${S.broadcastedIndicesToOffset(`outputIndices${k}`,y)};
            let indexA${k} = offsetA${k} / 4u;
            let indexB${k} = offsetB${k} / 4u;
            let componentA${k} = offsetA${k} % 4u;
            let componentB${k} = offsetB${k} % 4u;
            ${I}[${k}] = ${E}(${g(C,O)});
          `};m===9?v=`
            var data = vec4<u32>(0);
            ${w("data",0,"u32")}
            ${w("data",1,"u32")}
            ${w("data",2,"u32")}
            ${w("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:v=`
            ${w("outputData[global_idx]",0)}
            ${w("outputData[global_idx]",1)}
            ${w("outputData[global_idx]",2)}
            ${w("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables($,S,y)}

        ${h??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${v}
      }`},_u=(e,t,r,i,a,n,s=r.dataType)=>{let u=r.dims.map(Number),d=i.dims.map(Number),p=!R.areEqual(u,d),m=u,h=R.size(u),g=!1,_=!1,y=[p];if(p){let $=Wt.calcShape(u,d,!1);if(!$)throw new Error("Can't perform binary op on the given tensors");m=$.slice(),h=R.size(m);let S=R.size(u)===1,v=R.size(d)===1,w=u.length>0&&u[u.length-1]%4===0,I=d.length>0&&d[d.length-1]%4===0;y.push(S),y.push(v),y.push(w),y.push(I);let k=1;for(let E=1;E<m.length;E++){let C=u[u.length-E],O=d[d.length-E];if(C===O)k*=C;else break}k%4===0?(_=!0,g=!0):(S||v||w||I)&&(g=!0)}else g=!0;return y.push(g),{name:e,shaderCache:{hint:t+y.map($=>$.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:$=>yu($,u,d,m,g,p,_,a,r.dataType,i.dataType,s,n),getRunData:()=>({outputs:[{dims:m,dataType:s}],dispatchGroup:{x:Math.ceil(h/64/4)},programUniforms:[{type:12,data:Math.ceil(R.size(m)/4)},...Q(u,d,m)]})}},He=(e,t,r,i,a,n)=>{e.compute(_u(t,a??"",e.inputs[0],e.inputs[1],r,i,n))},Ic=e=>{He(e,"Add",(t,r)=>`${t}+${r}`)},Ec=e=>{He(e,"Div",(t,r)=>`${t}/${r}`)},zc=e=>{He(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},Cc=e=>{He(e,"Mul",(t,r)=>`${t}*${r}`)},Ac=e=>{let t=N("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;He(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},Oc=e=>{He(e,"Sub",(t,r)=>`${t}-${r}`)},Rc=e=>{He(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Bc=e=>{He(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Nc=e=>{He(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},Mc=e=>{He(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),wu,bu,$u,vu,Dc,Uc,s0=U(()=>{"use strict";X(),te(),ve(),re(),wu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,n=i.dims.length;e.forEach((s,u)=>{if(u!==r){if(s.dataType!==a)throw new Error("input tensors should be one type");if(s.dims.length!==n)throw new Error("input tensors should have the same shape");s.dims.forEach((d,p)=>{if(p!==t&&d!==i.dims[p])throw new Error("non concat dimensions must match")})}})},bu=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,$u=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let n=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(n):a===0?i.push(`if (inputIndex == ${a}u) { ${n} }`):a===r-1?i.push(`else { ${n} }`):i.push(`else if (inputIndex == ${a}) { ${n} }`)}return i.join(`
`)},vu=(e,t,r,i)=>{let a=R.size(r),n=new Array(e.length),s=new Array(e.length),u=0,d=[],p=[],m=[{type:12,data:a}];for(let $=0;$<e.length;++$)u+=e[$].dims[t],n[$]=u,p.push(e[$].dims.length),s[$]=N(`input${$}`,i,p[$]),d.push("rank"),m.push({type:12,data:n[$]});for(let $=0;$<e.length;++$)m.push(...Q(e[$].dims));m.push(...Q(r));let h=H("output",i,r.length),g=h.indicesGet("indices",t),_=Array.from(Array(n.length).keys()).map($=>`uniforms.sizeInConcatAxis${$}`).join(","),y=$=>`

  ${(()=>{$.registerUniform("outputSize","u32");for(let S=0;S<e.length;S++)$.registerUniform(`sizeInConcatAxis${S}`,"u32");return $.declareVariables(...s,h)})()}

  ${bu(n.length,_)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${h.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${n.length}u>(${_});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${$u(s,h)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:m}),getShaderSource:y}},Dc=(e,t)=>{let r=e.inputs,i=r[0].dims,a=R.normalizeAxis(t.axis,i.length);wu(r,a);let n=i.slice();n[a]=r.reduce((u,d)=>u+(d.dims.length>a?d.dims[a]:0),0);let s=r.filter(u=>R.size(u.dims)>0);e.compute(vu(s,a,n,r[0].dataType),{inputs:s})},Uc=e=>he({axis:e.axis})}),At,Ot,Rt,ja,Nt=U(()=>{"use strict";X(),te(),At=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Ot=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Rt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},ja=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,i]=e?.activation_params||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=e?.activation_params||[dp,pp];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ee,Pc,Ka=U(()=>{"use strict";Ee=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},Pc=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),qc,o0=U(()=>{"use strict";qc=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),lr,Qa,Za=U(()=>{"use strict";X(),te(),re(),Nt(),lr=(e,t,r,i,a)=>{let n=i-r;return`
      ${Array.from({length:r}).map((s,u)=>`
      if (${j(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,j(a,u+n,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},Qa=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,d=s[s.length-2],p=u[u.length-1],m=s[s.length-1],h=$e(p),g=$e(m),_=$e(d),y=R.size(r)/h/_,$=e.length>2,S=i?i.slice(0,-2):r.slice(0,-2),v=[R.size(S),d,p],w=[{type:12,data:y},{type:12,data:d},{type:12,data:p},{type:12,data:m}];Ot(t,w),w.push(...Q(S,s,u)),$&&w.push(...Q(e[2].dims)),w.push(...Q(v));let I=k=>{let E=Va("batch_dims",e[0].dataType,S.length),C=N("a",e[0].dataType,s.length,g),O=N("b",e[1].dataType,u.length,h),x=H("output",e[0].dataType,v.length,h),D=ke(x.type.tensor),W=At(t,x.type.value,D),Z=[C,O],L="";if($){let A=a?h:1;Z.push(N("bias",e[2].dataType,e[2].dims.length,A)),L=`${a?`value += bias[col / ${A}];`:`value += ${x.type.value}(bias[row + i]);`}`}let K=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Rt(t,K);let se=()=>{let A=`var a_data: ${C.type.value};`;for(let P=0;P<g;P++)A+=`
              let b_data${P} = b[(b_offset + (k + ${P}) * uniforms.N + col) / ${h}];`;for(let P=0;P<_;P++){A+=`a_data = a[(a_offset + (row + ${P}) * uniforms.K + k) / ${g}];`;for(let ee=0;ee<g;ee++)A+=`
            values[${P}] = fma(${O.type.value}(a_data${g===1?"":`[${ee}]`}), b_data${ee}, values[${P}]);
`}return A};return`
  ${k.registerUniforms(K).registerInternalVariables(E).declareVariables(...Z,x)}
  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${h})) * ${h};
    var index1 = global_idx / (uniforms.N / ${h});
    let stride1 = uniforms.M / ${_};
    let row = (index1 % stride1) * ${_};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${E.offsetToIndices("batch")};`}

    var a_indices: ${C.type.indices};
    ${lr("a_indices",C,C.rank-2,E.rank,"batch_indices")}
    ${C.indicesSet("a_indices",C.rank-2,0)}
    ${C.indicesSet("a_indices",C.rank-1,0)}
    let a_offset = ${C.indicesToOffset("a_indices")};

    var b_indices: ${O.type.indices};
    ${lr("b_indices",O,O.rank-2,E.rank,"batch_indices")}
    ${O.indicesSet("b_indices",O.rank-2,0)}
    ${O.indicesSet("b_indices",O.rank-1,0)}
    let b_offset = ${O.indicesToOffset("b_indices")};
    var values: array<${x.type.value}, ${_}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${se()}
    }
    for (var i = 0u; i < ${_}u; i++) {
      var value = values[i];
      ${L}
      ${W}
      let cur_indices = ${x.type.indices}(batch, row + i, col);
      let offset = ${x.indicesToOffset("cur_indices")};
      ${x.setByOffset(`offset / ${h}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${h};${g};${_};${a}`,inputDependencies:$?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(y/64)},programUniforms:w}),getShaderSource:I}}}),xu,Su,Sa,Wi,Tu,Ta,ku,Hr,Ya=U(()=>{"use strict";X(),te(),re(),Nt(),Za(),Ka(),xu=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Su=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,Sa=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32)=>{let d=t[1]*e[1],p=t[0]*e[0],m=a?d:n,h=a?n:d,g=m/t[0],_=n/t[1];if(!((a&&g===4&&e[1]===4||!a&&(g===3||g===4))&&m%t[0]===0&&n%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${m} must be divisible by workgroupSize[0]${t[0]}. tileInner ${n} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${m/g}>, ${h}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${n}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${d};

  let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${_};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${xu(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Su(a,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},Wi=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,Tu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Ta=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32,d=!1)=>{let p=e[1]*t[1],m=e[0]*t[0],h=a?p:n,g=a?n:p;if(!(g%t[1]===0&&h%t[0]===0&&n%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}, tileInner ${n} must be divisible by workgroupSize[1]${t[1]}`);let _=g/t[1],y=h/t[0],$=n/t[1],S=d?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${m};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          ${Wi(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${n}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${m}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${_};
let tileColA = i32(localId.x) * ${y};
let tileRowB = i32(localId.y) * ${$};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${y}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Wi(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${$}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Tu(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${h}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${m}>, ${n}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${S}
  }
`},ku=(e,t,r,i,a=!1)=>{let[n,s,u,d]=i,p=ke(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ee(e,p)} {
      var value = ${Ee(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${lr("aIndices",s,s.rank-2,n.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ee(e,p)} {
      var value = ${Ee(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${lr("bIndices",u,u.rank-2,n.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ee(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ee(e,p)}(bias[row])`};`:""}
        ${r}
        ${d.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Hr=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,d=s.slice(0,-2),p=u.slice(0,-2),m=i?i.slice(0,-2):r.slice(0,-2),h=R.size(m),g=s[s.length-2],_=s[s.length-1],y=u[u.length-1],$=_%4===0&&y%4===0,S=g<=8?[4,1,1]:[4,4,1],v=[8,8,1],w=[Math.ceil(y/v[0]/S[0]),Math.ceil(g/v[1]/S[1]),Math.ceil(h/v[2]/S[2])],I=$?4:1,k=[...d,g,_/I],E=k.length,C=[...p,_,y/I],O=C.length,x=[h,g,y/I],D=[{type:6,data:g},{type:6,data:y},{type:6,data:_}];Ot(t,D),D.push(...Q(m,k,C));let W=["rank","rank"],Z=e.length>2;Z&&(D.push(...Q(e[2].dims)),W.push("rank")),D.push(...Q(x));let L=K=>{let se=m.length,A=Va("batchDims",e[0].dataType,se,1),P=ke(e[0].dataType),ee=N("a",e[0].dataType,E,I),Y=N("b",e[1].dataType,O,I),F=H("result",e[0].dataType,x.length,I),le=[ee,Y];if(Z){let Te=a?I:1;le.push(N("bias",e[2].dataType,e[2].dims.length,Te))}let M=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Rt(t,M);let V=ke(F.type.tensor),J=At(t,F.type.value,V),de=ku(I,Z,J,[A,ee,Y,F],a);return`
  ${K.registerUniforms(M).registerInternalVariables(A).declareVariables(...le,F)}
  ${de}
  ${$?Sa(S,v,P,A):Ta(S,v,P,A)}
                   `};return{name:"MatMul",shaderCache:{hint:`${S};${t.activation};${$};${a}`,inputDependencies:W},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:w[0],y:w[1],z:w[2]},programUniforms:D}),getShaderSource:L}}}),Iu,Wc,u0=U(()=>{"use strict";X(),nt(),re(),Nt(),Ka(),o0(),Ya(),Iu=(e,t,r,i,a=!1,n,s=4,u=4,d=4,p="f32")=>{let m=D=>{switch(D){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${D} is not supported.`)}},h=D=>{switch(D){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${D} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,_=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,y=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",$=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",S=e?"row":"col",v=e?"col":"row",w=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${S} / outWidth;
    let outCol = ${S} % outWidth;

    let WRow = ${v} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${v} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${v} % inChannels;
    var resData = ${Ee(s,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${y} && xCol >= 0 && xCol < ${$}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${m(s)}
    }
    return resData;`,I=e?t&&i?`
    let col = colIn * ${s};
    ${w}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${w}
    }
    return ${Ee(s,p)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${w}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${w}
    }
    return ${Ee(s,p)}(0.0);`,k=e?i&&r?h(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${h(u)}
    }
    return ${Ee(u,p)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${h(u)}
    }
    return ${Ee(u,p)}(0.0);`,E=Ee(d,p),C=Ee(e?s:u,p),O=Ee(e?u:s,p),x=At(n,E,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?I:k}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${O} {
      ${e?k:I}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${d};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${_}
      ${Pc(a)}
      ${x}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},Wc=(e,t,r,i,a,n,s,u,d)=>{let p=t.format==="NHWC",m=p?e[0].dims[3]:e[0].dims[1],h=r[0],g=p?r[2]:r[3],_=p?r[1]:r[2],y=p?r[3]:r[1],$=p&&(m%4===0||m%3===0)&&y%4===0,S=p?y:g*_,v=p?g*_:y,w=[8,8,1],I=i<=8?[4,1,1]:[4,4,1],k=[Math.ceil(S/w[0]/I[0]),Math.ceil(v/w[1]/I[1]),Math.ceil(h/w[2]/I[2])];ue("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${k}`);let E=$?p&&m%4!==0?3:4:1,C=w[1]*I[1],O=w[0]*I[0],x=Math.max(w[0]*E,w[1]),D=i%C===0,W=a%O===0,Z=n%x===0,L=$?[E,4,4]:[1,1,1],K=[{type:6,data:i},{type:6,data:a},{type:6,data:n},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Ot(t,K),K.push(...Q(e[0].dims,e[1].dims));let se=["rank","rank"];s&&(K.push(...Q(e[2].dims)),se.push("rank")),K.push(...Q(r));let A=P=>{let ee=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Rt(t,ee);let Y=$?4:1,F=ke(e[0].dataType),le=`
      fn setOutputAtIndex(flatIndex : i32, value : ${$?`vec4<${F}>`:F}) {
        result[flatIndex] = ${$?`vec4<${F}>`:F}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${$?`vec4<${F}>`:F}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${$?"/ 4":""}, value);
      }`,M=N("x",e[0].dataType,e[0].dims.length,E===3?1:E),V=N("w",e[1].dataType,e[1].dims.length,Y),J=[M,V],de=H("result",e[0].dataType,r.length,Y);if(s){let Te=N("bias",e[2].dataType,e[2].dims.length,Y);J.push(Te),le+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${$?`vec4<${F}>`:F} {
          return bias[coords.${p?"w":"y"}${$?"/ 4":""}];
        }`}return`
        ${qc("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${P.registerUniforms(ee).declareVariables(...J,de)}
        ${le}
        ${Iu(p,D,W,Z,s,t,L[0],L[1],L[2],F)}
        ${$?Sa(I,w,F,void 0,!p,x):Ta(I,w,F,void 0,!p,x,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${E};${$};${D};${W};${Z};${C};${O};${x}`,inputDependencies:se},getRunData:()=>({outputs:[{dims:d?d(r):r,dataType:e[0].dataType}],dispatchGroup:{x:k[0],y:k[1],z:k[2]},programUniforms:K}),getShaderSource:A}}}),Eu,Li,Jt,zu,Vi,Cu,Lc,Vc,l0=U(()=>{"use strict";X(),nt(),te(),re(),Nt(),Ka(),Eu=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Li=e=>typeof e=="number"?[e,e,e]:e,Jt=(e,t)=>t<=1?e:e+(e-1)*(t-1),zu=(e,t,r,i=1)=>{let a=Jt(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},Vi=(e,t,r,i,a)=>{a==null&&(a=zu(e,t[0],i[0]));let n=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*a>=t[s]&&(n[s]=Math.trunc((e[s]-t[s]+2*a)/i[s]+1));return n},Cu=(e,t,r,i,a,n,s,u,d,p)=>{let m,h,g,_;if(e==="VALID"&&(e=0),typeof e=="number"){m={top:e,bottom:e,left:e,right:e,front:e,back:e};let y=Vi([t,r,i,1],[u,d,p],1,[a,n,s],e);h=y[0],g=y[1],_=y[2]}else if(Array.isArray(e)){if(!e.every(($,S,v)=>$===v[0]))throw Error(`Unsupported padding parameter: ${e}`);m={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let y=Vi([t,r,i,1],[u,d,p],1,[a,n,s],e[0]);h=y[0],g=y[1],_=y[2]}else if(e==="SAME_UPPER"){h=Math.ceil(t/a),g=Math.ceil(r/n),_=Math.ceil(i/s);let y=(h-1)*a+u-t,$=(g-1)*n+d-r,S=(_-1)*s+p-i,v=Math.floor(y/2),w=y-v,I=Math.floor($/2),k=$-I,E=Math.floor(S/2),C=S-E;m={top:I,bottom:k,left:E,right:C,front:v,back:w}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:m,outDepth:h,outHeight:g,outWidth:_}},Lc=(e,t,r,i,a,n=!1,s="channelsLast")=>{let u,d,p,m,h;if(s==="channelsLast")[u,d,p,m,h]=e;else if(s==="channelsFirst")[u,h,d,p,m]=e;else throw new Error(`Unknown dataFormat ${s}`);let[g,,_,y,$]=t,[S,v,w]=Li(r),[I,k,E]=Li(i),C=Jt(_,I),O=Jt(y,k),x=Jt($,E),{padInfo:D,outDepth:W,outHeight:Z,outWidth:L}=Cu(a,d,p,m,S,v,w,C,O,x),K=n?g*h:g,se=[0,0,0,0,0];return s==="channelsFirst"?se=[u,K,W,Z,L]:s==="channelsLast"&&(se=[u,W,Z,L,K]),{batchSize:u,dataFormat:s,inDepth:d,inHeight:p,inWidth:m,inChannels:h,outDepth:W,outHeight:Z,outWidth:L,outChannels:K,padInfo:D,strideDepth:S,strideHeight:v,strideWidth:w,filterDepth:_,filterHeight:y,filterWidth:$,effectiveFilterDepth:C,effectiveFilterHeight:O,effectiveFilterWidth:x,dilationDepth:I,dilationHeight:k,dilationWidth:E,inShape:e,outShape:se,filterShape:t}},Vc=(e,t,r,i,a,n)=>{let s=n==="channelsLast",u=s?e[0].dims[3]:e[0].dims[1],d=!1,p=[64,1,1],m={x:r.map((w,I)=>I)},h=[Math.ceil(Eu(m.x.map(w=>r[w]))/p[0]),1,1];ue("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${h}`);let g=d?s&&u%4!==0?3:4:1,_=R.size(r),y=[{type:12,data:_},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Ot(t,y),y.push(...Q(e[0].dims,e[1].dims));let $=["rank","rank"],S=e.length===3;S&&(y.push(...Q(e[2].dims)),$.push("rank")),y.push(...Q(r));let v=w=>{let I=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Rt(t,I);let k=d?4:1,E=ke(e[0].dataType),C=N("x",e[0].dataType,e[0].dims.length,g===3?1:g),O=N("W",e[1].dataType,e[1].dims.length,k),x=[C,O],D=H("result",e[0].dataType,r.length,k),W="";if(S){let K=N("bias",e[2].dataType,e[2].dims.length,k);x.push(K),W+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${d?`vec4<${E}>`:E} {
          return bias[${s?j("coords",4,5):j("coords",1,5)}${d?"/ 4":""}];
        }`}let Z=Ee(g,E),L=At(t,Z,E);return`
            ${W}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${C.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${O.getByIndices("aIndices")};
            }
          ${w.registerUniforms(I).declareVariables(...x,D)}
          ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${D.offsetToIndices("global_idx")};
              let batch = ${j("coords",0,C.rank)};
              let d2 = ${s?j("coords",C.rank-1,C.rank):j("coords",1,C.rank)};
              let xFRCCorner = vec3<u32>(${s?j("coords",1,C.rank):j("coords",2,C.rank)},
              ${s?j("coords",2,C.rank):j("coords",3,C.rank)},
              ${s?j("coords",3,C.rank):j("coords",4,C.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?j("uniforms.x_shape",1,C.rank):j("uniforms.x_shape",2,C.rank)};
              let xShapeZ = ${s?j("uniforms.x_shape",2,C.rank):j("uniforms.x_shape",3,C.rank)};
              let xShapeW = ${s?j("uniforms.x_shape",3,C.rank):j("uniforms.x_shape",4,C.rank)};
              let xShapeU = ${s?j("uniforms.x_shape",4,C.rank):j("uniforms.x_shape",1,C.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${S?"value = value + getBiasByOutputCoords(coords)":""};
              ${L}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${g};${S}`,inputDependencies:$},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:h[0],y:h[1],z:h[2]},programUniforms:y}),getShaderSource:v}}}),Gc,Hc,d0=U(()=>{"use strict";X(),te(),re(),Nt(),Gc=(e,t,r,i)=>{let a=e.length>2,n=a?"value += b[output_channel];":"",s=e[0].dims,u=e[1].dims,d=t.format==="NHWC",p=d?r[3]:r[1],m=p/t.group,h=d&&m>=4?$e(p):1,g=R.size(r)/h,_=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:m}];Ot(t,_),_.push(...Q(s,[u[0],u[1],u[2],u[3]/h]));let y=a?["rank","rank","rank"]:["rank","rank"];_.push(...Q([r[0],r[1],r[2],r[3]/h]));let $=S=>{let v=H("output",e[0].dataType,r.length,h),w=ke(v.type.tensor),I=At(t,v.type.value,w),k=N("x",e[0].dataType,s.length),E=N("w",e[1].dataType,u.length,h),C=[k,E];a&&C.push(N("b",e[2].dataType,e[2].dims,h));let O=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Rt(t,O);let x=d?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${k.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${E.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${k.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${E.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${S.registerUniforms(O).declareVariables(...C,v)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${v.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${d?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${d?1:2}], outputIndices[${d?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${h} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${d?2:1}];

    var value: ${v.type.value} = ${v.type.value}(0);
    ${x}
    ${n}
    ${I}
    ${v.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${h}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:_}),getShaderSource:$}},Hc=(e,t,r,i)=>{let a=e.length>2,n=$e(r[3]),s=$e(r[2]),u=R.size(r)/n/s,d=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/n],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/n],m=[r[0],r[1],r[2],r[3]/n],h=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Ot(t,h),h.push(...Q(d,p,m));let g=(s-1)*t.strides[1]+p[1],_=y=>{let $=H("output",e[0].dataType,m.length,n),S=ke($.type.tensor),v=At(t,$.type.value,S),w=N("x",e[0].dataType,d.length,n),I=N("w",e[1].dataType,p.length,n),k=[w,I];a&&k.push(N("b",e[2].dataType,e[2].dims,n));let E=a?"value += b[output_channel];":"",C=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Rt(t,C),`
  ${y.registerUniforms(C).declareVariables(...k,$)}
  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${w.type.value}, ${g}>;
    var values: array<${$.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${w.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${w.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${I.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${E}
      ${v}
      ${$.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${n};${s};${g};${p[0]};${p[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:h}),getShaderSource:_}}}),Au,Or,Ou,Rr,ka,Gi,Ru,Bu,Ia,p0=U(()=>{"use strict";te(),u0(),l0(),Ya(),d0(),Nt(),Za(),gt(),Au=(e,t,r,i,a,n)=>{let s=e[0],u=e.slice(n?1:2,n?3:4),d=u.length,p=t[0],m=t.slice(2).map((g,_)=>g+(g-1)*(r[_]-1)),h=u.map((g,_)=>g+i[_]+i[_+d]).map((g,_)=>Math.floor((g-m[_]+a[_])/a[_]));return h.splice(0,0,s),h.splice(n?3:1,0,p),h},Or=[2,3,1,0],Ou=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Rr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let n=2;n<t[1].dims.length;++n)r[n-2]===0&&(r[n-2]=t[1].dims[n]);let i=e.pads.slice();Vr.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},ka=e=>{let t=ja(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,n=e.group,s=e.kernel_shape,u=e.pads,d=e.strides,p=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,pads:u,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Gi=(e,t,r,i)=>{let a=r.format==="NHWC",n=Au(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let C=[t[0]];if(a){let O=e.kernelCustomData.wT??e.compute(Ne(t[1],Or),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=O),C.push(O)}else C.push(t[1]);t.length===3&&C.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Hc(C,r,n,i),{inputs:C}):e.compute(Gc(C,r,n,i),{inputs:C});return}let s=t.length===3,u=t[0].dims[a?1:2],d=t[0].dims[a?2:3],p=t[0].dims[a?3:1],m=t[1].dims[2],h=t[1].dims[3],g=n[a?1:2],_=n[a?2:3],y=n[a?3:1],$=a&&m===u&&h===d&&r.pads[0]===0&&r.pads[1]===0;if($||m===1&&h===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let C=n[0],O,x,D,W=[];if(a){let K=e.kernelCustomData.wT??e.compute(Ne(t[1],Or),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=K),$){let se=u*d*p;O=t[0].reshape([1,C,se]),x=K.reshape([1,se,y]),D=[1,C,y]}else O=t[0].reshape([C,u*d,p]),x=K.reshape([1,p,y]),D=[C,g*_,y];W.push(O),W.push(x)}else O=t[0].reshape([C,p,u*d]),x=t[1].reshape([1,y,p]),D=[C,y,g*_],W.push(x),W.push(O);s&&W.push(t[2]);let Z=D[2],L=W[0].dims[W[0].dims.length-1];Z<8&&L<8?e.compute(Qa(W,r,n,D,a,i),{inputs:W}):e.compute(Hr(W,r,n,D,a,i),{inputs:W});return}let S=!0,v=e.kernelCustomData.wT??e.compute(Ne(t[1],Or),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=v);let w=[t[0],v];s&&w.push(t[2]);let I=a?g*_:y,k=a?y:g*_,E=m*h*p;e.compute(Wc(w,r,n,I,k,E,s,S,i),{inputs:w})},Ru=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],n=[1].concat(t.strides),s=[1].concat(t.dilations),u=[1].concat(t.kernelShape),d=Rr({...t,pads:a,strides:n,dilations:s,kernelShape:u},i);Gi(e,i,d,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},Bu=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Rr(r,t),n=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=Lc(t[0].dims,t[1].dims,r.strides,r.dilations,n,!1,i);e.compute(Vc(t,a,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},Ia=(e,t)=>{if(Ou(e.inputs,t),e.inputs[0].dims.length===3)Ru(e,t);else if(e.inputs[0].dims.length===5)Bu(e,e.inputs,t);else{let r=Rr(t,e.inputs);Gi(e,e.inputs,r)}}}),Fc,c0=U(()=>{"use strict";X(),nt(),te(),re(),Fc=(e,t,r)=>{let i=e.length>2,a=t.outputShape,n=t.format==="NHWC",s=t.group,u=e[1].dims,d=u[2]/s,p=u[3],m=n?$e(d):1,h=n&&p===1&&d>=4,g=h?Math.floor(d/4)*4:Math.floor(d/m)*m,_=d-g,y=n?$e(p):1,$=n?p===1?m:y:1,S=R.size(a)/y,v=[Math.ceil(S/64),1,1];ue("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${v}`);let w=["rank","rank"],I=[t.strides[0],t.strides[1]],k=[t.kernelShape[n?1:2],t.kernelShape[n?2:3]],E=[t.dilations[0],t.dilations[1]],C=[k[0]+(t.dilations[0]<=1?0:(t.kernelShape[n?1:2]-1)*(t.dilations[0]-1)),k[1]+(t.dilations[1]<=1?0:(t.kernelShape[n?2:3]-1)*(t.dilations[1]-1))],O=[C[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),C[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],x=[{type:12,data:S},{type:12,data:I},{type:12,data:k},{type:12,data:E},{type:12,data:C},{type:6,data:O},{type:12,data:g},{type:12,data:d},{type:12,data:p},...Q(e[0].dims,e[1].dims)];i&&(x.push(...Q(e[2].dims)),w.push("rank")),x.push(...Q(a));let D=W=>{let Z=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:I.length},{name:"filter_dims",type:"u32",length:k.length},{name:"dilations",type:"u32",length:k.length},{name:"effective_filter_dims",type:"u32",length:C.length},{name:"pads",type:"i32",length:O.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],L=ke(e[0].dataType),K=n?1:2,se=n?2:3,A=n?3:1,P=N("W",e[1].dataType,e[1].dims.length,$),ee=N("Dy",e[0].dataType,e[0].dims.length,m),Y=[ee,P];i&&Y.push(N("bias",e[2].dataType,[a[A]].length,y));let F=H("result",e[0].dataType,a.length,y),le=()=>{let J="";if(h)m===4?J+=`
        let xValue = ${ee.getByOffset("x_offset")};
        let wValue = ${P.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:m===2?J+=`
          dotProd = dotProd + dot(vec4<${L}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}), vec4<${L}>(${P.getByOffset("w_offset")}, ${P.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:m===1&&(J+=`
          dotProd = dotProd + dot(vec4<${L}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}, ${ee.getByOffset("x_offset + 2u")}, ${ee.getByOffset("x_offset + 3u")}), vec4<${L}>(${P.getByOffset("w_offset")}, ${P.getByOffset("w_offset + 1u")}, ${P.getByOffset("w_offset + 2u")}, ${P.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(J+=`
                  let xValue = ${n?ee.getByOffset(`${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${m}`):ee.get("batch","inputChannel","idyR","idyC")};
        `,m===1)J+=`
          let w_offset = ${P.indicesToOffset(`${P.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${P.getByOffset(`w_offset / ${$}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let de=0;de<m;de++)J+=`
            let wValue${de} = ${P.getByOffset(`${P.indicesToOffset(`${P.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${de}, wOutChannel)`)} / ${$}`)};
            dotProd = dotProd + xValue[${de}] * wValue${de};`;return J},M=()=>{if(_===0)return"";if(!h)throw new Error(`packInputAs4 ${h} is not true.`);let J="";if(m===1){J+="dotProd = dotProd";for(let de=0;de<_;de++)J+=`
            + ${ee.getByOffset(`x_offset + ${de}`)} * ${P.getByOffset(`w_offset + ${de}`)}`;J+=";"}else if(m===2){if(_!==2)throw new Error(`Invalid inputChannelsRemainder ${_}.`);J+=`
          let xValue = ${ee.getByOffset("x_offset")};
          let wValue = ${P.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return J},V=`
            let outputIndices = ${F.offsetToIndices(`global_idx * ${y}`)};
            let batch = ${F.indicesGet("outputIndices",0)};
            let d1 = ${F.indicesGet("outputIndices",A)};
            let r = ${F.indicesGet("outputIndices",K)};
            let c = ${F.indicesGet("outputIndices",se)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${F.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${L}(dyRCorner) + ${L}(wR)) / ${L}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${L}(uniforms.Dy_shape[${K}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${L}(dyCCorner) + ${L}(wC)) / ${L}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${L}(uniforms.Dy_shape[${se}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${h?`
                var x_offset = ${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${m};
                var w_offset = ${P.indicesToOffset(`${P.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${$};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${h?4:m}) {
                  ${le()}
                  inputChannel = inputChannel + ${h?4:m};
                }
                ${M()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${y}]`:""};
            ${F.setByOffset("global_idx","value")};
          `;return`
    ${W.registerUniforms(Z).declareVariables(...Y,F)}
      ${W.mainStart()}
      ${W.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${V}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${m}${$}${y}${h}${_}`,inputDependencies:w},getRunData:()=>({dispatchGroup:{x:v[0],y:v[1],z:v[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:x}),getShaderSource:D}}}),Nu,Mu,Du,Hi,jc,Uu,Fi,Pu,Kc,h0=U(()=>{"use strict";c0(),Nt(),gt(),Nu=(e,t,r,i,a,n)=>(e-1)*t+r+(i-1)*a+1-n,Mu=(e,t,r,i,a)=>{let n=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=n,r[a]=e-n):t==="SAME_LOWER"&&(r[i]=e-n,r[a]=n)},Du=(e,t,r,i,a,n,s,u,d,p)=>{let m=e.length-2,h=p.length===0;d.length<m&&d.push(...Array(m-d.length).fill(0));let g=e[0],_=t[u?3:1]*a;for(let y=0,$=e.length-m-(u?1:0);y<m;++y,++$){let S=e[$],v=h?S*s[y]:p[y],w=Nu(S,s[y],n[y],t[$],r[y],v);Mu(w,i,n,y,y+m),h&&p.push(s[y]*(S-1)+d[y]+(t[$]-1)*r[y]+1-n[y]-n[y+m])}p.splice(0,0,g),p.splice(u?3:1,0,_)},Hi=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((h,g)=>h*g,1)===0){r.length=0;for(let h=2;h<t[1].dims.length;++h)r.push(t[1].dims[h])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),n=e.outputShape.slice(),s=e.outputPadding.slice(),u=t[0].dims,d=e.dilations.slice();if(d.reduce((h,g)=>h+g,0)===0){let h=t[0].dims.length-2;d=new Array(h).fill(1)}let p=e.strides.slice();if(p.reduce((h,g)=>h+g,0)===0){let h=t[0].dims.length-2;p=new Array(h).fill(1)}Du(u,r,d,e.autoPad,e.group,a,p,i,s,n);let m=Object.assign({},e);return Object.assign(m,{kernelShape:r,pads:a,outputPadding:s,outputShape:n,dilations:d,strides:p}),m},jc=e=>{let t=ja(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,n=e.group??1,s=e.kernelShape,u=e.pads,d=e.strides,p=e.wIsConst(),m=e.outputPadding,h=e.outputShape;return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,outputPadding:m,outputShape:h,pads:u,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Uu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.reduce((s,u)=>s+u,0)>0&&t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.reduce((s,u)=>s+u,0)>0&&t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.reduce((s,u)=>s+u,0)>0&&t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.outputPadding.length!==n&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${n}D`);if(t.kernelShape.reduce((s,u)=>s+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},Fi=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(Ne(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let n=[t[0],a];t.length===3&&n.push(t[2]),e.compute(Fc(n,r,i),{inputs:n})},Pu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let n=t.dilations;(n.length===0||n[0]===0)&&(n=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],s=[1].concat(s),n=[1].concat(n),a=[1].concat(a);let d=t.outputPadding;d=[0].concat(d);let p=Hi({...t,pads:u,strides:s,dilations:n,kernelShape:a,outputPadding:d},i);Fi(e,i,p,m=>r?[m[0],m[2],m[3]]:[m[0],m[1],m[3]])},Kc=(e,t)=>{if(Uu(e.inputs,t),e.inputs[0].dims.length===3)Pu(e,t);else{let r=Hi(t,e.inputs);Fi(e,e.inputs,r)}}}),qu,Qc,Zc,f0=U(()=>{"use strict";X(),te(),ve(),re(),qu=(e,t,r,i)=>{let a=R.size(t),n=t.length,s=N("input",e,n),u=H("output",e,n),d=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=R.normalizeAxis(d,n),m=h=>{let g=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,_=j("uniforms.input_shape","uniforms.axis",n),y=i.reverse?g+(i.exclusive?" + 1":""):"0",$=i.reverse?_:g+(i.exclusive?"":" + 1");return`
                ${h.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,u)}
                ${h.mainStart()}
                  ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${y};
                  let last : i32 = ${$};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:p},...Q(t,t)]}),getShaderSource:m}},Qc=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(qu(i,r,a,t),{inputs:[0]})},Zc=e=>{let t=e.exclusive===1,r=e.reverse===1;return he({exclusive:t,reverse:r})}}),Wu,Lu,Vu,Yc,Xc,m0=U(()=>{"use strict";X(),te(),ve(),re(),Wu=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Lu=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let n=0;n<t;++n)a.push(r.indicesSet("a",e[n],`i[${n}]`));return a.push("return a;}"),a.join(`
`)},Vu=(e,t)=>{let r,i,a,n,s,u,d=t.format==="NHWC",p=t.blocksize,m=t.mode==="DCR";d?([r,i,a,n]=e.dims,s=m?[r,i,a,p,p,n/p**2]:[r,i,a,n/p**2,p,p],u=m?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,n]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=m?[r,p,p,n/p**2,i,a]:[r,n/p**2,p,p,i,a],u=m?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let h=e.reshape(s),g=h.dims.length,_=e.dataType,y=N("a",_,g),$=H("output",_,g),S=v=>`
  ${v.registerUniform("output_size","u32").declareVariables(y,$)}

  ${Lu(u,g,y,$)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${$.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${$.setByOffset("global_idx",y.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:v=>{let w=d?[r,i*p,a*p,n/p**2]:[r,n/p**2,i*p,a*p],I=R.size(w),k=h.dims,E=R.sortBasedOnPerm(k,u);return{outputs:[{dims:w,dataType:v[0].dataType}],dispatchGroup:{x:Math.ceil(I/64)},programUniforms:[{type:12,data:I},...Q(k,E)]}},getShaderSource:S}},Yc=(e,t)=>{Wu(e.inputs),e.compute(Vu(e.inputs[0],t))},Xc=e=>he({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Br,er,ji,Gu,Hu,Fu,ju,Ki,Ku,Jc,eh,g0=U(()=>{"use strict";X(),te(),ve(),re(),Br="[a-zA-Z]|\\.\\.\\.",er="("+Br+")+",ji="^"+er+"$",Gu="("+er+",)*"+er,Hu="^"+Gu+"$",Fu=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},ju=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Hu)))throw new Error("Invalid LHS term");if(r.split(",").forEach((a,n)=>{let s=e[n].dims.slice();if(!a.match(RegExp(ji)))throw new Error("Invalid LHS term");let u=this.processTerm(a,!0,s,n);this.lhs.push(u)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([a,n])=>n.count===1||a==="...").map(([a])=>a).join("");else if(!i.match(RegExp(er)))throw new Error("Invalid RHS");i.match(RegExp(Br,"g"))?.forEach(a=>{if(a==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let n=this.symbolToInfo.get(a);if(n===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(n.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,n=!1,s=[],u=0;if(!e.match(RegExp(ji))&&!t&&e!=="")throw new Error("Invalid LHS term");let d=e.match(RegExp(Br,"g")),p=new Fu(i);return d?.forEach((m,h)=>{if(m==="..."){if(n)throw new Error("Only one ellipsis is allowed per input term");n=!0;let g=a-d.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let _=0;_<s.length;_++){let y=String.fromCharCode(48+_);p.addSymbol(y,h+_),this.addSymbol(y,r[u++],i)}}else p.addSymbol(m,h+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(m,r[u++],i)}),p}},Ki=e=>e+"_max",Ku=(e,t,r,i)=>{let a=e.map(p=>p.length).map((p,m)=>N(`input${m}`,t,p)),n=R.size(i),s=H("output",t,i.length),u=[...r.symbolToInfo.keys()].filter(p=>!r.rhs.symbolToIndices.has(p)),d=p=>{let m=[],h="var prod = 1.0;",g="var sum = 0.0;",_="sum += prod;",y=[],$=[],S=[],v=[],w=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((k,E)=>{if(r.rhs.symbolToIndices.has(E)){let C=r.rhs.symbolToIndices.get(E)?.[0];C!==void 0&&r.lhs.forEach((O,x)=>{if(k.inputIndices.includes(x)){let D=O.symbolToIndices.get(E);if(D===void 0)throw new Error("Invalid symbol error");D.forEach(W=>{m.push(`${a[x].indicesSet(`input${x}Indices`,W,s.indicesGet("outputIndices",C))}`)})}})}else r.lhs.forEach((C,O)=>{if(k.inputIndices.includes(O)){let x=C.symbolToIndices.get(E);if(x===void 0)throw new Error("Invalid symbol error");x.forEach(D=>{y.push(`${a[O].indicesSet(`input${O}Indices`,D,`${E}`)}`)}),v.push(`prod *= ${a[O].getByIndices(`input${O}Indices`)};`)}}),$.push(`for(var ${E}: u32 = 0; ${E} < uniforms.${Ki(E)}; ${E}++) {`),S.push("}")});let I=w?[...m,`let sum = ${a.map((k,E)=>k.getByIndices(`input${E}Indices`)).join(" * ")};`]:[...m,g,...$,...y,h,...v,_,...S];return`
            ${p.registerUniforms(u.map(k=>({name:`${Ki(k)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,s)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${a.map((k,E)=>`var input${E}Indices: ${a[E].type.indices};`).join(`
`)}
            ${I.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=u.filter(h=>r.symbolToInfo.has(h)).map(h=>({type:12,data:r.symbolToInfo.get(h)?.dimValue||0}));p.push({type:12,data:n});let m=e.map((h,g)=>[...Q(h)]).reduce((h,g)=>h.concat(g),p);return m.push(...Q(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:m}},getShaderSource:d}},Jc=(e,t)=>{let r=new ju(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((n,s)=>n.dims);e.compute(Ku(a,e.inputs[0].dataType,r,i))},eh=e=>{let t=e.equation.replace(/\s+/g,"");return he({equation:t})}}),Qu,Qi,Zu,Yu,th,y0=U(()=>{"use strict";X(),te(),re(),Qu=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},Qi=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},Zu=(e,t)=>e.length>t.length?Qi(e,t):Qi(t,e),Yu=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=Zu(t,r),a=e[0].dataType,n=a===9||R.size(t)===1,s=a===9||t.length>0&&t[t.length-1]%4===0?4:1,u=n||i.length>0&&i[i.length-1]%4===0?4:1,d=Math.ceil(R.size(i)/u),p=h=>{let g=N("input",a,t.length,s),_=H("output",a,i.length,u),y;if(a===9){let $=(S,v,w="")=>`
          let outputIndices${v} = ${_.offsetToIndices(`outputOffset + ${v}u`)};
          let offset${v} = ${g.broadcastedIndicesToOffset(`outputIndices${v}`,_)};
          let index${v} = offset${v} / 4u;
          let component${v} = offset${v} % 4u;
          ${S}[${v}] = ${w}(${g.getByOffset(`index${v}`)}[component${v}]);
        `;y=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${$("data",0,"u32")}
        ${$("data",1,"u32")}
        ${$("data",2,"u32")}
        ${$("data",3,"u32")}
        ${_.setByOffset("global_idx","data")}
      }`}else y=`
        let outputIndices = ${_.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",_)};
        let data = ${_.type.value}(${g.getByOffset(`inputOffset / ${s}`)});
        ${_.setByOffset("global_idx","data")}
      }`;return`
    ${h.registerUniform("vec_size","u32").declareVariables(g,_)}
    ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${y}`},m=[{type:12,data:d},...Q(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${u}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:m})}},th=e=>{Qu(e.inputs),e.compute(Yu(e.inputs),{inputs:[0]})}}),Xu,rh,_0=U(()=>{"use strict";X(),te(),re(),Fa(),Xu=e=>{let t=e[0].dataType,r=R.size(e[0].dims),i=R.size(e[1].dims),a=i%4===0,n=s=>{let u=N("x",t,[1],4),d=N("bias",t,[1],4),p=H("y",t,[1],4),m=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],h=_=>`
      let bias${_}_offset: u32 = (global_idx * 4 + ${_}) % uniforms.bias_size;
      let bias${_} = ${d.getByOffset(`bias${_}_offset / 4`)}[bias${_}_offset % 4];`,g=a?`
      let bias = ${d.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${h(0)}${h(1)}${h(2)}${h(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(m).declareVariables(u,d,p)}

    ${va(ze(t))}

    ${s.mainStart(Lt)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",xa("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:n,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/Lt/4)}})}},rh=e=>{e.inputs.length<2||R.size(e.inputs[1].dims)===0?vc(e):e.compute(Xu(e.inputs))}}),Ju,el,ih,ah,w0=U(()=>{"use strict";X(),te(),ve(),re(),Ju=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},el=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=R.normalizeAxis(t.axis,a),s=r.slice(0);s.splice(n,1,...i);let u=r[n],d=e[0].dataType===9?4:1,p=Math.ceil(R.size(s)/d),m=[{type:12,data:p},{type:6,data:u},{type:12,data:n},...Q(e[0].dims,e[1].dims,s)],h=g=>{let _=N("data",e[0].dataType,e[0].dims.length,d),y=N("inputIndices",e[1].dataType,e[1].dims.length),$=H("output",e[0].dataType,s.length,d),S=w=>{let I=i.length,k=`var indicesIndices${w}  = ${y.type.indices}(0);`;for(let E=0;E<I;E++)k+=`${I>1?`indicesIndices${w}[${E}]`:`indicesIndices${w}`} = ${s.length>1?`outputIndices${w}[uniforms.axis + ${E}]`:`outputIndices${w}`};`;k+=`
          var idx${w} = ${y.getByIndices(`indicesIndices${w}`)};
          if (idx${w} < 0) {
            idx${w} = idx${w} + uniforms.axisDimLimit;
          }
          var dataIndices${w} : ${_.type.indices};
        `;for(let E=0,C=0;E<a;E++)E===n?(k+=`${a>1?`dataIndices${w}[${E}]`:`dataIndices${w}`} = u32(idx${w});`,C+=I):(k+=`${a>1?`dataIndices${w}[${E}]`:`dataIndices${w}`} = ${s.length>1?`outputIndices${w}[${C}]`:`outputIndices${w}`};`,C++);return k},v;if(e[0].dataType===9){let w=(I,k,E="")=>`
          let outputIndices${k} = ${$.offsetToIndices(`outputOffset + ${k}u`)};
          ${S(k)};
          let offset${k} = ${_.indicesToOffset(`dataIndices${k}`)};
          let index${k} = offset${k} / 4u;
          let component${k} = offset${k} % 4u;
          ${I}[${k}] = ${E}(${_.getByOffset(`index${k}`)}[component${k}]);
        `;v=`
        let outputOffset = global_idx * ${d};
        var value = vec4<u32>(0);
        ${w("value",0,"u32")}
        ${w("value",1,"u32")}
        ${w("value",2,"u32")}
        ${w("value",3,"u32")}
        ${$.setByOffset("global_idx","value")}
      `}else v=`
      let outputIndices = ${$.offsetToIndices("global_idx")};
      ${S("")};
      let value = ${_.getByIndices("dataIndices")};
      ${$.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(_,y,$)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${v}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:m}),getShaderSource:h}},ih=e=>he({axis:e.axis}),ah=(e,t)=>{let r=e.inputs;Ju(r),e.compute(el(e.inputs,t))}}),tl,nh,sh,b0=U(()=>{"use strict";X(),te(),re(),tl=(e,t,r,i,a,n,s,u,d)=>{let p=[{type:12,data:n},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:s},{type:12,data:u},{type:12,data:d}],m=[n];p.push(...Q(t.dims,m));let h=g=>{let _=N("indices_data",t.dataType,t.dims.length),y=H("input_slice_offsets_data",12,1,1),$=[_,y],S=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(S).declareVariables(...$)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:m,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:p}),getShaderSource:h},{inputs:[t],outputs:[-1]})[0]},nh=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,n=r[1].dims,s=n[n.length-1],u=R.sizeToDimension(n,n.length-1),d=R.sizeFromDimension(i,t.batchDims+s),p=R.sizeToDimension(i,t.batchDims),m=R.sizeFromDimension(i,t.batchDims),h=u/p,g=new Array(s),_=d;for(let k=0;k<s;++k)g[s-1-k]=_,_*=i[t.batchDims+s-1-k];let y=tl(e,r[1],g,t.batchDims,i,u,h,m,s),$=t.batchDims+s;if($>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let S=n.slice(0,-1).concat(i.slice($)),v=R.size(S),w=[{type:12,data:v},{type:12,data:d},...Q(r[0].dims,y.dims,S)],I=k=>{let E=N("data",r[0].dataType,r[0].dims.length),C=N("slice_offsets",12,y.dims.length),O=H("output",r[0].dataType,S.length);return`
          ${k.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(E,C,O)}
            ${k.mainStart()}
            ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:S,dataType:a}],dispatchGroup:{x:Math.ceil(v/64)},programUniforms:w}),getShaderSource:I},{inputs:[r[0],y]})},sh=e=>({batchDims:e.batch_dims,cacheKey:""})}),rl,il,oh,uh,$0=U(()=>{"use strict";X(),te(),ve(),re(),rl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=R.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],n=e[2],s=e.length===4?e[3]:void 0;if(n.dims.length!==a.dims.length||!a.dims.map((u,d)=>d===r?Math.ceil(u/i)===n.dims[d]:u===n.dims[d]).reduce((u,d)=>u&&d,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==n.dims.length||!s.dims.map((u,d)=>u===n.dims[d]).reduce((u,d)=>u&&d,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},il=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=R.normalizeAxis(t.gatherAxis,a),s=R.normalizeAxis(t.quantizeAxis,a),u=r.slice(0);u.splice(n,1,...i);let d=R.size(u),p=e[2].dataType,m=e[0].dataType===22,h=[{type:12,data:d},{type:12,data:s},{type:12,data:n},{type:12,data:t.blockSize},...Q(...e.map((_,y)=>_.dims),u)],g=_=>{let y=N("data",e[0].dataType,e[0].dims.length),$=N("inputIndices",e[1].dataType,e[1].dims.length),S=N("scales",e[2].dataType,e[2].dims.length),v=e.length>3?N("zeroPoint",e[3].dataType,e[3].dims.length):void 0,w=H("output",p,u.length),I=[y,$,S];v&&I.push(v);let k=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${_.registerUniforms(k).declareVariables(...I,w)}
        ${_.mainStart()}
        let output_indices = ${w.offsetToIndices("global_idx")};
        var indices_indices = ${$.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${w.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${$.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${w.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${y.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${w.indicesGet("output_indices","i")};
          ${y.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${$.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[n]};
        }
        ${y.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${w.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${y.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${y.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${y.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${m?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${S.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${S.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${S.getByIndices("scale_indices")};
        ${v?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${v.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${v.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${m?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${ze(p)}(quantized_data - zero_point) * scale;
        ${w.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((_,y)=>y!==1).map(_=>_.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(_,y)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:p}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h}),getShaderSource:g}},oh=(e,t)=>{let r=e.inputs;rl(r,t),e.compute(il(e.inputs,t))},uh=e=>he({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),al,nl,lh,dh,v0=U(()=>{"use strict";X(),te(),ve(),re(),al=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},nl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,n=e[1].dims,s=e[1].dataType,u=R.normalizeAxis(t.axis,a),d=r[u],p=n.slice(0),m=R.size(p),h=N("input",i,a),g=N("indicesInput",s,n.length),_=H("output",i,p.length),y=[{type:12,data:m},{type:6,data:d},{type:12,data:u}];return y.push(...Q(r,n,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:y}),getShaderSource:$=>`
      ${$.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(h,g,_)}
      ${$.mainStart()}
      ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${_.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${h.type.indices}(outputIndices);
      ${h.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${h.getByIndices("inputIndices")};

      ${_.setByOffset("global_idx","value")};
  }`}},lh=e=>he({axis:e.axis}),dh=(e,t)=>{let r=e.inputs;al(r),e.compute(nl(e.inputs,t))}}),sl,ol,ph,ch,x0=U(()=>{"use strict";X(),te(),re(),sl=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},ol=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,n,s]=lp.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[a,n];if(!u)throw new Error("Can't use gemm on the given tensors");let d=16,p=Math.ceil(n/d),m=Math.ceil(a/d),h=!0,g=R.size(u),_=[{type:12,data:h?p:g},{type:12,data:a},{type:12,data:n},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],y=["type","type"];e.length===3&&(_.push(...Q(e[2].dims)),y.push("rank")),_.push(...Q(u));let $=v=>{let w="";t.transA&&t.transB?w="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?w="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?w="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(w="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let I=t.alpha===1?"":"value *= uniforms.alpha;",k=N("a",e[0].dataType,e[0].dims),E=N("b",e[1].dataType,e[1].dims),C=k.type.value,O=null,x=[k,E];e.length===3&&(O=N("c",e[2].dataType,e[2].dims.length),x.push(O));let D=H("output",e[0].dataType,u.length);x.push(D);let W=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${v.registerUniforms(W).declareVariables(...x)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${C}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${w}
    }

    ${I}
    ${O!=null?`let cOffset = ${O.broadcastedIndicesToOffset("vec2(m, n)",D)}; value += ${C}(uniforms.beta) * ${O.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},S=v=>{let w=N("a",e[0].dataType,e[0].dims),I=N("b",e[1].dataType,e[1].dims),k=null,E=[w,I];e.length===3&&(k=N("c",e[2].dataType,e[2].dims.length),E.push(k));let C=H("output",e[0].dataType,u.length);E.push(C);let O=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],x="",D="";t.transA&&t.transB?(D=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,x="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(D=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,x="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(D=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,x="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(D=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,x="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let W=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${v.registerUniforms(O).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${w.type.storage}, ${d}>, ${d}>;
  var<workgroup> tile_b: array<array<${I.type.storage}, ${d}>, ${d}>;
  ${v.mainStart([d,d,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${d};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${d};
    let num_tiles = (uniforms.K - 1) / ${d} + 1;
    var k_start = 0u;
    var value = ${C.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${D}
      k_start = k_start + ${d};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${d}; k++) {
        ${x}
      }
      workgroupBarrier();
    }

    ${W}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${k!=null?`let cOffset = ${k.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${C.type.value}(uniforms.beta) * ${k.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return h?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:p*m},programUniforms:_}),getShaderSource:S}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:_}),getShaderSource:$}},ph=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},ch=(e,t)=>{sl(e.inputs),e.compute(ol(e.inputs,t))}}),Ye,it,vt,xt,ul,ll,dl,pl,cl,hl,fl,ml,hh,fh,S0=U(()=>{"use strict";X(),te(),ve(),re(),[Ye,it,vt,xt]=[0,1,2,3],ul=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},ll=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,dl=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,pl=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,cl=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,hl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${Ye}] = batch;
     indices[${it}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${vt}] = u32(r);
            indices[${xt}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${vt}] = u32(clamp(r, 0, H - 1));
          indices[${xt}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${vt}] = gs_reflect(r, border[1], border[3]);
          indices[${xt}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,fl=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${Ye}], indices[${it}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${Ye}], indices[${it}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${Ye}], indices[${it}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${Ye}], indices[${it}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${Ye}], indices[${it}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${Ye}], indices[${it}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,ml=(e,t)=>{let r=N("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=N("grid",e[1].dataType,i.length,2),n=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(n=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[Ye,it,vt,xt]=[0,3,1,2]);let s=H("output",e[0].dataType,n.length),u=r.type.value,d=R.size(n),p=[{type:12,data:d},...Q(e[0].dims,i,n)],m=h=>`
  ${h.registerUniform("output_size","u32").declareVariables(r,a,s)}
  ${ll}
  ${dl(u)}
  ${pl(t)}
  ${cl(t)}
  ${hl(r,u,t)}

  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${vt}]);
      let W_in = i32(uniforms.x_shape[${xt}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${Ye}], indices[${vt}], indices[${xt}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${fl(s,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:h=>{let g=R.size(n);return{outputs:[{dims:n,dataType:h[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:p}},getShaderSource:m}},hh=(e,t)=>{ul(e.inputs),e.compute(ml(e.inputs,t))},fh=e=>he({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),Ce,gl,mh,Zi,yl,ur,gh,yh=U(()=>{"use strict";X(),te(),ve(),La(),Ha(),re(),gt(),Ce=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,gl=(e,t)=>{let r=e[0],i=Ce(e,1),a=Ce(e,2),n=Ce(e,3),s=Ce(e,4),u=Ce(e,5),d=Ce(e,6),p=Ce(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let m=r.dims[0],h=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],_=h,y=0,$=0,S=Math.floor(g/t.numHeads);if(d&&p&&R.size(d.dims)&&R.size(p.dims)){if(d.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(d.dims[0]!==m||d.dims[1]!==t.numHeads||d.dims[3]!==S)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==m||p.dims[1]!==t.numHeads||p.dims[3]!==S)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[2]!==p.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');y=d.dims[2],$=d.dims[2]}else if(d&&R.size(d.dims)||p&&R.size(p.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v;if(i&&R.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');v=2,_=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==S)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');v=5,_=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==S)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');v=0,_=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}if(n&&R.size(n.dims)>0){if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let w=y+_,I=0;if(s&&R.size(s.dims)>0){I=8;let O=s.dims;throw O.length===1?O[0]===m?I=1:O[0]===3*m+2&&(I=3):O.length===2&&O[0]===m&&O[1]===w&&(I=5),I===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let k=!1,E=g;if(a&&R.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(_!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');E=a.dims[2]}else{if(_!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');E=a.dims[1]*a.dims[3],k=!0}}let C=!1;if(s&&R.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(u&&R.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==m||u.dims[1]!==t.numHeads||u.dims[2]!==h||u.dims[3]!==w)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:m,sequenceLength:h,pastSequenceLength:y,kvSequenceLength:_,totalSequenceLength:w,maxSequenceLength:$,inputHiddenSize:0,hiddenSize:g,vHiddenSize:E,headSize:S,vHeadSize:Math.floor(E/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:I,scale:t.scale,broadcastResPosBias:C,passPastInKv:k,qkvFormat:v}},mh=e=>he({...e}),Zi=he({perm:[0,2,1,3]}),yl=(e,t,r,i,a,n,s)=>{let u=[i,a,n],d=R.size(u),p=[{type:12,data:d},{type:12,data:s},{type:12,data:n}],m=h=>{let g=H("qkv_with_bias",t.dataType,u),_=N("qkv",t.dataType,u),y=N("bias",r.dataType,u),$=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${h.registerUniforms($).declareVariables(_,y,g)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p}),getShaderSource:m},{inputs:[t,r],outputs:[-1]})[0]},ur=(e,t,r,i,a,n,s,u)=>{let d=n;if(s&&R.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return d=yl(e,n,s,t,i,r*a,u),d=d.reshape([t,i,r,a]),r===1||i===1?d:e.compute(Ne(d,Zi.perm),{inputs:[d],outputs:[-1]})[0]}else return n.dims.length===3&&(d=n.reshape([t,i,r,a])),r===1||i===1?d:e.compute(Ne(d,Zi.perm),{inputs:[d],outputs:[-1]})[0]},gh=(e,t)=>{let r=gl(e.inputs,t),i=e.inputs[0],a=Ce(e.inputs,1),n=Ce(e.inputs,2),s=Ce(e.inputs,3),u=Ce(e.inputs,4),d=Ce(e.inputs,5),p=Ce(e.inputs,6),m=Ce(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if(a?.dims.length===5)throw new Error("Packed KV is not implemented");let h=a&&n&&a.dims.length===4&&n.dims.length===4,g=ur(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(h)return pr(e,g,a,n,u,void 0,p,m,d,r);if(!a||!n)throw new Error("key and value must be provided");let _=ur(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,s,r.hiddenSize),y=ur(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,n,s,2*r.hiddenSize);pr(e,g,_,y,u,void 0,p,m,d,r)}}),_l,wl,bl,$l,Ea,_h,wh,bh=U(()=>{"use strict";X(),te(),ve(),re(),_l=e=>{if(!e||e.length<1)throw new Error("too few inputs")},wl=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),he({numOutputs:i,axis:t.axis,splitSizes:r})},bl=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${j("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,$l=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Ea=(e,t)=>{let r=e[0].dims,i=R.size(r),a=e[0].dataType,n=R.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),u=N("input",a,r.length),d=new Array(t.numOutputs),p=[],m=[],h=0,g=[{type:12,data:i}];for(let y=0;y<t.numOutputs;y++){h+=t.splitSizes[y],d[y]=h;let $=r.slice();$[n]=t.splitSizes[y],m.push($),s[y]=H(`output${y}`,a,$.length),p.push({dims:m[y],dataType:e[0].dataType})}g.push({type:12,data:d},...Q(r,...m));let _=y=>`
  ${y.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",d.length).declareVariables(u,...s)}
  ${bl(d.length)}
  ${$l(s)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",n)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${j("uniforms.size_in_split_axis","output_number - 1u",d.length)};
      ${u.indicesSet("indices",n,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:_,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},_h=(e,t)=>{_l(e.inputs);let r=e.inputs.length===1?t:wl(e.inputs,t);e.compute(Ea(e.inputs,r),{inputs:[0]})},wh=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return he({axis:t,numOutputs:i,splitSizes:r})}}),vl,Fr,$h,vh=U(()=>{"use strict";X(),te(),ve(),re(),vl=(e,t)=>{let[r,i,a,n]=e,{numHeads:s,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!R.areEqual(i.dims,[])&&!R.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(!R.areEqual(a.dims,n.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let d=r.dims[0],p=r.dims[r.dims.length-2],m=a.dims[0],h=R.sizeFromDimension(r.dims,1)/p,g=u===0?a.dims[1]*2:h/s;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(d!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(p!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(g/2!==a.dims[1]&&u/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`);if(p>m)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported")},Fr=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:n}=t,s=e[0].dims[0],u=R.sizeFromDimension(e[0].dims,1),d=e[0].dims[e[0].dims.length-2],p=u/d,m=e[2].dims[1],h=a===0?m*2:p/i,g=new Array(s,d,p/h,h-m),_=R.computeStrides(g),y=[{type:1,data:n},{type:12,data:g},{type:12,data:_},...e[0].dims.length===3?new Array({type:12,data:[u,p,h,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,h,d*h,1]}):[],...Q(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],$=S=>{let v=N("input",e[0].dataType,e[0].dims.length),w=N("position_ids",e[1].dataType,e[1].dims.length),I=N("cos_cache",e[2].dataType,e[2].dims.length),k=N("sin_cache",e[3].dataType,e[3].dims.length),E=H("output",e[0].dataType,e[0].dims.length);return S.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:_.length},{name:"input_output_strides",type:"u32",length:_.length}]),`
        ${S.declareVariables(v,w,I,k,E)}

        ${S.mainStart(Lt)}
          let half_rotary_emb_dim = uniforms.${I.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${w.broadcastedIndicesToOffset("bsnh.xy",H("",w.type.tensor,2))};
            let position_id =
                u32(${w.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${v.getByOffset("i")} * ${I.get("position_id","bsnh[3]")} -
                ${v.getByOffset("j")} * ${k.get("position_id","bsnh[3]")};
            ${E.setByOffset("i","re")}
            let im = ${v.getByOffset("i")} * ${k.get("position_id","bsnh[3]")} +
                ${v.getByOffset("j")} * ${I.get("position_id","bsnh[3]")};
            ${E.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k",v.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:he({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:$,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(R.size(g)/Lt)},programUniforms:y})}},$h=(e,t)=>{vl(e.inputs,t),e.compute(Fr(e.inputs,t))}}),xl,Sl,Yi,Tl,xh,T0=U(()=>{"use strict";ve(),X(),Ha(),yh(),bh(),gt(),vh(),re(),xl=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,d=r.dims[0],p=r.dims[1],m=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],h=p,g=0,_=!i||i.dims.length===0,y=Math.floor(_?m/(t.numHeads+2*t.kvNumHeads):m/t.numHeads);_&&(m=y*t.numHeads);let $=n&&n.dims.length!==0,S=s&&s.dims.length!==0;if($&&n.dims.length===4&&n.dims[0]===d&&n.dims[1]!==t.kvNumHeads&&n.dims[2]===t.kvNumHeads&&n.dims[3]===y)throw new Error("BSNH pastKey/pastValue is not supported");if($&&S){if(n.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=n.dims[2]}else if($||S)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');h=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==y)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');h=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==y)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');h=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}let w=0,I=!1,k=t.kvNumHeads?y*t.kvNumHeads:m;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(h!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');k=a.dims[2]}else{if(h!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');k=a.dims[1]*a.dims[3],I=!0}}let E=e.length>4?e[5]:void 0;if(E&&E.dims.length!==1&&E.dims[0]!==d)throw new Error('Input "seqlens" is expected to have 1 dimension and the same dim 0 as batch_size');return{batchSize:d,sequenceLength:p,pastSequenceLength:g,kvSequenceLength:h,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:m,vHiddenSize:k,headSize:y,vHeadSize:Math.floor(k/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:I,qkvFormat:v}},Sl=he({perm:[0,2,1,3]}),Yi=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(Ne(i,Sl.perm),{inputs:[i],outputs:[-1]})[0]),i},Tl=(e,t,r,i)=>{let a=7,n=["type","type"],s=[e*t],u=e*t,d=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],p=m=>{let h=N("seq_lens",r.dataType,r.dims),g=N("total_seq_lens",i.dataType,i.dims),_=H("pos_ids",a,s),y=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${m.registerUniforms(y).declareVariables(h,g,_)}
  ${m.mainStart()}
    ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${h.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${_.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${_.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:n},getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:d}),getShaderSource:p}},xh=(e,t)=>{let r=xl(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,n=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,d=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,m=r.kvNumHeads?r.kvNumHeads:r.numHeads,h=he({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,m*r.headSize,m*r.headSize]}),[g,_,y]=!a&&!n?e.compute(Ea([i],h),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,n],$,S;if(t.doRotary){let k=e.compute(Tl(r.batchSize,r.sequenceLength,d,p),{inputs:[d,p],outputs:[-1]})[0],E=e.inputs[7],C=e.inputs[8],O=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),x=[g,k,E,C],D=[-1];$=e.compute(Fr(x,O),{inputs:x,outputs:D})[0],x.splice(0,1,_);let W=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});S=e.compute(Fr(x,W),{inputs:x,outputs:D})[0]}let v=ur(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?$:g,void 0,0),w=Yi(e,t.doRotary?S:_,r),I=Yi(e,y,r);pr(e,v,w,I,void 0,void 0,s,u,void 0,r,d,p)}}),Xi,kl,Il,Sh,k0=U(()=>{"use strict";X(),te(),gt(),re(),Xi=(e,t,r,i,a,n,s,u)=>{let d=$e(n),p=d===1?"f32":`vec${d}f`,m=d===1?"vec2f":`mat2x${d}f`,h=a*s,g=64;h===1&&(g=256);let _=[a,s,n/d],y=[a,s,2],$=["rank","type","type"],S=[];S.push(...Q(_,y));let v=w=>{let I=N("x",t.dataType,3,d),k=N("scale",r.dataType,r.dims),E=N("bias",i.dataType,i.dims),C=H("output",1,3,2),O=[I,k,E,C];return`
  var<workgroup> workgroup_shared : array<${m}, ${g}>;
  const workgroup_size = ${g}u;
  ${w.declareVariables(...O)}
  ${w.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${I.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${m}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${mt("workgroup_shared[0][0]",d)} / f32(hight * ${d});
      let squared_sum_final = ${mt("workgroup_shared[0][1]",d)} / f32(hight * ${d});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${d};${u};${g}`,inputDependencies:$},getRunData:()=>({outputs:[{dims:y,dataType:1}],dispatchGroup:{x:h},programUniforms:S}),getShaderSource:v},{inputs:[t,r,i],outputs:[-1]})[0]},kl=(e,t,r)=>{let i=t[0].dims,a=i,n=2,s=i[0],u=i[1],d=R.sizeFromDimension(i,n),p=$e(d),m=R.size(a)/p,h=Xi(e,t[0],t[1],t[2],s,d,u,r.epsilon),g=[s,u,d/p],_=[s,u],y=["type","none"],$=S=>{let v=N("x",t[0].dataType,g.length,p),w=N("scale_shift",1,_.length,2),I=H("output",t[0].dataType,g.length,p),k=[v,w,I];return`
  ${S.registerUniform("output_size","u32").declareVariables(...k)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${I.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${w.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${v.getByOffset("global_idx")} * ${I.type.value}(scale_shift.x) + ${I.type.value}(scale_shift.y);
      ${I.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(m/64)},programUniforms:[{type:12,data:m},...Q(g,_,g)]}),getShaderSource:$},{inputs:[t[0],h]})},Il=(e,t,r)=>{let i=t[0].dims,a=i,n=i[0],s=i[i.length-1],u=R.sizeFromDimension(i,1)/s,d=$e(s),p=R.size(a)/d,m=[{type:12,data:u},{type:12,data:Math.floor(s/d)}],h=["type","type"],g=!1,_=[0,i.length-1];for(let v=0;v<i.length-2;v++)g=g||i[v+1]!==1,_.push(v+1);g=g&&i[i.length-1]!==1;let y=g?e.compute(Ne(e.inputs[0],_),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(v,w)=>i[_[w]])),$=Xi(e,y,t[1],t[2],n,u,s,r.epsilon),S=v=>{let w=ke(t[0].dataType),I=d===1?"vec2f":`mat${d}x2f`,k=O=>{let x=O===0?"x":"y",D=d===1?"f32":`vec${d}f`;switch(d){case 1:return`${w}(${D}(scale.${x}))`;case 2:return`vec2<${w}>(${D}(scale[0].${x}, scale[1].${x}))`;case 4:return`vec4<${w}>(${D}(scale[0].${x}, scale[1].${x}, scale[2].${x}, scale[3].${x}))`;default:throw new Error(`Not supported compoents ${d}`)}},E=N("input",t[0].dataType,t[0].dims,d),C=H("output",t[0].dataType,a,d);return`
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${I}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${C.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${v.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${k(0)}, ${k(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${d}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:m}),getShaderSource:S},{inputs:[t[0],$]})},Sh=(e,t)=>{t.format==="NHWC"?Il(e,e.inputs,t):kl(e,e.inputs,t)}}),El,zl,Th,I0=U(()=>{"use strict";X(),te(),re(),El=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},zl=(e,t,r)=>{let i=t.simplified,a=e[0].dims,n=e[1],s=!i&&e[2],u=a,d=R.normalizeAxis(t.axis,a.length),p=R.sizeToDimension(a,d),m=R.sizeFromDimension(a,d),h=R.size(n.dims),g=s?R.size(s.dims):0;if(h!==m||s&&g!==m)throw new Error(`Size of X.shape()[axis:] == ${m}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${h} and bias size of ${g}`);let _=[];for(let E=0;E<a.length;++E)E<d?_.push(a[E]):_.push(1);let y=$e(m),$=["type","type"],S=[{type:12,data:p},{type:1,data:m},{type:12,data:Math.floor(m/y)},{type:1,data:t.epsilon}];s&&$.push("type");let v=r>1,w=r>2,I=E=>{let C=ke(e[0].dataType),O=[N("x",e[0].dataType,e[0].dims,y),N("scale",n.dataType,n.dims,y)];s&&O.push(N("bias",s.dataType,s.dims,y)),O.push(H("output",e[0].dataType,u,y)),v&&O.push(H("mean_data_output",1,_)),w&&O.push(H("inv_std_output",1,_));let x=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${E.registerUniforms(x).declareVariables(...O)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${wa("f32",y)};
    var mean_square_vector = ${wa("f32",y)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${qt(C,y,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${mt("mean_vector",y)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${mt("mean_square_vector",y)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${qt(C,y,"x[j + offset]")};
      let f32scale = ${qt(C,y,"scale[j]")};
      output[j + offset] = ${O[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${qt(C,y,"bias[j]")}`:""}
      );
    }

    ${v?"mean_data_output[global_idx] = mean":""};
    ${w?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},k=[{dims:u,dataType:e[0].dataType}];return v&&k.push({dims:_,dataType:1}),w&&k.push({dims:_,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${y};${r};${i}`,inputDependencies:$},getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:S}),getShaderSource:I}},Th=(e,t)=>{El(e.inputs),e.compute(zl(e.inputs,t,e.outputCount))}}),Cl,kh,E0=U(()=>{"use strict";te(),Za(),Ya(),Cl=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},kh=e=>{Cl(e.inputs);let t=Wt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(Qa(e.inputs,{activation:""},t));else{let a=t[t.length-2],n=R.size(e.inputs[0].dims.slice(0,-2)),s=R.size(e.inputs[1].dims.slice(0,-2));if(n!==1&&a===1&&s===1){let u=e.inputs[0].reshape([1,n,i]),d=e.inputs[1].reshape([1,i,r]),p=[1,n,r],m=[u,d];e.compute(Hr(m,{activation:""},t,p),{inputs:m})}else e.compute(Hr(e.inputs,{activation:""},t))}}}),Al,Ol,Rl,Ih,Eh,z0=U(()=>{"use strict";X(),te(),ve(),re(),Al=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),n=t.blockSize/8*t.bits,s=e[1];if(!R.areEqual(s.dims,[t.n,a,n]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(R.size(u)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let d=e[3].dims,p=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(R.size(d)!==p)throw new Error("zeroPoints input size error.")}},Ol=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),d=R.size(u),p=e[1].dims[2]/4,m=e[0].dataType,h=$e(t.k),g=$e(p),_=$e(s),y=u.concat([a,s]),$=a>1&&s/_%2===0?2:1,S=R.size(y)/_/$,v=64,w=[],I=[d,a,n/h],k=R.convertShape(e[1].dims).slice();k.splice(-1,1,p/g),w.push(...Q(I)),w.push(...Q(k)),w.push(...Q(e[2].dims)),e.length===4&&w.push(...Q(R.convertShape(e[3].dims)));let E=[d,a,s/_];w.push(...Q(E));let C=O=>{let x=I.length,D=N("a",e[0].dataType,x,h),W=N("b",12,k.length,g),Z=N("scales",e[2].dataType,e[2].dims.length),L=[D,W,Z],K=e.length===4?N("zero_points",12,e[3].dims.length):void 0;K&&L.push(K);let se=E.length,A=H("output",e[0].dataType,se,_),P=ke(e[0].dataType),ee=(()=>{switch(h){case 1:return`array<${P}, 8>`;case 2:return`mat4x2<${P}>`;case 4:return`mat2x4<${P}>`;default:throw new Error(`${h}-component is not supported.`)}})(),Y=()=>{let M=`
          // reuse a data
            var input_offset = ${D.indicesToOffset(`${D.type.indices}(batch, row, word_offset)`)};
            var a_data: ${ee};
            for (var j: u32 = 0; j < ${8/h}; j++) {
              a_data[j] = ${D.getByOffset("input_offset")};
              input_offset++;
            }
          `;for(let V=0;V<_*$;V++)M+=`
            b_value = ${g===1?`b${V}_data`:`b${V}_data[i]`};
            b_value_lower = unpack4xU8(b_value & b_mask);
            b_value_upper = unpack4xU8((b_value >> 4) & b_mask);
            b_quantized_values = ${ee}(${Array.from({length:4},(J,de)=>`${P}(b_value_lower[${de}]), ${P}(b_value_upper[${de}])`).join(", ")});
            b_dequantized_values = ${h===1?`${ee}(${Array.from({length:8},(J,de)=>`(b_quantized_values[${de}] - ${K?`zero_point${V}`:"zero_point"}) * scale${V}`).join(", ")});`:`(b_quantized_values - ${ee}(${Array(8).fill(`${K?`zero_point${V}`:"zero_point"}`).join(",")})) * scale${V};`};
            workgroup_shared[local_id.x * ${$} + ${Math.floor(V/_)}]${_>1?`[${V%_}]`:""} += ${Array.from({length:8/h},(J,de)=>`${h===1?`a_data[${de}] * b_dequantized_values[${de}]`:`dot(a_data[${de}], b_dequantized_values[${de}])`}`).join(" + ")};
          `;return M},F=()=>{let M=`
            var col_index = col * ${_};
            ${K?`
            let zero_point_bytes_per_col = (nBlocksPerCol + 1) / 2;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${P}(8);`}
            `;for(let V=0;V<_*$;V++)M+=`
            let scale${V} = ${Z.getByOffset("col_index * nBlocksPerCol + block")};
            ${K?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block >> 0x1u);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            zero_point_word = ${K.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${V} = ${P}((zero_point_word) & 0xFu);`:""}
            col_index += 1;`;return M},le=()=>{let M=`col_index = col * ${_};`;for(let V=0;V<_*$;V++)M+=`
            let b${V}_data = ${W.getByIndices(`${W.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return M+=`
            var b_value: u32;
            let b_mask: u32 = 0x0F0F0F0Fu;
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${ee};
            var b_dequantized_values: ${ee};`,M};return`
        var<workgroup> workgroup_shared: array<${A.type.value}, ${$*v}>;
        ${O.declareVariables(...L,A)}
        ${O.mainStart([v,1,1])}
          let output_indices = ${A.offsetToIndices(`(global_idx / ${v}) * ${$}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${v}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/h};
            ${F()}
            for (var word: u32 = 0; word < ${p}; word += ${g}) {
              ${le()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${Y()}
                word_offset += ${8/h};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${$}) {
            var output_value: ${A.type.value} = ${A.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${v}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${$};
            }
            ${A.setByIndices(`${A.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${h};${g};${_};${$};${v}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:m}],dispatchGroup:{x:S},programUniforms:w}),getShaderSource:C}},Rl=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),d=R.size(u),p=e[1].dims[2]/4,m=e[0].dataType,h=$e(t.k),g=$e(p),_=u.concat([a,s]),y=128,$=s%8===0?8:s%4===0?4:1,S=y/$,v=S*g*8,w=v/h,I=v/t.blockSize,k=R.size(_)/$,E=[],C=[d,a,n/h],O=R.convertShape(e[1].dims).slice();O.splice(-1,1,p/g),E.push(...Q(C)),E.push(...Q(O)),E.push(...Q(e[2].dims)),e.length===4&&E.push(...Q(R.convertShape(e[3].dims)));let x=[d,a,s];E.push(...Q(x));let D=W=>{let Z=C.length,L=N("a",e[0].dataType,Z,h),K=N("b",12,O.length,g),se=N("scales",e[2].dataType,e[2].dims.length),A=[L,K,se],P=e.length===4?N("zero_points",12,e[3].dims.length):void 0;P&&A.push(P);let ee=x.length,Y=H("output",e[0].dataType,ee),F=ke(e[0].dataType),le=()=>{switch(h){case 1:return`
          let a_data0 = vec4<${F}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${F}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${F}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${F}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${h}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${L.type.value}, ${w}>;
        var<workgroup> inter_results: array<array<${Y.type.value}, ${S}>, ${$}>;
        ${W.declareVariables(...A,Y)}
        ${W.mainStart([S,$,1])}
          let output_indices = ${Y.offsetToIndices(`workgroup_index * ${$}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${I} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${w};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${w}; a_offset += ${y})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${L.getByIndices(`${L.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${L.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${I} + local_id.x;
            ${P?`
            let zero_point_bytes_per_col = (n_blocks_per_col + 1) / 2;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block >> 0x1u);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            let zero_point_word = ${P.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${F}((zero_point_word) & 0xFu);`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${F}(8);`}
            let scale = ${se.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${K.getByIndices(`${K.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/h};
            for (var i: u32 = 0; i < ${g}; i++) {
              ${le()}
              let b_value = ${g===1?"b_data":"b_data[i]"};
              let b_value_lower = unpack4xU8(b_value & 0x0F0F0F0Fu);
              let b_value_upper = unpack4xU8((b_value >> 4) & 0x0F0F0F0Fu);
              let b_quantized_values = mat2x4<${F}>(${Array.from({length:4},(M,V)=>`${F}(b_value_lower[${V}]), ${F}(b_value_upper[${V}])`).join(", ")});
              let b_dequantized_values = (b_quantized_values - mat2x4<${F}>(${Array(8).fill("zero_point").join(",")})) * scale;
              inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(M,V)=>`${`dot(a_data${V}, b_dequantized_values[${V}])`}`).join(" + ")};
              word_offset += ${8/h};
            }
            workgroupBarrier();
          }

          if (local_idx < ${$}) {
            var output_value: ${Y.type.value} = ${Y.type.value}(0);
            for (var b = 0u; b < ${S}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${Y.setByIndices(`${Y.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${h};${g};${S};${$}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:m}],dispatchGroup:{x:k},programUniforms:E}),getShaderSource:D}},Ih=(e,t)=>{Al(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Rl(e.inputs,t)):e.compute(Ol(e.inputs,t))},Eh=e=>he(e)}),Bl,Nl,Ml,Dl,Ul,Pl,ql,Wl,zh,C0=U(()=>{"use strict";X(),te(),re(),Bl=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Nl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${j("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${j("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${j("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},Ml=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${j("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${j("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${j("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${j("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Dl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${j("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${j("uniforms.x_shape",a,t)})) {
                  k = i32(${j("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${j("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Ul=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${j("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${j("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${j("uniforms.x_shape",a,t)})) {
                  k -= i32(${j("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${j("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Pl=(e,t,r)=>{switch(r.mode){case 0:return Nl(e,t,r.pads.length);case 1:return Ml(e,t,r.pads.length);case 2:return Dl(e,t,r.pads.length);case 3:return Ul(e,t,r.pads.length);default:throw new Error("Invalid mode")}},ql=(e,t)=>{let r=R.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=R.size(r),n=[{type:12,data:a},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&n.push({type:s?e[2].dataType:1,data:t.value}),n.push(...Q(e[0].dims,r));let u=["rank"],d=p=>{let m=H("output",e[0].dataType,r.length),h=N("x",e[0].dataType,i.length),g=h.type.value,_=Pl(m,i.length,t),y=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&y.push({name:"constant_value",type:s?g:"f32"}),`
            ${p.registerUniforms(y).declareVariables(h,m)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${m.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${_}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(R.size(r)/64)},programUniforms:n}),getShaderSource:d}},Wl=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,n=new Int32Array(2*a).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let d=0;d<u.length;d++)n[Number(u[d])]=Number(r[d]),n[Number(u[d])+a]=Number(r[d+u.length])}else r.forEach((u,d)=>n[Number(d)]=Number(u));let s=[];return n.forEach(u=>s.push(u)),{mode:t.mode,value:i,pads:s}}else return t},zh=(e,t)=>{Bl(e.inputs);let r=Wl(e.inputs,t);e.compute(ql(e.inputs,r),{inputs:[0]})}}),tr,Ji,ea,ta,ra,Ll,Vl,ia,aa,Ch,Ah,na,Oh,Rh,sa,Bh,Nh,Mh,Dh,A0=U(()=>{"use strict";Ue(),X(),te(),re(),tr=e=>{if(_e.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},Ji=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let n=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),u=t.strides.slice(),d=n?t.dilations.slice():[],p=t.pads.slice();Vr.adjustPoolAttributes(r,a,s,u,d,p);let m=Vr.computePoolOutputShape(r,a,u,d,s,p,t.autoPad),h=Object.assign({},t);n?Object.assign(h,{kernelShape:s,strides:u,pads:p,dilations:d,cacheKey:t.cacheKey}):Object.assign(h,{kernelShape:s,strides:u,pads:p,cacheKey:t.cacheKey});let g=m.slice();return g.push(g.splice(1,1)[0]),[h,i?g:m]},ea=(e,t)=>{let r=t.format==="NHWC",i=R.size(e),a=R.size(t.kernelShape),n=[{type:12,data:i},{type:12,data:a}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],d=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],m=t.pads[t.pads.length-1],h=!!(p+m);n.push({type:12,data:u},{type:12,data:d},{type:12,data:p},{type:12,data:m}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let _=t.kernelShape[t.kernelShape.length-2],y=t.strides[t.strides.length-2],$=t.pads[t.pads.length/2-2],S=t.pads[t.pads.length-2];g=!!($+S),n.push({type:12,data:_},{type:12,data:y},{type:12,data:$},{type:12,data:S}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[n,s,!0,h,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=R.computeStrides(t.kernelShape);n.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let d=t.pads.reduce((p,m)=>p+m);return[n,s,!!d,!1,!1]}},ta=(e,t,r,i,a,n,s,u,d,p,m,h)=>{let g=a.format==="NHWC",_=t.type.value,y=H("output",t.type.tensor,i);if(a.kernelShape.length<=2){let $="",S="",v="",w=r-(g?2:1);if(m?$=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${w}] < 0 || xIndices[${w}]
                      >= uniforms.x_shape[${w}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`:$=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`,a.kernelShape.length===2){let I=r-(g?3:2);h?S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${I}] < 0 || xIndices[${I}] >= uniforms.x_shape[${I}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                `,v=`
              }
            `}return`
            ${e.registerUniforms(d).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var value = ${_}(${u});
              var pad = 0;
              ${S}
              ${$}
              ${v}
              ${s}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let $=a.kernelShape.length,S=a.pads.length,v="";return p?v=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${n}
              }`:v=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${n}
            `,`
            ${e.registerUniforms(d).declareVariables(t,y)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${y.offsetToIndices("global_idx")};
              var xIndices = ${y.offsetToIndices("global_idx")};

              var offsets: array<u32, ${$}>;

              var value = ${_}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${$-1}u; j++) {
                  offsets[j] = offset / ${j("uniforms.kernelStrides","j",$)};
                  offset -= offsets[j] * ${j("uniforms.kernelStrides","j",$)};
                }
                offsets[${$-1}] = offset;

                isPad = false;
                for (var j = ${r-$}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${j("uniforms.strides",`j - ${r-$}u`,$)}
                    + offsets[j - ${r-$}u] - ${j("uniforms.pads","j - 2u",S)};
                  ${v}
              }
              ${s}

              output[global_idx] = value;
            }`}},ra=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Ll=e=>`${ra(e)};${e.countIncludePad}`,Vl=e=>`${ra(e)};${e.storageOrder};${e.dilations}`,ia=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),aa=(e,t,r,i)=>{let[a,n]=Ji(t,i,r),s=N("x",t.dataType,t.dims.length),u=s.type.value,d="value += x_val;",p="";a.countIncludePad?p+=`value /= ${u}(uniforms.kernelSize);`:p+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[m,h,g,_,y]=ea(n,a);m.push(...Q(t.dims,n));let $=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${_};${y}`,inputDependencies:$},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(R.size(n)/64)},programUniforms:m}),getShaderSource:S=>ta(S,s,t.dims.length,n.length,a,d,p,0,h,g,_,y)}},Ch=e=>{let t=e.count_include_pad!==0,r=ia(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:Ll(i)}},Ah=(e,t)=>{tr(e.inputs),e.compute(aa("AveragePool",e.inputs[0],!1,t))},na={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Oh=e=>{let t=e.format;return{format:t,...na,cacheKey:t}},Rh=(e,t)=>{tr(e.inputs),e.compute(aa("GlobalAveragePool",e.inputs[0],!0,t))},sa=(e,t,r,i)=>{let[a,n]=Ji(t,i,r),s=`
      value = max(x_val, value);
    `,u="",d=N("x",t.dataType,t.dims.length),p=["rank"],[m,h,g,_,y]=ea(n,a);return m.push(...Q(t.dims,n)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${_};${y}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(R.size(n)/64)},programUniforms:m}),getShaderSource:$=>ta($,d,t.dims.length,n.length,a,s,u,t.dataType===10?-65504:-1e5,h,g,_,y)}},Bh=(e,t)=>{tr(e.inputs),e.compute(sa("MaxPool",e.inputs[0],!1,t))},Nh=e=>{let t=e.storage_order,r=e.dilations,i=ia(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:Vl(a)}},Mh=e=>{let t=e.format;return{format:t,...na,cacheKey:t}},Dh=(e,t)=>{tr(e.inputs),e.compute(sa("GlobalMaxPool",e.inputs[0],!0,t))}}),Gl,Hl,Uh,Ph,O0=U(()=>{"use strict";X(),te(),ve(),re(),Gl=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[0].dataType===6&&e.length>2)throw new Error("In the case of dequantizing int32 there is no zero point.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,n)=>n===t.axis||a===e[0].dims[n]).reduce((a,n)=>a&&n,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Hl=(e,t)=>{let r=R.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,n=e[0].dims,s=e[1].dataType,u=R.size(n),d=i===3||i===2,p=d?[Math.ceil(R.size(e[0].dims)/4)]:e[0].dims,m=e[1].dims,h=e.length>2?e[2]:void 0,g=h?d?[Math.ceil(R.size(h.dims)/4)]:h.dims:void 0,_=m.length===0||m.length===1&&m[0]===1,y=_===!1&&m.length===1,$=$e(u),S=_&&(!d||$===4),v=S?$:1,w=S&&!d?$:1,I=N("input",d?12:i,p.length,w),k=N("scale",s,m.length),E=h?N("zero_point",d?12:i,g.length):void 0,C=H("output",s,n.length,v),O=[I,k];E&&O.push(E);let x=[p,m];h&&x.push(g);let D=[{type:12,data:u/v},{type:12,data:r},{type:12,data:t.blockSize},...Q(...x,n)],W=Z=>{let L=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${Z.registerUniforms(L).declareVariables(...O,C)}
      ${Z.mainStart()}
          ${Z.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${C.offsetToIndices("global_idx")};

          // Set input x
          ${d?`
            let input = ${I.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${v===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${I.getByOffset("global_idx")};`};

          // Set scale input
          ${_?`let scale_value= ${k.getByOffset("0")}`:y?`
            let scale_index = ${C.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${k.getByOffset("scale_index")};`:`
            var scale_indices: ${k.type.indices} = output_indices;
            let index = ${k.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${k.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${k.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E?_?d?`
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${E.getByOffset("0")}`:y?d?`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};`:d?`
                let zero_point_offset = ${k.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${E.getByIndices("scale_indices")};`:`let zero_point_value = ${d?a?"i32":"u32":I.type.value}(0);`};
      // Compute and write output
      ${C.setByOffset("global_idx",`${C.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:E?["rank","rank","rank"]:["rank","rank"]},getShaderSource:W,getRunData:()=>({outputs:[{dims:n,dataType:s}],dispatchGroup:{x:Math.ceil(u/v/64),y:1,z:1},programUniforms:D})}},Uh=(e,t)=>{Gl(e.inputs,t),e.compute(Hl(e.inputs,t))},Ph=e=>he({axis:e.axis,blockSize:e.blockSize})}),Fl,jl,qh,R0=U(()=>{"use strict";Ue(),X(),re(),Fl=(e,t,r)=>{let i=e===t,a=e<t&&r<0,n=e>t&&r>0;if(i||a||n)throw new Error("Range these inputs' contents are invalid.")},jl=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),n=[a],s=a,u=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...Q(n)],d=p=>{let m=H("output",i,n.length),h=m.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:h},{name:"delta",type:h}];return`
        ${p.registerUniforms(g).declareVariables(m)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${h}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:d,getRunData:()=>({outputs:[{dims:n,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:u})}},qh=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),_e.webgpu.validateInputContent&&Fl(t,r,i),e.compute(jl(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),Kl,Ql,Wh,Lh,B0=U(()=>{"use strict";X(),te(),ve(),re(),Kl=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,n=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${n}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${n}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${n}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${n}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Ql=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,n=1,s=Math.ceil(R.sizeToDimension(i,i.length-1)/n),u=i[i.length-1],d=R.sizeFromDimension(r,u),p=[{type:12,data:s},{type:12,data:u},{type:12,data:d},...Q(e[1].dims,e[2].dims,a)],m=h=>{let g=N("indices",e[1].dataType,e[1].dims.length),_=N("updates",e[2].dataType,e[2].dims.length,n),y=t.reduction!=="none"&&t.reduction!==""?gp("output",e[0].dataType,a.length):H("output",e[0].dataType,a.length,n);return`
      ${h.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,_,y)}
      ${h.mainStart()}
        ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Kl(t.reduction,"output[data_offset + i]","value",y.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:m}},Wh=e=>he({reduction:e.reduction}),Lh=(e,t)=>{e.compute(Ql(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Zl,Yl,Xl,oa,Jl,ed,td,rd,id,ad,nd,sd,ua,od,ud,ld,dd,pd,Vh,Gh,N0=U(()=>{"use strict";X(),te(),ve(),re(),Zl=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Yl=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,n)=>i[a]=e[n]),i},Xl=(e,t,r,i,a,n)=>{let[s,u,d]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(m=>n.push(m));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(m=>i.push(m)),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Zl(i,t),t.axes.length>0&&Yl(i,t.axes,p).forEach((m,h)=>i[h]=m)}if(d>0&&e.length>d&&e[d].dims.length===1&&e[d].dims[0]>0&&(e[d].getBigInt64Array().forEach(m=>a.push(Number(m))),a.length!==0&&a.length!==p&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>p)throw new Error("Resize requires only of scales or sizes to be specified")},oa=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,Jl=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${oa("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${oa("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",ed=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",td=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((n,s)=>{i[n]=a[s],i[s+r]=a[t.length+s]}),i):a},rd=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(n=>a.push(n)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((n,s)=>a[n]=r[s])}else r.forEach(n=>a.push(n));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((n,s)=>Math.round(n*t[s]))}return a},id=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(n=>t[n]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(n=>t[n]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(n=>t[n]=i),r.axes.forEach(n=>a[n]=Math.round(e[n]*t[n]))):(t.fill(i,0,t.length),a.forEach((n,s)=>a[s]=Math.round(n*t[s]))),a},ad=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${j("uniforms.scales","i",i)};
        var roi_low = ${j("uniforms.roi","i",a)};
        var roi_hi = ${j("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${j("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${j("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,nd=(e,t,r,i,a,n,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${j("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${j("uniforms.roi","i",n)};
          var roi_hi = ${j("uniforms.roi",`i + ${r.length}`,n)};
          var input_shape_i = ${j("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${j("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,sd=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${j("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,ua=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",od=(e,t,r,i,a)=>{let[n,s,u,d]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${ua(e,d,n,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${s}];
      var col:${p} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${n}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},ud=(e,t,r,i,a,n,s,u,d,p)=>{let m=r.length===2,h=!0,[g,_]=m?[0,1]:h?[2,3]:[1,2],y=e.type.value,$=S=>{let v=S===g?"row":"col";return`
      fn ${v}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${y} {
        var output_index = ${t.indicesGet("output_indices",S)};
        var originalIdx: ${y} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[S]},
        ${i[S]}, ${r[S]}, ${n[S]}, ${n[S]} + ${r.length});
        var fractOriginalIdx: ${y} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[S]} - 1))) {
          return ${d};
        }
        var data: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${v}: ${y} = originalIdx + ${y}(i);
          if (${v} < 0 || ${v} >= ${r[S]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${d};`:`${v} = max(0, min(${v}, ${r[S]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",S,`u32(${v})`)};
          data[i + 1] = ${S===g?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${$(g)};
    ${$(_)};
  fn getCubicInterpolationCoefs(s: ${y}) -> array<${y}, 4> {
    var absS = abs(s);
    var coeffs: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${y} = 1.0 - absS;
    var twoMinusAbsS: ${y} = 2.0 - absS;
    var onePlusAbsS: ${y} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${y}, 4>, coefs: array<${y}, 4>) -> ${y} {
    var coefsSum: ${y} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${y} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},ld=(e,t,r,i,a)=>{let[n,s,u,d,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],m=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${m} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",d,`max(0, min(width, ${r[d]} - 1))`)};
      ${ua(e,p,n,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${m} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${m} = originalIndices[${s}];
      var height:${m} = originalIndices[${u}];
      var width:${m} = originalIndices[${d}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[d]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[d]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${n}])`:"0"};

      var x111: ${m} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${m} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${m} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${m} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${m} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${m} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${m} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${m} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${m} = abs(depth - ${m}(depth1));
      var dx2: ${m} = abs(${m}(depth2) - depth);
      var dy1: ${m} = abs(height - ${m}(height1));
      var dy2: ${m} = abs(${m}(height2) - height);
      var dz1: ${m} = abs(width - ${m}(width1));
      var dz2: ${m} = abs(${m}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},dd=(e,t,r,i,a,n)=>{let s=e.dims,u=td(n,t.axes,s.length),d=rd(s,i,a,t.axes),p=i.slice();i.length===0&&(p=s.map((w,I)=>w===0?1:d[I]/w),t.keepAspectRatioPolicy!=="stretch"&&(d=id(s,p,t)));let m=H("output",e.dataType,d.length),h=N("input",e.dataType,s.length),g=R.size(d),_=s.length===d.length&&s.every((w,I)=>w===d[I]),y=t.coordinateTransformMode==="tf_crop_and_resize",$=t.extrapolationValue,S=h.type.value,v=w=>`
      ${_?"":`
      ${Jl(t.coordinateTransformMode,S)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${sd(h,s)};
              ${ed(t.nearestMode,r,S)};
              ${nd(h,m,s,d,p.length,u.length,y)};
              `;case"linear":return`
              ${ad(m,s,d,p.length,u.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${od(h,m,s,y,$)}`;if(s.length===3||s.length===5)return`${ld(h,m,s,y,$)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${ud(h,m,s,d,p,u,t.cubicCoeffA,y,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${w.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",u.length).declareVariables(h,m)}
      ${w.mainStart()}
        ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${_?"output[global_idx] = input[global_idx];":`
        let output_indices = ${m.offsetToIndices("global_idx")};
        var input_indices: ${h.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${h.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${a.length>0?a:""}|${u.length>0?u:""}|${_}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:v,getRunData:()=>({outputs:[{dims:d,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:p},{type:1,data:u},...Q(s,d)]})}},pd=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},Vh=(e,t)=>{let r=[],i=[],a=[],n=pd(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Xl(e.inputs,t,n,r,i,a),e.compute(dd(e.inputs[0],t,n,r,i,a),{inputs:[0]})},Gh=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,n=e.excludeOutside!==0,s=e.extrapolationValue,u=e.keepAspectRatioPolicy,d=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return he({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:n,extrapolationValue:s,keepAspectRatioPolicy:u,mode:d,nearestMode:p})}}),cd,hd,Hh,M0=U(()=>{"use strict";X(),te(),re(),cd=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],n=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==n)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},hd=(e,t,r,i)=>{let a=t.simplified,n=e[0].dims,s=R.size(n),u=n,d=s,p=n.slice(-1)[0],m=i?n.slice(0,-1).concat(1):[],h=!a&&e.length>3,g=e.length>4,_=i&&r>1,y=i&&r>2,$=r>3,S=64,v=$e(p),w=[{type:12,data:d},{type:12,data:v},{type:12,data:p},{type:1,data:t.epsilon}],I=E=>{let C=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],O=[N("x",e[0].dataType,e[0].dims,v),N("skip",e[1].dataType,e[1].dims,v),N("gamma",e[2].dataType,e[2].dims,v)];h&&O.push(N("beta",e[3].dataType,e[3].dims,v)),g&&O.push(N("bias",e[4].dataType,e[4].dims,v)),O.push(H("output",e[0].dataType,u,v)),_&&O.push(H("mean_output",1,m)),y&&O.push(H("inv_std_output",1,m)),$&&O.push(H("input_skip_bias_sum",e[0].dataType,u,v));let x=ke(e[0].dataType),D=ke(1,v);return`

      ${E.registerUniforms(C).declareVariables(...O)}
      var<workgroup> sum_shared : array<${D}, ${S}>;
      var<workgroup> sum_squared_shared : array<${D}, ${S}>;

      ${E.mainStart([S,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${S};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${S};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${S-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":x+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${$?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${qt(x,v,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${S};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${mt("sum",v)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${mt("square_sum",v)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${_?"mean_output[global_idx] = mean;":""}
        ${y?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${x}(mean)`}) *
            ${x}(inv_std_dev) * gamma[offset1d + i]
            ${h?"+ beta[offset1d + i]":""};
        }
      }`},k=[{dims:u,dataType:e[0].dataType}];return r>1&&k.push({dims:m,dataType:1}),r>2&&k.push({dims:m,dataType:1}),r>3&&k.push({dims:n,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${v};${_};${y};${$}`,inputDependencies:e.map((E,C)=>"type")},getShaderSource:I,getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(d/p)},programUniforms:w})}},Hh=(e,t)=>{cd(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(hd(e.inputs,t,e.outputCount,!1),{outputs:r})}}),fd,rr,md,la,gd,yd,Fh,jh,D0=U(()=>{"use strict";X(),te(),ve(),re(),fd=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},rr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},md=(e,t)=>{if(e.length>1){let r=rr(e,1),i=rr(e,2),a=rr(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),he({starts:r,ends:i,axes:a})}else return t},la=(e,t,r,i,a)=>{let n=e;return e<0&&(n+=r[i[t]]),a[t]<0?Math.max(0,Math.min(n,r[i[t]]-1)):Math.max(0,Math.min(n,r[i[t]]))},gd=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${j("uniforms.input_shape","i",r.length)};
            let steps_i = ${j("uniforms.steps","i",r.length)};
            let signs_i = ${j("uniforms.signs","i",r.length)};
            let starts_i = ${j("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,yd=(e,t)=>{let r=e[0].dims,i=R.size(r),a=t.axes.length>0?R.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],n=rr(e,4);n.forEach(v=>v!==0||(()=>{throw new Error("step cannot be 0")})),n.length===0&&(n=Array(a.length).fill(1));let s=t.starts.map((v,w)=>la(v,w,r,a,n)),u=t.ends.map((v,w)=>la(v,w,r,a,n));if(a.length!==s.length||a.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let v=0;v<r.length;++v)a.includes(v)||(s.splice(v,0,0),u.splice(v,0,r[v]),n.splice(v,0,1));let d=n.map(v=>Math.sign(v));n.forEach((v,w,I)=>{if(v<0){let k=(u[w]-s[w])/v,E=s[w],C=E+k*n[w];s[w]=C,u[w]=E,I[w]=-v}});let p=r.slice(0);a.forEach((v,w)=>{p[v]=Math.ceil((u[v]-s[v])/n[v])});let m={dims:p,dataType:e[0].dataType},h=H("output",e[0].dataType,p.length),g=N("input",e[0].dataType,e[0].dims.length),_=R.size(p),y=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:d.length},{name:"steps",type:"u32",length:n.length}],$=[{type:12,data:_},{type:12,data:s},{type:6,data:d},{type:12,data:n},...Q(e[0].dims,p)],S=v=>`
      ${v.registerUniforms(y).declareVariables(g,h)}
        ${gd(g,h,r)}
        ${v.mainStart()}
          ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${h.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${h.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${d.length}_${s.length}_${n.length}`,inputDependencies:["rank"]},getShaderSource:S,getRunData:()=>({outputs:[m],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:$})}},Fh=(e,t)=>{fd(e.inputs,t);let r=md(e.inputs,t);e.compute(yd(e.inputs,r),{inputs:[0]})},jh=e=>{let t=e.starts,r=e.ends,i=e.axes;return he({starts:t,ends:r,axes:i})}}),_d,wd,Kh,Qh,U0=U(()=>{"use strict";X(),te(),ve(),gt(),re(),_d=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},wd=(e,t)=>{let r=e.inputs[0],i=r.dims,a=R.size(i),n=i.length,s=R.normalizeAxis(t.axis,n),u=s<i.length-1,d,p=[];u?(p=Array.from({length:n},(O,x)=>x),p[s]=n-1,p[n-1]=s,d=e.compute(Ne(r,p),{inputs:[r],outputs:[-1]})[0]):d=r;let m=d.dims,h=m[n-1],g=a/h,_=$e(h),y=h/_,$=64;g===1&&($=256);let S=(O,x)=>x===4?`max(max(${O}.x, ${O}.y), max(${O}.z, ${O}.w))`:x===2?`max(${O}.x, ${O}.y)`:x===3?`max(max(${O}.x, ${O}.y), ${O}.z)`:O,v=N("x",d.dataType,d.dims,_),w=H("result",d.dataType,d.dims,_),I=v.type.value,k=ke(d.dataType)==="f32"?`var threadMax = ${I}(-3.4028234663852886e+38f);`:`var threadMax = ${I}(-65504.0h);`,E=O=>`
      var<workgroup> rowMaxShared : ${I};
      var<workgroup> rowSumShared : ${I};
      var<workgroup> threadShared : array<${I}, ${$}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${I} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${I}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${O.registerUniform("packedCols","i32").declareVariables(v,w)}
      ${O.mainStart($)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${$};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${k}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${I}(${S("threadShared[0]",_)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${I}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${I}(${mt("threadShared[0]",_)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${I}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,C=e.compute({name:"Softmax",shaderCache:{hint:`${_};${$}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:m,dataType:d.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:y}]}),getShaderSource:E},{inputs:[d],outputs:[u?-1:0]})[0];u&&e.compute(Ne(C,p),{inputs:[C]})},Kh=(e,t)=>{_d(e.inputs),wd(e,t)},Qh=e=>he({axis:e.axis})}),da,bd,$d,vd,Zh,P0=U(()=>{"use strict";X(),te(),re(),da=e=>Array.from(e.getBigInt64Array(),Number),bd=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(da(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},$d=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},vd=(e,t)=>{let r=e[0].dims,i=t??da(e[1]),a=$d(r,i),n=R.size(a),s=e[0].dataType,u=N("input",s,r.length),d=H("output",s,a.length),p=m=>`
      const inputShape = ${u.indices(...r)};
      ${m.registerUniform("output_size","u32").declareVariables(u,d)}
      ${m.mainStart()}
      ${m.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${d.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${d.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${d.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},...Q(e[0].dims,a)]}),getShaderSource:p}},Zh=e=>{bd(e.inputs),e.compute(vd(e.inputs),{inputs:[0]})}}),xd,Sd,Yh,q0=U(()=>{"use strict";X(),te(),re(),xd=(e,t,r,i,a)=>{let n=H("output_data",a,r.length,4),s=N("a_data",t[1].dataType,t[1].dims.length,4),u=N("b_data",t[2].dataType,t[2].dims.length,4),d=N("c_data",t[0].dataType,t[0].dims.length,4),p,m=(h,g,_)=>`select(${g}, ${h}, ${_})`;if(!i)p=n.setByOffset("global_idx",m(s.getByOffset("global_idx"),u.getByOffset("global_idx"),d.getByOffset("global_idx")));else{let h=(g,_,y="")=>{let $=`a_data[index_a${_}][component_a${_}]`,S=`b_data[index_b${_}][component_b${_}]`,v=`bool(c_data[index_c${_}] & (0xffu << (component_c${_} * 8)))`;return`
            let output_indices${_} = ${n.offsetToIndices(`global_idx * 4u + ${_}u`)};
            let offset_a${_} = ${s.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let offset_b${_} = ${u.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let offset_c${_} = ${d.broadcastedIndicesToOffset(`output_indices${_}`,n)};
            let index_a${_} = offset_a${_} / 4u;
            let index_b${_} = offset_b${_} / 4u;
            let index_c${_} = offset_c${_} / 4u;
            let component_a${_} = offset_a${_} % 4u;
            let component_b${_} = offset_b${_} % 4u;
            let component_c${_} = offset_c${_} % 4u;
            ${g}[${_}] = ${y}(${m($,S,v)});
          `};a===9?p=`
            var data = vec4<u32>(0);
            ${h("data",0,"u32")}
            ${h("data",1,"u32")}
            ${h("data",2,"u32")}
            ${h("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${h("output_data[global_idx]",0)}
            ${h("output_data[global_idx]",1)}
            ${h("output_data[global_idx]",2)}
            ${h("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(d,s,u,n)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},Sd=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,n=!(R.areEqual(t,r)&&R.areEqual(r,i)),s=t,u=R.size(t);if(n){let p=Wt.calcShape(Wt.calcShape(t,r,!1),i,!1);if(!p)throw new Error("Can't perform where op on the given tensors");s=p,u=R.size(s)}let d=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:p=>xd(p,e,s,n,a),getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:d},...Q(i,t,r,s)]})}},Yh=e=>{e.compute(Sd(e.inputs))}}),Xh,W0=U(()=>{"use strict";t0(),Ha(),r0(),i0(),a0(),n0(),s0(),p0(),h0(),f0(),m0(),g0(),y0(),_0(),w0(),b0(),$0(),v0(),x0(),S0(),T0(),k0(),I0(),E0(),z0(),yh(),C0(),A0(),O0(),R0(),B0(),Ga(),N0(),vh(),M0(),D0(),U0(),bh(),P0(),gt(),Fa(),q0(),Xh=new Map([["Abs",[Hp]],["Acos",[Fp]],["Acosh",[jp]],["Add",[Ic]],["ArgMax",[Wp,$a]],["ArgMin",[qp,$a]],["Asin",[Kp]],["Asinh",[Qp]],["Atan",[Zp]],["Atanh",[Yp]],["Attention",[Lp]],["AveragePool",[Ah,Ch]],["BatchNormalization",[Vp]],["BiasAdd",[Gp]],["BiasSplitGelu",[kc]],["Cast",[Jp,Xp]],["Ceil",[tc]],["Clip",[ec]],["Concat",[Dc,Uc]],["Conv",[Ia,ka]],["ConvTranspose",[Kc,jc]],["Cos",[rc]],["Cosh",[ic]],["CumSum",[Qc,Zc]],["DepthToSpace",[Yc,Xc]],["DequantizeLinear",[Uh,Ph]],["Div",[Ec]],["Einsum",[Jc,eh]],["Elu",[ac,or]],["Equal",[zc]],["Erf",[nc]],["Exp",[sc]],["Expand",[th]],["FastGelu",[rh]],["Floor",[oc]],["FusedConv",[Ia,ka]],["Gather",[ah,ih]],["GatherElements",[dh,lh]],["GatherBlockQuantized",[oh,uh]],["GatherND",[nh,sh]],["Gelu",[uc]],["Gemm",[ch,ph]],["GlobalAveragePool",[Rh,Oh]],["GlobalMaxPool",[Dh,Mh]],["Greater",[Rc]],["GreaterOrEqual",[Nc]],["GridSample",[hh,fh]],["GroupQueryAttention",[xh]],["HardSigmoid",[gc,mc]],["InstanceNormalization",[Sh]],["LayerNormalization",[Th]],["LeakyRelu",[lc,or]],["Less",[Bc]],["LessOrEqual",[Mc]],["Log",[Sc]],["MatMul",[kh]],["MatMulNBits",[Ih,Eh]],["MaxPool",[Bh,Nh]],["Mul",[Cc]],["MultiHeadAttention",[gh,mh]],["Neg",[pc]],["Not",[dc]],["Pad",[zh]],["Pow",[Ac]],["QuickGelu",[Tc,or]],["Range",[qh]],["Reciprocal",[cc]],["ReduceMin",[Np]],["ReduceMean",[Cp]],["ReduceMax",[Bp]],["ReduceSum",[Dp]],["ReduceProd",[Mp]],["ReduceL1",[Ap]],["ReduceL2",[Op]],["ReduceLogSum",[Pp]],["ReduceLogSumExp",[Rp]],["ReduceSumSquare",[Up]],["Relu",[hc]],["Resize",[Vh,Gh]],["RotaryEmbedding",[$h]],["ScatterND",[Lh,Wh]],["Sigmoid",[fc]],["Sin",[yc]],["Sinh",[_c]],["Slice",[Fh,jh]],["SkipLayerNormalization",[Hh]],["Split",[_h,wh]],["Sqrt",[wc]],["Softmax",[Kh,Qh]],["Sub",[Oc]],["Tan",[bc]],["Tanh",[$c]],["ThresholdedRelu",[xc,or]],["Tile",[Zh]],["Transpose",[_p,wp]],["Where",[Yh]]])}),Jh,L0=U(()=>{"use strict";Ue(),nt(),re(),Jh=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){Je(e.programInfo.name);let n=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let p of t)u.push({binding:u.length,resource:{buffer:p.buffer}});for(let p of r)u.push({binding:u.length,resource:{buffer:p.buffer}});a&&u.push({binding:u.length,resource:a});let d=n.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:d,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}s.setPipeline(e.computePipeline),s.setBindGroup(0,d),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),je(e.programInfo.name)}dispose(){}build(e,t){Je(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(p=>{r.features.has(p.feature)&&i.push(`enable ${p.extension};`)});let a=yp(t,this.backend.device.limits),n=e.getShaderSource(a),s=`${i.join(`
`)}
${a.additionalImplementations}
${n}`,u=r.createShaderModule({code:s,label:e.name});ue("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let d=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return je(e.name),{programInfo:e,computePipeline:d,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let n=t*r*i,s=Math.ceil(Math.sqrt(n));if(s>a){if(s=Math.ceil(Math.cbrt(n)),s>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),ef={};Vt(ef,{WebGpuBackend:()=>tf});var Td,kd,Id,tf,V0=U(()=>{"use strict";Ue(),X(),nt(),cp(),Jg(),W0(),L0(),Td=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let n=e[i].dims.length;r.push(`${a};${n}`);break}case"dims":{let n=e[i].dims.join(",");r.push(`${a};${n}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},kd=(e,t,r)=>{let i=e.name;return e.shaderCache?.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${Td(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,i},Id=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},tf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=n=>t.features.has(n)&&r.push(n)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i),this.adapterInfo=new Id(t.info||await t.requestAdapterInfo()),this.gpuDataManager=mp(this),this.programManager=new Jh(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,qa(e.logLevel,!!e.debug),this.device.onuncapturederror=n=>{n.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${n.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!1}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose()}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Je(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let a=r[i],n=a.kernelId,s=this.kernels.get(n),u=s.kernelType,d=s.kernelName,p=a.programName,m=a.inputTensorViews,h=a.outputTensorViews,g=t[i*2],_=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=g);let y=Number(g-this.queryTimeBase),$=Number(_-this.queryTimeBase);if(!Number.isSafeInteger(y)||!Number.isSafeInteger($))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:m.map(S=>({dims:S.dims,dataType:at(S.dataType)})),outputsMetadata:h.map(S=>({dims:S.dims,dataType:at(S.dataType)})),kernelId:n,kernelType:u,kernelName:d,programName:p,startTime:y,endTime:$});else{let S="";m.forEach((w,I)=>{S+=`input[${I}]: [${w.dims}] | ${at(w.dataType)}, `});let v="";h.forEach((w,I)=>{v+=`output[${I}]: [${w.dims}] | ${at(w.dataType)}, `}),console.log(`[profiling] kernel "${n}|${u}|${d}|${p}" ${S}${v}start time: ${y} ns, execution time: ${$-y} ns`)}qr("GPU",`${p}::${g}::${_}`)}e.unmap(),this.pendingQueries.delete(e)}),je()}run(e,t,r,i,a,n){Je(e.name);let s=[];for(let w=0;w<t.length;++w){let I=t[w].data;if(I===0)continue;let k=this.gpuDataManager.get(I);if(!k)throw new Error(`no GPU data for input: ${I}`);s.push(k)}let{outputs:u,dispatchGroup:d,programUniforms:p}=e.getRunData(t),m=r.length===0?u.map((w,I)=>I):r;if(m.length!==u.length)throw new Error(`Output size ${m.length} must be equal to ${u.length}.`);let h=[],g=[];for(let w=0;w<u.length;++w){if(!Number.isInteger(m[w])||m[w]<-3||m[w]>=n)throw new Error(`Invalid output index: ${m[w]}`);if(m[w]===-3)continue;let I=m[w]===-1,k=m[w]===-2,E=I||k?a(u[w].dataType,u[w].dims):i(m[w],u[w].dataType,u[w].dims);if(h.push(E),E.data===0)continue;let C=this.gpuDataManager.get(E.data);if(!C)throw new Error(`no GPU data for output: ${E.data}`);if(I&&this.temporaryData.push(C),k){let O=this.kernelPersistentData.get(this.currentKernelId);O||(O=[],this.kernelPersistentData.set(this.currentKernelId,O)),O.push(C)}g.push(C)}if(s.length!==t.length||g.length!==h.length){if(g.length===0)return je(e.name),h;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let _;if(p){let w=0,I=[];p.forEach(O=>{let x=typeof O.data=="number"?[O.data]:O.data;if(x.length===0)return;let D=O.type===10?2:4,W,Z;O.type===10?(Z=x.length>4?16:x.length>2?8:x.length*D,W=x.length>4?16:D*x.length):(Z=x.length<=2?x.length*D:16,W=16),w=Math.ceil(w/Z)*Z,I.push(w);let L=O.type===10?8:4;w+=x.length>4?Math.ceil(x.length/L)*W:x.length*D});let k=16;w=Math.ceil(w/k)*k;let E=new ArrayBuffer(w);p.forEach((O,x)=>{let D=I[x],W=typeof O.data=="number"?[O.data]:O.data;if(O.type===6)new Int32Array(E,D,W.length).set(W);else if(O.type===12)new Uint32Array(E,D,W.length).set(W);else if(O.type===10)new Uint16Array(E,D,W.length).set(W);else if(O.type===1)new Float32Array(E,D,W.length).set(W);else throw new Error(`Unsupported uniform type: ${at(O.type)}`)});let C=this.gpuDataManager.create(w,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(C.buffer,0,E,0,w),this.gpuDataManager.release(C.id),_={offset:0,size:w,buffer:C.buffer}}let y=this.programManager.normalizeDispatchGroupSize(d),$=y[1]===1&&y[2]===1,S=kd(e,t,$),v=this.programManager.getArtifact(S);if(v||(v=this.programManager.build(e,y),this.programManager.setArtifact(S,v),ue("info",()=>`[artifact] key: ${S}, programName: ${e.name}`)),p&&v.uniformVariablesInfo){if(p.length!==v.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${v.uniformVariablesInfo.length}, got ${p.length} in program "${v.programInfo.name}".`);for(let w=0;w<p.length;w++){let I=p[w],k=I.type,E=typeof I.data=="number"?1:I.data.length,[C,O]=v.uniformVariablesInfo[w];if(k!==C||E!==O)throw new Error(`Uniform variable ${w} mismatch: expect type ${C} with size ${O}, got type ${k} with size ${E} in program "${v.programInfo.name}".`)}}if(ue("info",()=>`[ProgramManager] run "${e.name}" (key=${S}) with ${y[0]}x${y[1]}x${y[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let w={kernelId:this.currentKernelId,programName:v.programInfo.name,inputTensorViews:t,outputTensorViews:h};this.pendingKernels.push(w),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(w)}return this.programManager.run(v,s,g,y,_),je(e.name),h}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=Xh.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let n={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,n)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,n=i.kernelName,s=i.kernelEntry,u=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${n}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),ue("info",()=>`[WebGPU] Start to run kernel "[${a}] ${n}"...`);let d=this.env.debug;this.temporaryData=[];try{return d&&this.device.pushErrorScope("validation"),s(t,u[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${n}" failed. ${p}`)),1}finally{d&&r.push(this.device.popErrorScope().then(p=>p?`GPU validation error for kernel "[${a}] ${n}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let n=a.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,n);return a.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await _a(this,e,t);return Wa(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){ue("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){ue("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){ue("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),n=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(n.computePipeline),a.setBindGroup(0,n.bindGroup),a.dispatchWorkgroups(...n.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),rf={};Vt(rf,{init:()=>af});var Nr,Ed,af,G0=U(()=>{"use strict";X(),nt(),te(),Xg(),Nr=class nf{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=R.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(R.size(t)!==R.size(this.dims))throw new Error("Invalid new shape");return new nf(this.module,this.dataType,this.data,t)}},Ed=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,n=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,n));let s=Number(e.getValue(i*a++,n));this.outputCount=Number(e.getValue(i*a++,n)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,n));let u=[];for(let d=0;d<s;d++){let p=Number(e.getValue(i*a++,n)),m=Number(e.getValue(i*a++,"*")),h=Number(e.getValue(i*a++,n)),g=[];for(let _=0;_<h;_++)g.push(Number(e.getValue(i*a++,n)));u.push(new Nr(e,p,m,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map(s=>typeof s=="number"?this.inputs[s]:s)??this.inputs,i=t?.outputs??[],a=(s,u,d)=>new Nr(this.module,u,this.output(s,d),d),n=(s,u)=>{let d=Et(s,u);if(!d)throw new Error(`Unsupported data type: ${s}`);let p=d>0?this.backend.gpuDataManager.create(d).id:0;return new Nr(this.module,s,p,u)};return this.backend.run(e,r,i,a,n,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",n=this.module.stackAlloc((1+t.length)*i);this.module.setValue(n,t.length,a);for(let s=0;s<t.length;s++)this.module.setValue(n+i*(s+1),t[s],a);return this.module._JsepOutput(this.opKernelContext,e,n)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},af=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let n=(V0(),dr(ef)).WebGpuBackend,s=new n;await s.initialize(r,i),a("webgpu",[s,u=>s.alloc(Number(u)),u=>s.free(u),(u,d,p,m=!1)=>{if(m)ue("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(d)}, size=${Number(p)}`),s.memcpy(Number(u),Number(d));else{ue("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(d)}, size=${Number(p)}`);let h=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(p));s.upload(Number(d),h)}},async(u,d,p)=>{ue("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${d}, size=${p}`),await s.download(Number(u),()=>t.HEAPU8.subarray(Number(d)>>>0,Number(d+p)>>>0))},(u,d,p)=>s.createKernel(u,Number(d),p,t.UTF8ToString(t._JsepGetNodeName(Number(d)))),u=>s.releaseKernel(u),(u,d,p,m)=>{ue("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${p}, kernel=${u}, contextDataOffset=${d}`);let h=new Ed(t,s,Number(d));return s.computeKernel(Number(u),h,m)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let n=new fp(r);a("webnn",[n,()=>n.reserveTensorId(),s=>n.releaseTensorId(s),async(s,u,d,p,m)=>n.ensureTensor(s,u,d,p,m),(s,u)=>{n.uploadTensor(s,u)},async(s,u)=>n.downloadTensor(s,u),(s,u)=>n.registerMLContext(s,u),!!r.trace])}}}),zd,Xa,Ja,ht,Cd,pa,jr,en,tn,ca,rn,an,nn,sf=U(()=>{"use strict";Ue(),Qg(),Zg(),X(),Bt(),Ma(),up(),zd=(e,t)=>{ge()._OrtInit(e,t)!==0&&fe("Can't initialize onnxruntime.")},Xa=async e=>{zd(e.wasm.numThreads,Lr(e.logLevel))},Ja=async(e,t)=>{ge().asyncInit?.();let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let i=e.webgpu.powerPreference;if(i!==void 0&&i!=="low-power"&&i!=="high-performance")throw new Error(`Invalid powerPreference setting: "${i}"`);let a=e.webgpu.forceFallbackAdapter;if(a!==void 0&&typeof a!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${a}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:i,forceFallbackAdapter:a}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let i=(G0(),dr(rf)).init;t==="webgpu"&&await i("webgpu",ge(),e,r),t==="webnn"&&await i("webnn",ge(),e)}},ht=new Map,Cd=e=>{let t=ge(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&fe("Can't get session input/output count.");let n=i===4?"i32":"i64";return[Number(t.getValue(a,n)),Number(t.getValue(a+i,n))]}finally{t.stackRestore(r)}},pa=(e,t)=>{let r=ge(),i=r.stackSave(),a=0;try{let n=r.PTR_SIZE,s=r.stackAlloc(2*n);r._OrtGetInputOutputMetadata(e,t,s,s+n)!==0&&fe("Can't get session input/output metadata.");let u=Number(r.getValue(s,"*"));a=Number(r.getValue(s+n,"*"));let d=r.HEAP32[a/4];if(d===0)return[u,0];let p=r.HEAPU32[a/4+1],m=[];for(let h=0;h<p;h++){let g=Number(r.getValue(a+8+h*n,"*"));m.push(g!==0?r.UTF8ToString(g):Number(r.getValue(a+8+(h+p)*n,"*")))}return[u,d,m]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},jr=e=>{let t=ge(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},en=async(e,t)=>{let r,i,a=ge();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=jr(e);let n=0,s=0,u=0,d=[],p=[],m=[];try{if([s,d]=await op(t),t?.externalData&&a.mountExternalData){let k=[];for(let E of t.externalData){let C=typeof E=="string"?E:E.path;k.push(Pa(typeof E=="string"?E:E.data).then(O=>{a.mountExternalData(C,O)}))}await Promise.all(k)}for(let k of t?.executionProviders??[])if((typeof k=="string"?k:k.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof k!="string"){let E=k,C=E?.context,O=E?.gpuDevice,x=E?.deviceType,D=E?.powerPreference;C?a.currentContext=C:O?a.currentContext=await a.webnnCreateMLContext(O):a.currentContext=await a.webnnCreateMLContext({deviceType:x,powerPreference:D})}else a.currentContext=await a.webnnCreateMLContext();break}n=await a._OrtCreateSession(r,i,s),a.webgpuOnCreateSession?.(n),n===0&&fe("Can't create a session."),a.jsepOnCreateSession?.(),a.currentContext&&(a.webnnRegisterMLContext(n,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[h,g]=Cd(n),_=!!t?.enableGraphCapture,y=[],$=[],S=[],v=[],w=[];for(let k=0;k<h;k++){let[E,C,O]=pa(n,k);E===0&&fe("Can't get an input name."),p.push(E);let x=a.UTF8ToString(E);y.push(x),S.push(C===0?{name:x,isTensor:!1}:{name:x,isTensor:!0,type:at(C),shape:O})}for(let k=0;k<g;k++){let[E,C,O]=pa(n,k+h);E===0&&fe("Can't get an output name."),m.push(E);let x=a.UTF8ToString(E);$.push(x),v.push(C===0?{name:x,isTensor:!1}:{name:x,isTensor:!0,type:at(C),shape:O});{if(_&&t?.preferredOutputLocation===void 0){w.push("gpu-buffer");continue}let D=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[x]??"cpu",W=a.webnnIsGraphOutput;if(D==="cpu"&&W&&W(n,x)){w.push("ml-tensor-cpu-output");continue}if(D!=="cpu"&&D!=="cpu-pinned"&&D!=="gpu-buffer"&&D!=="ml-tensor")throw new Error(`Not supported preferred output location: ${D}.`);if(_&&D!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${D}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);w.push(D)}}let I=null;return w.some(k=>k==="gpu-buffer"||k==="ml-tensor"||k==="ml-tensor-cpu-output")&&(u=a._OrtCreateBinding(n),u===0&&fe("Can't create IO binding."),I={handle:u,outputPreferredLocations:w,outputPreferredLocationsEncoded:w.map(k=>k==="ml-tensor-cpu-output"?"ml-tensor":k).map(k=>ga(k))}),ht.set(n,[n,p,m,I,_,!1]),[n,y,$,S,v]}catch(h){throw p.forEach(g=>a._OrtFree(g)),m.forEach(g=>a._OrtFree(g)),u!==0&&a._OrtReleaseBinding(u)!==0&&fe("Can't release IO binding."),n!==0&&a._OrtReleaseSession(n)!==0&&fe("Can't release session."),h}finally{a._free(r),s!==0&&a._OrtReleaseSessionOptions(s)!==0&&fe("Can't release session options."),d.forEach(h=>a._free(h)),a.unmountExternalData?.()}},tn=e=>{let t=ge(),r=ht.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,n,s,u]=r;s&&(u&&t._OrtClearBoundOutputs(s.handle)!==0&&fe("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&fe("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),a.forEach(d=>t._OrtFree(d)),n.forEach(d=>t._OrtFree(d)),t._OrtReleaseSession(i)!==0&&fe("Can't release session."),ht.delete(e)},ca=async(e,t,r,i,a,n,s=!1)=>{if(!e){t.push(0);return}let u=ge(),d=u.PTR_SIZE,p=e[0],m=e[1],h=e[3],g=h,_,y;if(p==="string"&&(h==="gpu-buffer"||h==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&h!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${n} when enableGraphCapture is true.`);if(h==="gpu-buffer"){let v=e[2].gpuBuffer;y=Et(It(p),m);{let w=u.jsepRegisterBuffer;if(!w)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');_=w(i,n,v,y)}}else if(h==="ml-tensor"){let v=e[2].mlTensor;y=Et(It(p),m);let w=u.webnnRegisterMLTensor;if(!w)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');_=w(i,v,It(p),m)}else{let v=e[2];if(Array.isArray(v)){y=d*v.length,_=u._malloc(y),r.push(_);for(let w=0;w<v.length;w++){if(typeof v[w]!="string")throw new TypeError(`tensor data at index ${w} is not a string`);u.setValue(_+w*d,Fe(v[w],r),"*")}}else{let w=u.webnnIsGraphInput,I=u.webnnIsGraphOutput;if(p!=="string"&&w&&I){let k=u.UTF8ToString(a);if(w(i,k)||I(i,k)){let E=It(p);y=Et(E,m),g="ml-tensor";let C=u.webnnCreateTemporaryTensor,O=u.webnnUploadTensor;if(!C||!O)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let x=await C(i,E,m);O(x,new Uint8Array(v.buffer,v.byteOffset,v.byteLength)),_=x}else y=v.byteLength,_=u._malloc(y),r.push(_),u.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,y),_)}else y=v.byteLength,_=u._malloc(y),r.push(_),u.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,y),_)}}let $=u.stackSave(),S=u.stackAlloc(4*m.length);try{m.forEach((w,I)=>u.setValue(S+I*d,w,d===4?"i32":"i64"));let v=u._OrtCreateTensor(It(p),_,y,S,m.length,ga(g));v===0&&fe(`Can't create tensor for input/output. session=${i}, index=${n}.`),t.push(v)}finally{u.stackRestore($)}},rn=async(e,t,r,i,a,n)=>{let s=ge(),u=s.PTR_SIZE,d=ht.get(e);if(!d)throw new Error(`cannot run inference. invalid session id: ${e}`);let p=d[0],m=d[1],h=d[2],g=d[3],_=d[4],y=d[5],$=t.length,S=i.length,v=0,w=[],I=[],k=[],E=[],C=[],O=s.stackSave(),x=s.stackAlloc($*u),D=s.stackAlloc($*u),W=s.stackAlloc(S*u),Z=s.stackAlloc(S*u);try{[v,w]=sp(n),zt("wasm prepareInputOutputTensor");for(let A=0;A<$;A++)await ca(r[A],I,E,e,m[t[A]],t[A],_);for(let A=0;A<S;A++)await ca(a[A],k,E,e,h[i[A]],$+i[A],_);Ct("wasm prepareInputOutputTensor");for(let A=0;A<$;A++)s.setValue(x+A*u,I[A],"*"),s.setValue(D+A*u,m[t[A]],"*");for(let A=0;A<S;A++)s.setValue(W+A*u,k[A],"*"),s.setValue(Z+A*u,h[i[A]],"*");if(g&&!y){let{handle:A,outputPreferredLocations:P,outputPreferredLocationsEncoded:ee}=g;if(m.length!==$)throw new Error(`input count from feeds (${$}) is expected to be always equal to model's input count (${m.length}).`);zt("wasm bindInputsOutputs");for(let Y=0;Y<$;Y++){let F=t[Y];await s._OrtBindInput(A,m[F],I[Y])!==0&&fe(`Can't bind input[${Y}] for session=${e}.`)}for(let Y=0;Y<S;Y++){let F=i[Y];a[Y]?.[3]?(C.push(k[Y]),s._OrtBindOutput(A,h[F],k[Y],0)!==0&&fe(`Can't bind pre-allocated output[${Y}] for session=${e}.`)):s._OrtBindOutput(A,h[F],0,ee[F])!==0&&fe(`Can't bind output[${Y}] to ${P[Y]} for session=${e}.`)}Ct("wasm bindInputsOutputs"),ht.set(e,[p,m,h,g,_,!0])}s.jsepOnRunStart?.(p),s.webnnOnRunStart?.(p);let L;g?L=await s._OrtRunWithBinding(p,g.handle,S,W,v):L=await s._OrtRun(p,D,x,$,Z,S,W,v),L!==0&&fe("failed to call OrtRun().");let K=[],se=[];zt("wasm ProcessOutputTensor");for(let A=0;A<S;A++){let P=Number(s.getValue(W+A*u,"*"));if(P===k[A]||C.includes(k[A])){K.push(a[A]),P!==k[A]&&s._OrtReleaseTensor(P)!==0&&fe("Can't release tensor.");continue}let ee=s.stackSave(),Y=s.stackAlloc(4*u),F=!1,le,M=0;try{s._OrtGetTensorData(P,Y,Y+u,Y+2*u,Y+3*u)!==0&&fe(`Can't access output tensor data on index ${A}.`);let V=u===4?"i32":"i64",J=Number(s.getValue(Y,V));M=s.getValue(Y+u,"*");let de=s.getValue(Y+u*2,"*"),Te=Number(s.getValue(Y+u*3,V)),Oe=[];for(let xe=0;xe<Te;xe++)Oe.push(Number(s.getValue(de+xe*u,V)));s._OrtFree(de)!==0&&fe("Can't free memory for tensor dims.");let Pe=Oe.reduce((xe,be)=>xe*be,1);le=at(J);let et=g?.outputPreferredLocations[i[A]];if(le==="string"){if(et==="gpu-buffer"||et==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let xe=[];for(let be=0;be<Pe;be++){let Ae=s.getValue(M+be*u,"*"),yt=s.getValue(M+(be+1)*u,"*"),cr=be===Pe-1?void 0:yt-Ae;xe.push(s.UTF8ToString(Ae,cr))}K.push([le,Oe,xe,"cpu"])}else if(et==="gpu-buffer"&&Pe>0){let xe=s.jsepGetBuffer;if(!xe)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let be=xe(M),Ae=Et(J,Pe);if(Ae===void 0||!Da(le))throw new Error(`Unsupported data type: ${le}`);F=!0,K.push([le,Oe,{gpuBuffer:be,download:s.jsepCreateDownloader(be,Ae,le),dispose:()=>{s._OrtReleaseTensor(P)!==0&&fe("Can't release tensor.")}},"gpu-buffer"])}else if(et==="ml-tensor"&&Pe>0){let xe=s.webnnEnsureTensor,be=s.webnnIsGraphInputOutputTypeSupported;if(!xe||!be)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Et(J,Pe)===void 0||!Ua(le))throw new Error(`Unsupported data type: ${le}`);if(!be(e,le,!1))throw new Error(`preferredLocation "ml-tensor" for ${le} output is not supported by current WebNN Context.`);let Ae=await xe(e,M,J,Oe,!1);F=!0,K.push([le,Oe,{mlTensor:Ae,download:s.webnnCreateMLTensorDownloader(M,le),dispose:()=>{s.webnnReleaseTensorId(M),s._OrtReleaseTensor(P)}},"ml-tensor"])}else if(et==="ml-tensor-cpu-output"&&Pe>0){let xe=s.webnnCreateMLTensorDownloader(M,le)(),be=K.length;F=!0,se.push((async()=>{let Ae=[be,await xe];return s.webnnReleaseTensorId(M),s._OrtReleaseTensor(P),Ae})()),K.push([le,Oe,[],"cpu"])}else{let xe=Kr(le),be=new xe(Pe);new Uint8Array(be.buffer,be.byteOffset,be.byteLength).set(s.HEAPU8.subarray(M,M+be.byteLength)),K.push([le,Oe,be,"cpu"])}}finally{s.stackRestore(ee),le==="string"&&M&&s._free(M),F||s._OrtReleaseTensor(P)}}g&&!_&&(s._OrtClearBoundOutputs(g.handle)!==0&&fe("Can't clear bound outputs."),ht.set(e,[p,m,h,g,_,!1]));for(let[A,P]of await Promise.all(se))K[A][2]=P;return Ct("wasm ProcessOutputTensor"),K}finally{s.webnnOnRunEnd?.(p),s.stackRestore(O),I.forEach(L=>s._OrtReleaseTensor(L)),k.forEach(L=>s._OrtReleaseTensor(L)),E.forEach(L=>s._free(L)),v!==0&&s._OrtReleaseRunOptions(v),w.forEach(L=>s._free(L))}},an=e=>{let t=ge(),r=ht.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&fe("Can't get an profile file name."),t._OrtFree(a)},nn=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),ft,De,Ut,ir,ar,Mr,ha,Dr,St,Tt,Ad,of,uf,lf,df,pf,cf,hf,ff=U(()=>{"use strict";Ue(),sf(),Bt(),Ba(),ft=()=>!!_e.wasm.proxy&&typeof document<"u",Ut=!1,ir=!1,ar=!1,Dr=new Map,St=(e,t)=>{let r=Dr.get(e);r?r.push(t):Dr.set(e,[t])},Tt=()=>{if(Ut||!ir||ar||!De)throw new Error("worker not ready")},Ad=e=>{switch(e.data.type){case"init-wasm":Ut=!1,e.data.err?(ar=!0,ha[1](e.data.err)):(ir=!0,ha[0]()),Mr&&(URL.revokeObjectURL(Mr),Mr=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Dr.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},of=async()=>{if(!ir){if(Ut)throw new Error("multiple calls to 'initWasm()' detected.");if(ar)throw new Error("previous call to 'initWasm()' failed.");if(Ut=!0,ft())return new Promise((e,t)=>{De?.terminate(),ap().then(([r,i])=>{try{De=i,De.onerror=n=>t(n),De.onmessage=Ad,ha=[e,t];let a={type:"init-wasm",in:_e};!a.in.wasm.wasmPaths&&(r||ma)&&(a.in.wasm.wasmPaths={wasm:new URL("ort-wasm-simd-threaded.jsep.wasm",import.meta.url).href}),De.postMessage(a),Mr=r}catch(a){t(a)}},t)});try{await Na(_e.wasm),await Xa(_e),ir=!0}catch(e){throw ar=!0,e}finally{Ut=!1}}},uf=async e=>{if(ft())return Tt(),new Promise((t,r)=>{St("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:_e}};De.postMessage(i)});await Ja(_e,e)},lf=async e=>ft()?(Tt(),new Promise((t,r)=>{St("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};De.postMessage(i,[e.buffer])})):jr(e),df=async(e,t)=>{if(ft()){if(t?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Tt(),new Promise((r,i)=>{St("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},n=[];e instanceof Uint8Array&&n.push(e.buffer),De.postMessage(a,n)})}else return en(e,t)},pf=async e=>{if(ft())return Tt(),new Promise((t,r)=>{St("release",[t,r]);let i={type:"release",in:e};De.postMessage(i)});tn(e)},cf=async(e,t,r,i,a,n)=>{if(ft()){if(r.some(s=>s[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(s=>s))throw new Error("pre-allocated output tensor is not supported for proxy.");return Tt(),new Promise((s,u)=>{St("run",[s,u]);let d=r,p={type:"run",in:{sessionId:e,inputIndices:t,inputs:d,outputIndices:i,options:n}};De.postMessage(p,nn(d))})}else return rn(e,t,r,i,a,n)},hf=async e=>{if(ft())return Tt(),new Promise((t,r)=>{St("end-profiling",[t,r]);let i={type:"end-profiling",in:e};De.postMessage(i)});an(e)}}),fa,Od,mf,H0=U(()=>{"use strict";Ue(),ff(),X(),Ra(),up(),fa=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Od=e=>{switch(e[3]){case"cpu":return new Xe(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Da(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Xe.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!Ua(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Xe.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},mf=class{async fetchModelAndCopyToWasmMemory(e){return lf(await Pa(e))}async loadModel(e,t){Je();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await df(r,t),je()}async dispose(){return pf(this.sessionId)}async run(e,t,r){Je();let i=[],a=[];Object.entries(e).forEach(h=>{let g=h[0],_=h[1],y=this.inputNames.indexOf(g);if(y===-1)throw new Error(`invalid input '${g}'`);i.push(_),a.push(y)});let n=[],s=[];Object.entries(t).forEach(h=>{let g=h[0],_=h[1],y=this.outputNames.indexOf(g);if(y===-1)throw new Error(`invalid output '${g}'`);n.push(_),s.push(y)});let u=i.map((h,g)=>fa(h,()=>`input "${this.inputNames[a[g]]}"`)),d=n.map((h,g)=>h?fa(h,()=>`output "${this.outputNames[s[g]]}"`):null),p=await cf(this.sessionId,a,u,s,d,r),m={};for(let h=0;h<p.length;h++)m[this.outputNames[s[h]]]=n[h]??Od(p[h]);return je(),m}startProfiling(){}endProfiling(){hf(this.sessionId)}}}),gf={};Vt(gf,{OnnxruntimeWebAssemblyBackend:()=>Ca,initializeFlags:()=>za,wasmBackend:()=>yf});var za,Ca,yf,F0=U(()=>{"use strict";Ue(),ff(),H0(),za=()=>{(typeof _e.wasm.initTimeout!="number"||_e.wasm.initTimeout<0)&&(_e.wasm.initTimeout=0);let e=_e.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),_e.wasm.simd=!1),typeof _e.wasm.proxy!="boolean"&&(_e.wasm.proxy=!1),typeof _e.wasm.trace!="boolean"&&(_e.wasm.trace=!1),typeof _e.wasm.numThreads!="number"||!Number.isInteger(_e.wasm.numThreads)||_e.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)_e.wasm.numThreads=1;else{let t=typeof navigator>"u"?Og("node:os").cpus().length:navigator.hardwareConcurrency;_e.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},Ca=class{async init(e){za(),await of(),await uf(e)}async createInferenceSessionHandler(e,t){let r=new mf;return await r.loadModel(e,t),r}},yf=new Ca});Ue();Ue();Ue();var j0="1.24.3",K0=Xd;{let e=(F0(),dr(gf)).wasmBackend;Pt("webgpu",e,5),Pt("webnn",e,5),Pt("cpu",e,10),Pt("wasm",e,10)}Object.defineProperty(_e.versions,"web",{value:j0,enumerable:!0});export{Yd as InferenceSession,qr as TRACE,zt as TRACE_EVENT_BEGIN,Ct as TRACE_EVENT_END,Je as TRACE_FUNC_BEGIN,je as TRACE_FUNC_END,Xe as Tensor,K0 as default,_e as env,Pt as registerBackend};
/*! Bundled license information:

onnxruntime-web/dist/ort.bundle.min.mjs:
  (*!
   * ONNX Runtime Web v1.24.3
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)

onnxruntime-web/dist/ort.bundle.min.mjs:
  (**
   * @license
   * Copyright 2021 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2020 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2019 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
*/
