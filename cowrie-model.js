import * as T from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/loaders/DRACOLoader.js';
import {MeshoptDecoder} from './vendor/libs/meshopt_decoder.module.js';

const draco=new DRACOLoader().setDecoderPath('./vendor/libs/draco/gltf/').setWorkerLimit(1);
const loader=new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);

// The supplied GLB is a single indexed, textured glTF mesh with embedded maps.
// Keep its actual positions, normals, UVs and material images intact.
export async function loadCowrie(renderer,scene,name='cowrie',unlit=false){
 const asset=await loader.loadAsync('assets/composition/'+name+'-small.glb');
 asset.scene.updateMatrixWorld(true);
 let source;asset.scene.traverse(o=>{if(o.isMesh&&!source)source=o});
 if(!source)throw Error('Treasure mesh unavailable');
 const g=source.geometry.clone();
 // Bake the quantization node transform into float geometry before positioning the treasure.
 for(const key of ['position','normal','uv']){const a=g.getAttribute(key);if(!a)continue;const v=new Float32Array(a.count*a.itemSize);for(let i=0;i<a.count;i++)for(let k=0;k<a.itemSize;k++)v[i*a.itemSize+k]=a.getComponent(i,k);g.setAttribute(key,new T.BufferAttribute(v,a.itemSize));}
 g.applyMatrix4(source.matrixWorld);g.computeBoundingBox();
 const map=source.material.map;
 if(unlit){const mesh=new T.Mesh(g,new T.MeshBasicMaterial({map,side:T.DoubleSide,toneMapped:false}));const group=new T.Group();group.add(mesh);scene.add(group);return {group,mesh,bounds:g.boundingBox.clone()};}
 const rough=source.material.roughnessMap,normal=source.material.normalMap;
 // Local studio-like reflected light, only applied to the treasure, not the painted scene.
 const env=new T.Scene();env.background=new T.Color('#355574');const box=new T.BoxGeometry(1,1,1);
 for(const [x,y,z,w,h,color] of [[-3,3,4,3,5,'#bfdcff'],[4,2,-3,2,5,'#91b7ee'],[0,5,0,5,2,'#e4eaff'],[-3,-1,-3,3,2,'#8e91de']]){const m=new T.Mesh(box,new T.MeshBasicMaterial({color}));m.position.set(x,y,z);m.scale.set(w,h,.2);m.lookAt(0,0,0);env.add(m)}
 const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(env,.06).texture;pmrem.dispose();
 const material=new T.MeshPhysicalMaterial({map,roughnessMap:rough,metalnessMap:rough,normalMap:normal,normalScale:new T.Vector2(.45,.45),metalness:name==='cowrie'?.48:.3,roughness:.34,clearcoat:.75,clearcoatRoughness:.17,iridescence:name==='cowrie'?.55:.18,iridescenceIOR:1.35,envMap:environment,envMapIntensity:1.4,emissiveMap:map,emissive:0x6b91bc,emissiveIntensity:.42,side:T.DoubleSide,transparent:true,depthWrite:true});
 const mesh=new T.Mesh(g,material);mesh.renderOrder=1;const group=new T.Group();group.add(mesh);scene.add(group);
 return {group,mesh,bounds:g.boundingBox.clone()};
}
