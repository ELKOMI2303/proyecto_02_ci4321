
import { MeshBasicMaterial, TextureLoader, BoxGeometry,BackSide,Mesh } from "three";
const ft = new TextureLoader().load("/blizzard_ft.jpg");
const bk = new TextureLoader().load("/blizzard_bk.jpg");
const up = new TextureLoader().load("/blizzard_up.jpg");
const dn = new TextureLoader().load("/blizzard_dn.jpg");
const rt = new TextureLoader().load("/blizzard_rt.jpg");
const lf = new TextureLoader().load("/blizzard_lf.jpg");

let material_array = [];
material_array.push(new MeshBasicMaterial({map:ft, side:BackSide}));
material_array.push(new MeshBasicMaterial({map:bk, side:BackSide}));
material_array.push(new MeshBasicMaterial({map:up, side:BackSide}));
material_array.push(new MeshBasicMaterial({map:dn, side:BackSide}));
material_array.push(new MeshBasicMaterial({map:rt, side:BackSide}));
material_array.push(new MeshBasicMaterial({map:lf, side:BackSide}));

  // Optional: Create a skybox mesh if needed for other effects
  var skyboxGeo = new BoxGeometry(10000,10000, 10000);
  var Skybox = new Mesh(skyboxGeo, material_array);
export default Skybox;
  