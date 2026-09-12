import bpy
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(R/'outputs/infinity-sculpture/infinity.blend'))
s=bpy.context.scene;c=s.camera
c.data.type='PERSP';c.data.lens=72;c.location=(3.6,-3.9,2.7)
focus=Vector((1.25,-.05,.35));c.rotation_euler=(focus-c.location).to_track_quat('-Z','Y').to_euler()
c.data.dof.use_dof=True;c.data.dof.focus_distance=(focus-c.location).length;c.data.dof.aperture_fstop=3.2
dark=bpy.data.materials['Charcoal ceramic metal'];dark.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.035,.043,.042,1)
yellow=bpy.data.materials['Acid yellow inner enamel'];bs=yellow.node_tree.nodes.get('Principled BSDF');bs.inputs['Emission Color'].default_value=(.85,1,.001,1);bs.inputs['Emission Strength'].default_value=.65
# Fine machined surface variation belongs to the metal itself, not a page overlay.
nodes=dark.node_tree.nodes;links=dark.node_tree.links;noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=180;noise.inputs['Roughness'].default_value=.65
bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.13;bump.inputs['Distance'].default_value=.008;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])
s.render.resolution_x=2200;s.render.resolution_y=1350;s.render.resolution_percentage=100;s.render.film_transparent=False;s.cycles.samples=64
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='OPTIX';pref.get_devices()
for d in pref.devices:d.use=d.type=='OPTIX'
s.cycles.device='GPU';s.render.image_settings.file_format='PNG';s.render.filepath=str(R/'outputs/landing-build/macro.png');bpy.ops.render.render(write_still=True)
print('MACRO_RENDERED')
