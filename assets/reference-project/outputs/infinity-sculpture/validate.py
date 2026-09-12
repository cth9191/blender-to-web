import bpy, json, math, bmesh
from pathlib import Path
from mathutils import Vector
O=Path(__file__).resolve().parent
expected=json.loads((O/'authored-metrics.json').read_text())
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(O/'infinity.glb'))
s=bpy.context.scene;obs=[o for o in s.objects if o.type=='MESH'];assert len(obs)==expected['pieces']
meshes={o.data.name:o.data for o in obs};tri=sum(sum(len(f.vertices)-2 for f in o.data.polygons) for o in obs)
assert tri==expected['total_triangles']
assert all(math.isfinite(v) for o in obs for row in o.matrix_world for v in row)
assert all(math.isfinite(v) for m in meshes.values() for pt in m.vertices for v in pt.co)
assert set(m.name for m in obs[0].data.materials)==set(expected['materials'])
degenerate=0;nonmanifold=0;welded_nonmanifold=0
for mesh in meshes.values():
 bm=bmesh.new();bm.from_mesh(mesh);degenerate+=sum(f.calc_area()<1e-10 for f in bm.faces);nonmanifold+=sum(not e.is_manifold for e in bm.edges);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6);welded_nonmanifold+=sum(not e.is_manifold for e in bm.edges);bm.free()
assert degenerate==0
with bpy.data.libraries.load(str(O/'infinity.blend'),link=False) as (a,b):b.objects=[n for n in a.objects if n in ['Hero camera','Key softbox','Rim strip','Front reflection']];b.worlds=a.worlds
for ob in b.objects:s.collection.objects.link(ob)
s.world=b.worlds[0];s.camera=bpy.data.objects['Hero camera'];s.camera.data.ortho_scale=7.2
s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='OPTIX';pref.get_devices()
for d in pref.devices:d.use=d.type=='OPTIX'
s.cycles.device='GPU';s.view_settings.view_transform='AgX';s.render.resolution_x=512;s.render.resolution_y=512;s.render.resolution_percentage=100;s.render.film_transparent=True
for name,loc in [('hero',(.5,-12,3.1)),('front',(0,-12,0)),('back',(0,12,0)),('left',(-12,0,0)),('right',(12,0,0)),('top',(0,0,12))]:
 s.camera.location=loc;s.camera.rotation_euler=(-s.camera.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(O/f'import-{name}.png');bpy.ops.render.render(write_still=True)
report={'status':'passed','authored':expected,'imported':{'pieces':len(obs),'triangles':tri,'unique_meshes':len(meshes),'degenerate_faces':degenerate,'raw_split_edges':nonmanifold,'nonmanifold_after_welding_export_seams':welded_nonmanifold,'uv_maps':len(obs[0].data.uv_layers)},'observations':['Separate floating tiles are intentional magnetic fiction.','Six fixed views rendered from fresh GLB import.','Material geometry is exported; interactive forces run in the browser.']}
(O/'import-validation.json').write_text(json.dumps(report,indent=2));print('IMPORT_VALIDATED')
