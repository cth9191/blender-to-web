import bpy,numpy as np,json
from pathlib import Path
R=Path(__file__).resolve().parents[2];O=R/'outputs/aperture-site/assets/live';E=R/'outputs/aperture-live'
bpy.ops.wm.open_mainfile(filepath=str(R/'outputs/living-hero-blender-v2/aperture.blend'))
s=bpy.context.scene;s.frame_set(1)
report={'blender':bpy.app.version_string,'path_points':8,'fibers_per_shell':22000,'guides_per_shell':128,'parts':{}}
for label in ['Upper','Lower']:
 ob=bpy.data.objects[label+'_Swept_Fibers'];co=np.empty(len(ob.data.vertices)*3,dtype=np.float32);ob.data.vertices.foreach_get('co',co)
 rings=co.reshape(-1,12,3,3);rng=np.random.default_rng(319 if label=='Upper' else 320);sel=np.sort(rng.choice(len(rings),22000,replace=False));rings=rings[sel]
 centers=rings.mean(axis=2);width=np.linalg.norm(rings[:,:,0,:]-centers,axis=2)
 # Retain measured groom centerlines at eight samples, widening very slightly for screen coverage.
 steps=np.array([0,1,3,4,6,8,10,11]);paths=np.concatenate([centers[:,steps,:],width[:,steps,None]*1.35],axis=2).astype('<f4')
 paths.tofile(O/(label.lower()+'-paths.bin'))
 roots=centers[:,0,:];chosen=rng.choice(len(roots),128,replace=False);guides=roots[chosen]
 assignments=np.argmin(np.sum((roots[:,None,:]-guides[None,:,:])**2,axis=2),axis=1).astype('<f4');assignments.tofile(O/(label.lower()+'-guides.bin'))
 report[label.lower()]={'guides':guides.tolist(),'count':len(paths),'base_position':list(ob.parent.location),'base_rotation':list(ob.parent.rotation_euler)}
 bpy.data.objects.remove(ob,do_unlink=True)
# Decimate rigid components, preserving materials and separate parent transforms.
for ob in list(s.objects):
 if ob.type=='MESH' and ob.name!='Studio_Background':
  before=sum(len(p.vertices)-2 for p in ob.data.polygons)
  bpy.context.view_layer.objects.active=ob
  mod=ob.modifiers.new('Web density','DECIMATE');mod.ratio=.4 if 'Shell' in ob.name else .5
  bpy.ops.object.modifier_apply(modifier=mod.name)
  report['parts'][ob.name]={'triangles_before':before,'triangles':sum(len(p.vertices)-2 for p in ob.data.polygons),'materials':[m.name for m in ob.data.materials]}
bpy.ops.object.select_all(action='DESELECT')
for ob in s.objects:
 if ob.name in report['parts'] or ob.name in ['Upper_Pivot','Lower_Pivot']:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(O/'sculpture.glb'),export_format='GLB',use_selection=True,export_animations=False)
(O/'groom.json').write_text(json.dumps(report));(E/'export-metrics.json').write_text(json.dumps(report,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(E/'aperture-web-rigid.blend'),compress=True)
print('WEB_ASSETS_EXPORTED',sum(p['triangles'] for p in report['parts'].values()))
