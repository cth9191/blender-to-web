import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector, Matrix
O=Path(__file__).resolve().parent
GRAY='--graybox' in sys.argv
ROWS=128; RINGS=14; RADIUS=.40
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene;s.unit_settings.system='METRIC'
def material(name,color,metal,rough):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
dark=material('Charcoal ceramic metal',(.105,.115,.12),.85,.29)
edge=material('Machined titanium bevel',(.34,.36,.37),.95,.22)
yellow=material('Acid yellow inner enamel',(.88,.94,.006),.38,.26)
def curve(t):return Vector((2.35*math.cos(t),.67*math.sin(t),1.03*math.sin(2*t)))
samples=[curve(i*math.tau/8192) for i in range(8193)];lengths=[0]
for i in range(1,len(samples)):lengths.append(lengths[-1]+(samples[i]-samples[i-1]).length)
import bisect
total=lengths[-1]
if GRAY:
 c=bpy.data.curves.new('Infinity proportion study','CURVE');c.dimensions='3D';c.bevel_depth=RADIUS;c.bevel_resolution=5
 sp=c.splines.new('POLY');sp.points.add(255)
 for i,p in enumerate(sp.points):p.co=(*curve(i*math.tau/256),1)
 sp.use_cyclic_u=True;ob=bpy.data.objects.new('Graybox infinity',c);s.collection.objects.link(ob);ob.data.materials.append(dark)
else:
 bpy.ops.mesh.primitive_cube_add(size=1);prototype=bpy.context.object;prototype.name='Machined tile prototype';prototype.dimensions=(total/ROWS*.86,math.tau*RADIUS/RINGS*.86,.07)
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for m in [dark,edge,yellow]:prototype.data.materials.append(m)
 for f in prototype.data.polygons:f.material_index=2 if f.normal.z<-.5 else 0
 bevel=prototype.modifiers.new('Precision rounded edges','BEVEL');bevel.width=.007;bevel.segments=3;bevel.affect='EDGES';bevel.material=1
 bpy.ops.object.modifier_apply(modifier=bevel.name)
 for f in prototype.data.polygons:f.use_smooth=len(f.vertices)<5
 norm=prototype.modifiers.new('Weighted machined normals','WEIGHTED_NORMAL');norm.keep_sharp=True;bpy.ops.object.modifier_apply(modifier=norm.name)
 mesh=prototype.data;collection=bpy.data.collections.new('Magnetic infinity / 1792 tiles');s.collection.children.link(collection)
 for row in range(ROWS):
  wanted=row*total/ROWS;idx=bisect.bisect_left(lengths,wanted);t=idx*math.tau/8192
  center=curve(t);tangent=(curve(t+.0001)-curve(t-.0001)).normalized()
  b=Vector((0,1,0));b=(b-tangent*b.dot(tangent)).normalized();n=tangent.cross(b).normalized()
  for ring in range(RINGS):
   a=ring*math.tau/RINGS;radial=math.cos(a)*b+math.sin(a)*n;side=radial.cross(tangent).normalized()
   ob=bpy.data.objects.new(f'Tile_{row:03d}_{ring:02d}',mesh);collection.objects.link(ob);ob.location=center+RADIUS*radial;ob.rotation_mode='QUATERNION';ob.rotation_quaternion=Matrix((tangent,side,radial)).transposed().to_quaternion()
 bpy.data.objects.remove(prototype,do_unlink=True)
 bpy.ops.object.select_all(action='DESELECT')
 for ob in collection.objects:ob.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(O/'infinity.glb'),export_format='GLB',use_selection=True,export_animations=False)
 tri=sum(len(f.vertices)-2 for f in mesh.polygons)
 (O/'authored-metrics.json').write_text(json.dumps({'blender':bpy.app.version_string,'pieces':ROWS*RINGS,'unique_tile_triangles':tri,'total_triangles':tri*ROWS*RINGS,'materials':[m.name for m in mesh.materials],'curve_length':total,'stages':['graybox','primary tile lattice','rounded bevels and normals','three material surfaces','export']},indent=2))
# Fixed studio and cameras for reproducible evidence.
world=bpy.data.worlds.new('Charcoal studio');world.use_nodes=True;world.node_tree.nodes.get('Background').inputs[0].default_value=(.13,.14,.15,1);world.node_tree.nodes.get('Background').inputs[1].default_value=.4;s.world=world
def area(name,pos,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=pos;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
area('Key softbox',(-3,-5,6),1600,5,(1,.98,.9));area('Rim strip',(4,2,4),2100,4,(.9,.95,1));area('Front reflection',(1,-5,-1),850,3,(1,1,.9))
d=bpy.data.cameras.new('Hero camera');camera=bpy.data.objects.new('Hero camera',d);s.collection.objects.link(camera);s.camera=camera;d.type='ORTHO';d.ortho_scale=7.3
s.render.engine='CYCLES';s.cycles.samples=16 if GRAY else 32;s.cycles.use_denoising=True
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='OPTIX';pref.get_devices()
for dev in pref.devices:dev.use=dev.type=='OPTIX'
s.cycles.device='GPU';s.render.resolution_x=1000;s.render.resolution_y=700;s.render.resolution_percentage=100;s.render.film_transparent=True
s.view_settings.view_transform='AgX'
camera.location=(.5,-12,3.1);camera.rotation_euler=(-camera.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(O/('graybox.blend' if GRAY else 'infinity.blend')))
s.render.filepath=str(O/('graybox.png' if GRAY else 'hero.png'));bpy.ops.render.render(write_still=True)
print('INFINITY_BUILD_DONE')
