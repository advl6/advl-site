"""Site data for both concepts: projects (with write-ups from the site, the old portfolio and Learning Bodies), CV, about."""
import sys, json, re, copy
sys.path.insert(0, '/home/claude/v2/src')
import content as C

def clean(blocks):
    out = []
    for b in blocks:
        t = b['t']
        if t in ('todo', 'ext'): continue
        if t == 'plate':
            rows = [[k, re.sub(r'<[^>]+>', '', v)] for k, v in b['specs'] if v and 'To be filled' not in v]
            if rows: out.append({'t': 'spec', 'x': rows})
            continue
        if t == 'video' and not b.get('src'): continue
        if t == 'slides': b = {'t': 'gal', 'cols': 1, 'imgs': b['imgs'], 'cap': None}
        out.append(b)
    return out

P = copy.deepcopy(C.PROJECTS)
for i, p in enumerate(P):
    p['num'] = f'{i + 1:02d}'
    p['blocks'] = clean(C.CONTENT[i]['blocks']) if i in C.CONTENT else []
    p['meta'] = C.CONTENT[i].get('meta', p['f']) if i in C.CONTENT else p['f']
    p['frost'] = f'frost/p_{p["img"]}.webp'
    p['video'] = None; p['videoPending'] = False

def put(i, blocks, before=True, frost=None, meta=None):
    spec = [b for b in P[i]['blocks'] if b['t'] == 'spec']; rest = [b for b in P[i]['blocks'] if b['t'] != 'spec']
    P[i]['blocks'] = (spec + blocks + rest) if before else (spec + rest + blocks)
    if frost: P[i]['frost'] = frost
    if meta: P[i]['meta'] = meta

I = lambda k, alt: [k, alt]

# 01 Learning Bodies (thesis PDF; the book was always open-ended, so only what exists)
put(0, [
 {'t': 'lead', 'x': 'My work has become a hybrid between industrial product design and abstract emotional investigation. Coming from a background of fine art and mixed media, I approach design from the perspective of how it may shape an emotion, experience, or relationship. The emotion of a thing, the experience of a place, or our relationship to the world.'},
 {'t': 'p', 'x': 'During my thesis year at CCA, a connection between previous works of mine and new emerging work began to correlate with an exploration of human bodies, and their relationships to other bodies and beings. This expanse of work, which has become my thesis, is called Learning Bodies, and it is the beginning of a larger rediscovery of bodily abilities.'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/cover.webp', 'Learning Bodies cover, chartreuse title over a macro texture'), I('img/lb/ring.webp', 'A ring of cut-out material samples, casts and masks')], 'cap': 'Learning Bodies, MFA Design, California College of the Arts, 2024'},
 {'t': 'h2', 'x': 'Index'},
 {'t': 'tags', 'x': ['Sensorial Kinship', 'Post-human', 'Wetware', 'Bio-signaling', 'Bio-friction', 'Parallel Sensation', 'Bio-Futures Archeology', 'Mutation', 'Inherited Pattern', 'Homo Novus Animalium', 'Commonalities of Experience', 'Transgenesis', 'Interplay', 'Auto-ethnographic Research', 'Human Physiology', 'Urban Exploration', 'Biopsychosocial']},
 {'t': 'h2', 'x': 'Journal of a body'},
 {'t': 'poem', 'x': ['a body enjoys openness', 'a body enjoys being able to see the space around it', 'a body enjoys breathing fresh air', 'a body likes to dip its toes into refreshing water', '', 'a body is a house', 'a body is a space', 'a body is finite', 'a body is in-finite', 'a body is energy', '', 'a body receives ( instructions )', 'a body navigates ( physical space )', 'a body reacts ( reflexively )']},
 {'t': 'h2', 'x': 'Works, Fall 2023'},
 {'t': 'items', 'x': [['Microthesis: Civilly Unidentifiable', 'A want for gentler activism. A reclamation of bodily authority within a surveillance economy, ideating on facial obstructions that are not perceived as ominous, threatening, or suspecting.'],
   ['Material Obstruction: Water', 'Cast facial obstructions.'], ['Dermal Anchor: Octopus Dreams', 'Bioluminescent dermal anchors on the hand, modeled in Rhino and rendered in Keyshot.'],
   ['Stonehead / Future Faces', 'Gathered stones, Dremel, wire, mesh, needle, thread, glue.'], ['High-Tech Headgear', 'Generated with Midjourney, built in Rhino, rendered with Keyshot.'],
   ['Bio-Signaling Bodies', 'Generated with Midjourney, Runway.ml and Noizeee; built with Rhino, silicone, latex, agar agar, glycerin and natural pigments.']]},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/masks.webp', 'Material Obstruction: Water, purple and black cast masks'), I('img/lb/mask_held.webp', 'A black cast mask held in two hands')], 'cap': 'Material Obstruction: Water, Fall 2023'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/lb/anchor_orange.webp', 'Orange glowing dermal anchors on a forearm'), I('img/lb/anchor_glow.webp', 'Glowing marks on the back of a hand'), I('img/lb/anchor_blue.webp', 'Iridescent blue dermal anchors on skin')], 'cap': 'Dermal Anchor: Octopus Dreams, Fall 2023'},
 {'t': 'quote', 'x': 'Water can teach us about the relationships between things. We can observe relationships and learn from them. We must reflect on the relationships between bodies, between beings. How do we relate to everything?'},
 {'t': 'h2', 'x': 'Sub-exploration: Corporeal Futures'},
 {'t': 'lead', 'x': '“Self” as driver in the vehicle of “body”: an investigation into the presentation of identity through bodily manipulation.'},
 {'t': 'p', 'x': 'Using Thomas Metzinger’s Theory of Self-Model as a starting point for the body’s relationship to its “self”, I developed a system of categories for avenues of bodily identity. With Midjourney I generated imagery across those categories (body modding, cybernetics, neural bionics, prostheses and dermal textiling), then answered the generated material by re-interpreting it in Rhino.'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/lb/cf_mj1.webp', 'Midjourney portrait: a figure in clear cybernetic headgear against deep blue'), I('img/lb/cf_mj2.webp', 'Midjourney portrait: looping wire headgear and a chrome collar'), I('img/lb/cf_mj3.webp', 'Midjourney portrait: a face framed by orbiting chrome instruments')], 'cap': 'Imagining future identities · Midjourney images'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/cf_gear1.webp', 'Rhino re-interpretation: a chrome lattice cuff joined to a green translucent module by a clear tube'), I('img/lb/cf_gear2.webp', 'Rhino re-interpretation: a violet woven band with a small green module')], 'cap': 'Design response · headpiece re-interpreted in Rhino'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/lb/cf_pair.webp', 'Two lattice headpiece modules on a pale lilac ground, joined by a looping clear tube')], 'cap': 'Headpiece, rendered in Keyshot'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/cf_handmj.webp', 'Midjourney image: a hand traced with red cybernetic veins'), I('img/lb/cf_vein.webp', 'Rhino and Putty 3D re-interpretation: a branching coral-coloured vein lattice')], 'cap': 'Blending body with identity · Midjourney image, re-interpreted in Rhino with Putty 3D'},
 {'t': 'h3', 'x': 'Skinaments'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/skin_2.webp', 'A branching lattice of skin-toned veins on a grey ground'), I('img/lb/skin_5.webp', 'The vein lattice laid over a torn, striated red membrane against blue')], 'cap': 'Skinaments · a vein lattice worn as ornament, rendered in KeyShot, 2023'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/skin_3.webp', 'Close view of the veins over the striated membrane'), I('img/lb/skin_4.webp', 'Closer still: speckled veins and red fibres')], 'cap': ''},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/cf_legmj.webp', 'Midjourney image: a copper prosthetic leg'), I('img/lb/cf_joint.webp', 'Rhino re-interpretation: a pale sculpted joint with a fluid line')], 'cap': 'Joint · Midjourney image, re-interpreted in Rhino'},
 {'t': 'quote', 'x': 'We are identified by our decisions. Of these decisions, how we dress and present ourselves physically takes priority in preparing for social interactions; thereby worn or otherwise adorned artifacts bear the highest priority of consideration.'},
 {'t': 'h3', 'x': 'Learning through asking'},
 {'t': 'p', 'x': 'Speaking with a childhood friend, a perspective of wanting to assimilate emerged: not wanting to be different, but inherently being so. Only in the past ten years has she felt liberated from her self-perceived misfit-ness, and she now cites her limb difference as a source of strength and creativity. I asked her a few questions regarding identity, body and choice.'},
 {'t': 'h2', 'x': 'Sub-exploration: Wearables'},
 {'t': 'lead', 'x': 'Bodies as interfaces. In collaboration with Midjourney, I used my own Rhino designs to train the model on my aesthetic, then iterated wearable-tech prototypes between the two.'},
 {'t': 'h3', 'x': 'Dermal implants'},
 {'t': 'p', 'x': 'The first phase of bodies as interfaces explored implanted tech, fusing components with skin to become a forever-wearable. Built in Rhino, rendered in Keyshot.'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/wr_glow.webp', 'Pale blue luminous marks implanted in the back of a hand'), I('img/lb/wr_orange.webp', 'Orange glowing implants set into the skin of a hand')], 'cap': 'Dermal implants'},
 {'t': 'h3', 'x': 'Dermal finger anchors'},
 {'t': 'p', 'x': 'Body-interfacing as finger-anchor satellites: an investigation into practical bio-tech integration on the hands. Modeled in Rhino, rendered in Keyshot.'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/lb/wr_anchor1.webp', 'Violet disc anchors on the fingers, under a cloudy sky'), I('img/lb/wr_anchor2.webp', 'A chartreuse textured anchor on a knuckle'), I('img/lb/wr_anchor3.webp', 'Blue-violet anchors on a coral hand')], 'cap': 'Finger anchors'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/fa/fa_road.webp', 'A hand at dusk over a dirt road, four glass finger anchors catching violet light'), I('img/fa/fa_back.webp', 'The back of a coral hand with two violet anchors and an amber textured anchor')], 'cap': 'Finger anchors at dusk'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/fa/fa_dusk_pink.webp', 'A coral hand against a blue dusk sky, a smoky anchor on the knuckle and a pink glass anchor on the finger'), I('img/fa/fa_dusk_eye.webp', 'Close view of a smoky glass anchor rippling the skin around it')], 'cap': 'Anchors set into the skin, rings of displaced surface around each'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/fa/fa_sky_purple.webp', 'Fingers against clouds with purple and smoked glass anchors'), I('img/fa/fa_knuckles.webp', 'Two violet glass anchors on adjacent knuckles'), I('img/fa/fa_green.webp', 'A green cellular anchor on a dark blue hand')], 'cap': 'Colorways: violet, smoke, cellular green'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/fa/fa_palm.webp', 'An open coral and indigo palm with anchors at the fingertips'), I('img/fa/fa_frost.webp', 'A soft-focus study of a violet anchor and fingertips')], 'cap': ''},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/fa/fa_ks2.webp', 'KeyShot workspace: the hand with two anchors, camera settings open'), I('img/fa/fa_ks1.webp', 'KeyShot workspace: the hand scene with liquid and multi-layer optic materials')], 'cap': 'Process · materials and cameras in KeyShot'},
 {'t': 'h3', 'x': 'Cybernetic implants and headgear'},
 {'t': 'p', 'x': 'Inspired by bio-integrated dermal LEDs, the cybernetic implants move from the forearm to the face and head. From the range of Midjourney samples, some went on to be re-modelled in Rhino, among them the Stardrum headgear.'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/lb/wr_cyb1.webp', 'Four views of small green and chrome cybernetic modules on a pale lavender ground'), I('img/lb/wr_cyb2.webp', 'A cybernetic module pair joined by fine wire'), I('img/lb/wr_cyb3.webp', 'A cybernetic module with a circuit plate')], 'cap': 'Cybernetic implants'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/wr_drum.webp', 'The Stardrum headgear: chrome lattice modules on a looping clear band'), I('img/lb/wr_star.webp', 'Line drawings of the Stardrum worn on two heads, in chartreuse and magenta')], 'cap': 'Stardrum headgear · generated in Midjourney, modeled in Rhino'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/lb/wr_drum2.webp', 'A woven-mesh pod beside a translucent green star piece and a clear bent tube'), I('img/lb/wr_drum3.webp', 'Two violet woven-mesh pods along a clear band, a green star between them'), I('img/lb/wr_drum4.webp', 'Two woven-mesh pods joined by a looping tube, amber droplets scattered nearby')], 'cap': 'Stardrum · woven mesh, glass star, clear band'},
 {'t': 'h3', 'x': 'Conceptual biochip implant'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/lb/wr_chip.webp', 'Rhino viewports of a translucent aqua subdermal biochip'), I('img/lb/wr_chip_rhino.webp', 'The biochip mesh shaded cyan in Rhino 8: top, front and perspective views')], 'cap': 'Concept for a subdermal micro-biochip · modeled in Nomad and Rhino'},
 {'t': 'p', 'x': 'In parallel runs the biomaterials research below: skin-safe, sustainable, planet-positive agar agar materials with strong potential for tech integration.'},
 {'t': 'h2', 'x': 'Process and Material'},
 {'t': 'p', 'x': 'So many skins made in so many ways. I find aqueous, membranous, materials attractive. They most closely resemble something alive. Sliding scales of translucency, bending light here, a little opaque there. Our skin allows us to peer through its veil to watch blood pump through our squishy veins. So I look for materials with the same quality, something to evoke that feeling of becoming conduit to a radiating invisibility.'},
 {'t': 'spectrum', 'title': 'Glycerin in an agar agar sheet', 'left': 'Low glycerin', 'right': 'High glycerin',
  'stops': ['Dries up like algae out of water', 'Mostly stiff, with a softer edge or center', 'Mostly flexible, with some stiffness on a corner', 'Stays gel-like; not yet observed to change state'],
  'note': 'The exact ratio for the ideal mixture has yet to be put into quantitative language.'},
 {'t': 'stat', 'n': '5+', 'u': 'months', 'x': 'Agar agar samples observed holding their material integrity, and still going.'},
 {'t': 'items', 'x': [['Agar agar', 'Algae. Brought to a boil at constant stir, then simmered. Powder dyes activate on contact with the gel and crawl like watercolor. When set at the proper ratio it is flexible, tensile, sewable, and long-lasting.'],
   ['Glycerin', 'A lubricating oil extracted from plants. It loosens agar agar in its gel set state, diluting the stiffness of a gel.'],
   ['Latex', 'Natural rubber. Layers begin to deteriorate after a few weeks, but it adheres interestingly to fabrics, giving a skin-like texture to textiles.']]},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/bio_1966.webp', 'Translucent agar skin, speckled blue and orange, against a hand'), I('img/bio_1931.webp', 'A shell set into a black cast, lit through from behind'), I('img/bio_2165.webp', 'A clear blue cast of a hand and arm, held in the studio')], 'cap': 'Material samples'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/lb/collage.webp', 'Every biomaterial from the thesis laid out as a catalogue of cut-outs')], 'cap': 'Catalog'},
], meta='Thesis · MFA Design · CCA · 2023–2024', frost='frost/p_lb.webp')
P[0]['video'] = 'v/lb-ai-04.mp4'  # Midjourney study, tagged thesis + ai; feathered background on the LB page

# 02 Watermelon Leather (old portfolio)
put(1, [
 {'t': 'lead', 'x': 'A four-month research and development project, formulating and prototyping a bio-leather material using watermelon waste.'},
 {'t': 'p', 'x': 'Watermelon, or Citrullus lanatus, is rich with proteins and amino acids, and the rind dry, fibrous, papery. Using a variety of methods for breaking down organic material, I recombined the watermelon with agar agar, glycerin, and sometimes natural pigment dyes, to create sheets and samples of usable “Watermelon Leather”.'},
 {'t': 'p', 'x': 'Forging leather alternatives has surprisingly less to do with reducing slaughterhouse practices, and more to do with the damaging and toxic treatments carried out on the hides in post-processing. Beyond the chemical waste and pollution, it’s the amount of water needed for each individual hide.'},
 {'t': 'drops', 'n': 17000, 'per': 1000, 'x': 'liters of water per “one cow-leather bag”'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/melon_held.webp', 'A sheet of brown watermelon leather held up against a grey wall'), I('img/melon_loop.webp', 'A watermelon leather key loop with visible stitching, hanging from a finger')], 'cap': 'Watermelon leather sheet and key loop'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/melon_sheet.webp', 'A rough-edged dried watermelon leather sample'), I('img/melon_fruit.webp', 'Watermelon flesh and a pink agar cast in the studio')], 'cap': 'Created in the studio facilities at CCA. Project short film created with Adobe Premiere Pro.'},
], meta='Biodesign · CCA · 2022', frost='frost/p_melon.webp')
P[1]['video'] = 'v/watermelon-bg.mp4'  # loop of the leather sheets from 'WaterLeather FULL VID 1.1' (E:\\MAC DESKTOP\\EOY MEDIA 2023)

# 03 M1ndfield (speculative exploration); the C-FAI is its product
P[2]['t'] = 'M1ndfield'; P[2]['full'] = 'M1ndfield: the C-FAI'; P[2]['f'] = 'Speculative exploration'
put(2, [
 {'t': 'lead', 'x': 'A speculative collaboration between Neuralink and M1ndfield, a company which specializes in neural frequency telecommunication.'},
 {'t': 'p', 'x': 'An experimental audio work was created to mimic the imagined experience a M1ndfield product, the C-FAI, would provide.'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/cfai_render.webp', 'The C-FAI: a translucent green body with a speaker, a serpentine coil and an antenna')], 'cap': 'C-FAI, sage colorway'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/cfai_pair.webp', 'Two C-FAI units, violet and sage, one standing on a glass plinth')], 'cap': 'Two colorways'},
 {'t': 'h2', 'x': 'The full experience'},
 {'t': 'p', 'x': 'The complementary film: a slow approach into the C-FAI, scored with the experimental audio work. Click a film to hear it.'},
 {'t': 'video', 'src': 'cfai', 'poster': 'cfai', 'title': 'C-FAI, full experience render', 'dur': '4:31'},
 {'t': 'h3', 'x': 'M1ndfield Collective'},
 {'t': 'video', 'src': 'm1ndfield-site', 'poster': 'm1ndfield-site', 'title': 'M1ndfield Collective, commercial site intro', 'dur': '4:51'},
 {'t': 'h2', 'x': 'Equipment studies'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/equip0.webp', 'Bench receiver: aluminium chassis with a clear lid over a circuit board'), I('img/equip2.webp', 'Machined dock holding two receivers'), I('img/equip1.webp', 'Acrylic sandwich panel on hex standoffs'), I('img/equip3.webp', 'Handheld field pod with a coiled cord')], 'cap': 'Equipment after the C-FAI, 2026 studies'},
 {'t': 'p', 'x': 'Created with Adobe Premiere Pro using Internet Archive materials, manipulated and created audio. 3D work built in Rhino, animated in Keyshot and Cinema4D.'},
], meta='Speculative exploration · CCA · 2022', frost='frost/p_cfai.webp')
P[2]['video'] = 'v/cfai.mp4'  # 'full experience render' (E:\\CCA 2022-2023\\CCA_Fall22\\Speculative Research\\C-FAI)

# 04 Gestural: background video from the sculpting timelapse
P[3]['video'] = 'v/sculpt-2248.mp4'

# 05 Form and Light
put(4, [
 {'t': 'lead', 'x': 'Black and white photography studies of form and light, developed week by week across a fall 2024 semester.'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/fl_cast.webp', 'A pale cast slab photographed in hard black and white light'), I('img/fl_room.webp', 'A dark interior with a reflective panel and a small white figure')], 'cap': None},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/fl_square.webp', 'Square on square: a dark frame inside a field of white speckles')], 'cap': 'Square on square'},
], meta='Photography · Fall 2024', frost='frost/p_fl.webp')

# 08 Chaos / soap dish: images from the old portfolio
put(7, [{'t': 'gal', 'cols': 1, 'imgs': [I('img/hand_amber.webp', 'A soft pink hand holding a glossy amber bar of soap, small iridescent bubbles drifting')], 'cap': 'Soap in hand'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/soap_words.webp', 'Slide: Key Expression Words, from Unpredictable to Demanding of attention, over a pink gradient')], 'cap': 'Key expression words'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/soap_render1.webp', 'Lumpy blue-grey soap dish floating above lavender'), I('img/soap_render2.webp', 'Close view of the bubbled dish rim with orange soap')], 'cap': 'Sculpted in Nomad, rendered with Keyshot, 2021'},
         {'t': 'gal', 'cols': 1, 'imgs': [I('img/soap_nomad.webp', 'Nomad sculpting screens of the dish in progress')], 'cap': None}], before=False)
# 09 Tree Stool
put(8, [{'t': 'gal', 'cols': 2, 'imgs': [I('img/stool_wood.webp', 'The Tree Stool rendered in walnut on a sunlit wood floor'), I('img/stool_curtain.webp', 'The Tree Stool rendered in grey before a green curtain')], 'cap': 'Sketched in Procreate, built with Rhino, 2021'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/st/st_cyc.webp', 'The Tree Stool in carved wood on a white studio cyclorama')], 'cap': 'Carved-wood render'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/st/st_draw.webp', 'Side and top drawings of the two-seat stool: two trunks with tilted oval seats')], 'cap': 'Side and top views'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/st/st_lines.webp', 'The seat form shaded and in contour lines, beside a line drawing of the stool with its seats')], 'cap': 'Seat form and line drawing'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/st/st_seat1.webp', 'A white crescent seat form in two sizes'), I('img/st/st_seat2.webp', 'A white folded seat form in two views, one on a round base')], 'cap': 'Seat studies'},
         {'t': 'gal', 'cols': 1, 'imgs': [I('img/stool_sketch.webp', 'Procreate sketches and Rhino studies of the saddle-stool')], 'cap': None}], before=False)
# 11 Lurvig
put(10, [
 {'t': 'lead', 'x': 'Concepts for an IKEA cat house, inspired by their Lurvig. Something soft, something cozy, something safe.'},
 {'t': 'p', 'x': 'Designs are based on user data, product reviews, and feline behavior analysis.'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/cat_renders.webp', 'Four cat house concepts: a box, a knit pod, a felt pod and a glossy sphere on legs')], 'cap': 'Built in Rhino, 2021'}], meta='Product redesign · 2021')
# 16 Early projects: the spiral staircase practice piece
put(15, [
 {'t': 'h2', 'x': 'Spiral staircase'},
 {'t': 'p', 'x': 'An exploratory practice project, playing with shape, array, and ambient environment. A spiral staircase in polar array about the axis of an internal cylinder. An offset of the cylinder creates the housing for the staircase, with archway entry and exit points. Two LED recessed light bands wrap the interior column.'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/stair_render0.webp', 'The staircase housing lit by a chartreuse LED glow, with an archway entry'), I('img/ribbons.webp', 'Glass ribbons and discs around a violet column in a pink haze')], 'cap': 'Built in Rhino, rendered with Keyshot, 2021'}], before=False)

# 17 Biomaterial Exploration: its own category (biodesign exploration), separate from the Watermelon project
P.append({'t': 'Biomaterial Exploration', 'full': 'Biodesign Exploration: Biomaterials', 'f': 'Biodesign exploration', 'img': 'membrane', 'slug': 'biomaterial-exploration',
          'num': '17', 'meta': 'Biodesign exploration · ongoing', 'frost': 'frost/p_membrane.webp', 'video': None, 'videoPending': False, 'blocks': [
 {'t': 'spec', 'x': [['Type', 'Biodesign exploration'], ['Materials', 'Agar agar, latex, glycerin, natural pigments, shell and other natural inclusions'], ['Status', 'Ongoing']]},
 {'t': 'lead', 'x': 'An open-ended search for new wearable materials that are skin-safe, sustainable and planet-positive.'},
 {'t': 'p', 'x': 'Running in parallel with my digital work, these are agar agar based materials made with glycerin, natural pigments and sometimes other natural components: shells, fibres, latex. I look for the aqueous and the membranous, sliding scales of translucency, materials that most closely resemble something alive, and that hold real potential for integrating technology into what we wear.'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/bx/bx_blue_membrane.webp', 'A translucent blue membrane draped over a hand, flecked with red pigment'), I('img/bx/bx_blue_membrane_close.webp', 'Close view of the blue membrane where red pigment pools')], 'cap': 'Blue membrane'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/bx/bx_membrane_macro.webp', 'Macro of a latex-agar membrane bloomed with blue and ochre pigment'), I('img/bx/bx_membrane.webp', 'Latex-agar membrane with blue and ochre pigment'), I('img/bx/bx_membrane_wide.webp', 'Wide view of a speckled latex-agar membrane')], 'cap': 'Latex-agar membrane with pigment'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/bx/bx_shell.webp', 'A shell set into a dark textured agar cast'), I('img/bx/bx_shell_back.webp', 'The same shell cast lit from behind, glowing violet and orange')], 'cap': 'Agar with shell, in daylight and backlit'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/bx/bx_incl.webp', 'An amber agar sheet with a small inclusion'), I('img/bx/bx_incl_zoom.webp', 'Close view of the inclusion suspended in amber agar')], 'cap': 'Agar with inclusion'},
 {'t': 'gal', 'cols': 2, 'imgs': [I('img/bx/bx_flex_back.webp', 'Textured agar flexed and backlit in red'), I('img/bx/bx_flex_dark.webp', 'Textured agar flexed, backlit, darker exposure')], 'cap': 'Textured agar in flex, backlit'},
 {'t': 'gal', 'cols': 3, 'imgs': [I('img/bx/bx_media.webp', 'A curved pink agar sheet flecked with pigment'), I('img/bx/bx_media_flex.webp', 'Grey agar media flexing'), I('img/bx/bx_rigid.webp', 'A rigid agar arch lit from below')], 'cap': 'Agar media, flexible and rigid'},
 {'t': 'gal', 'cols': 1, 'imgs': [I('img/bx/bx_group_photo.webp', 'A pile of agar and latex samples in pink, amber, black and clear')], 'cap': 'Samples together'},
 {'t': 'items', 'x': [['Agar agar', 'Algae. Brought to a boil at constant stir, then simmered. Powder dyes activate on contact with the gel and crawl like watercolor. At the right ratio it is flexible, tensile, sewable and long-lasting.'],
   ['Glycerin', 'A plant-derived oil that loosens agar in its gel state, diluting its stiffness.'],
   ['Latex', 'Natural rubber. Layers begin to deteriorate after a few weeks, but it adheres to fabrics and gives textiles a skin-like texture.']]},
]})

ABOUT = C.ABOUT.strip()
# About, layout 2 (approved 10/26 19:47): new opening line; the fellowship is highlighted in chartreuse in the bio
import re as _re0
ABOUT = _re0.sub(r'<p class="lead">.*?</p>', '<p class="lead">Hi, I\u2019m Ariana, a multimedia industrial and graphic designer, design and design systems researcher, and Embodied AI specialist.</p>', ABOUT, count=1, flags=_re0.S)
_BIO = ["My work has become a hybrid between industrial product design and abstract emotional investigation. Coming from fine art and mixed media, I approach design by asking how it might shape an emotion, an experience, or a relationship: the emotion of a thing, the experience of a place, our relationship to the world.",
        "At Drew University I explored mediums like oil and watercolor, acrylic, paper and mixed material assemblage, and ceramics, establishing material associations that would continue to guide how I make. At California College of the Arts I grew that into a cross-disciplinary practice, balancing an interplay between biomaterial whimsy, speculative world-building, CAD, CMF rendering, and rapid fabrication. My thesis, Learning Bodies, imagines biomimetic post-human anatomy, modular body modification, and bio-signaling technology inspired by deep-ocean creatures. It was nominated for the <mark class=\"hl\">Steve Jobs Fellowship in 2024</mark>.",
        "Today I work where bodies meet machines, in embodied AI, and every project still starts with the same questions: how does this feel, who is it for, and what can it teach us about being a body in the world?"]
ABOUT = ABOUT.split('</p>', 1)[0] + '</p>\n' + '\n'.join(f'<p>{p}</p>' for p in _BIO)   # Ariana's bio, 10/26 20:56
assert 'class="hl"' in ABOUT
data = {'projects': P, 'about': ABOUT, 'email': C.EMAIL, 'skills': C.SKILLS, 'tools': C.TOOLS, 'edu': C.EDU, 'exp': C.EXP,
        'timeline': C.SNIPPETS['practice'][0],
        'title': 'Multimedia Industrial and Graphic Designer',
        # cinematic playlist: project videos only (Learning Bodies now; Watermelon and C-FAI join when they arrive)
        'videos': [{'src': f'v/{k}.mp4', 'dur': round(float(__import__('subprocess').check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'/home/claude/site/shared/v/{k}.mp4'])), 1),
                    'title': ('Watermelon Leather Investigation · film, part ' + k[-1] + ' of 4') if k.startswith('watermelon') else
                             ('This Land This Water · thesis film, part ' + k[-1] + ' of 4') if k.startswith('thisland') else
                             'M1ndfield · C-FAI, full experience render' if k == 'cfai' else ('Learning Bodies · generative study ' + k[-2:]),
                    'tags': ['biodesign'] if k.startswith('watermelon') else ['speculative'] if k == 'cfai' else ['thesis'] if k.startswith('thisland') else ['thesis', 'ai']}
                   for k in ('lb-ai-01', 'lb-ai-02', 'lb-ai-03', 'lb-ai-04', 'lb-ai-05', 'lb-ai-06', 'lb-ai-07', 'lb-ai-08')]}

# 05 Form and Light: mirror test, Form Studio, Fall 2022 (confirmed 10/26 14:31)
put(4, [{'t': 'h2', 'x': 'Mirror test'},
        {'t': 'gal', 'cols': 2, 'imgs': [I('img/fl/mirror_10.webp', 'Round mirror render: a dark tray with a rough stone set in its centre'), I('img/fl/mirror_5.webp', 'Round mirror render: the tray in three-quarter view'), I('img/fl/mirror_4.webp', 'Round mirror render: the tray from above on a pale ground'), I('img/fl/mirror_6.webp', 'Round mirror render: the stone in low dark light')], 'cap': None},
        {'t': 'gal', 'cols': 1, 'imgs': [I('img/fl/mirror_9.webp', 'Round mirror render: the stone through mist')], 'cap': None},
        {'t': 'h3', 'x': 'Square on square'},
        {'t': 'gal', 'cols': 3, 'imgs': [I('img/fl/sq_3.webp', 'Square on square: a crumpled glass block against a speckled black ground'), I('img/fl/sq_5.webp', 'Square on square: the glass block, a second light'), I('img/fl/sq_7.webp', 'Square on square: the block as white light on black')], 'cap': 'Form Studio, CCA, Fall 2022. Modeled in Rhino, rendered in KeyShot.'}], before=False)

# 12 floor plans board; 13 and 14 Nomad renders (confirmed 10/26 15:28; the same set on both until sorted in the media library)
put(11, [{'t': 'gal', 'cols': 1, 'imgs': [I('img/fp/all.webp', 'Floor plans board: floor plan, space settings, circulation, merging concept')], 'cap': None},
         {'t': 'gal', 'cols': 2, 'imgs': [I('img/fp/plan.webp', 'Floor plan'), I('img/fp/space.webp', 'Space settings, zones in green, pink, blue and yellow'), I('img/fp/circ.webp', 'Circulation: round, oval, zigzag and free-form paths'), I('img/fp/merge.webp', 'Merging concept: the paths overlaid as soft colour')], 'cap': None}], before=False)
NP = [I('img/np/blob3.webp', 'A violet glass-like blob, Nomad render'), I('img/np/blob4.webp', 'The blob turned, light catching its rim'), I('img/np/blob5.webp', 'The blob from below, dark ground'),
      I('img/np/cool.webp', 'Chromatic aberration across a pink and violet form'), I('img/np/glass.webp', 'A ringed glass vessel on a pale ground')]
# (13 no longer carries the Nomad set: moved to 14 only in the media library, 10/26 17:44)
put(13, [{'t': 'gal', 'cols': 2, 'imgs': NP, 'cap': 'Sculpted in Nomad.'}], before=False)
# 05 is a category: photography and digital media exploring form, shape, light, composition and environment
P[4]['f'] = 'Photography · Digital media'; P[4]['meta'] = 'Photography and digital media'
P[4]['blocks'] = [b for b in P[4]['blocks'] if b['t'] != 'lead']
for b in P[4]['blocks']:
    if b['t'] == 'spec': b['x'] = [['Category', 'Form and Light'], ['Media', 'Photography and digital media'], ['Explores', 'Form, shape, light, composition and environment']]
put(4, [{'t': 'lead', 'x': 'Form and Light is a running category of work, some photography and some digital media, that explores form, shape, light, composition and environment.'}])
# 05 Form and Light body of work, picked in the Form and Light picker (10/26 18:21): grouped by study, newest first
_FL = json.load(open('/home/claude/site/fl_groups.json'))
P[4]['full'] = 'Form and Light'; P[4]['meta'] = 'Photography and digital media · CCA · Fall 2022'
_blk = [b for b in P[4]['blocks'] if b['t'] in ('spec', 'lead')]
for g in _FL:
    n = len(g['imgs'])
    _blk += [{'t': 'h3', 'x': g['t']}, {'t': 'gal', 'cols': 1 if n == 1 else 2 if n in (2, 4) else 3, 'imgs': [I(i[0], i[1]) for i in g['imgs']], 'cap': g['date'] + ' · ' + g['kind']}]
P[4]['blocks'] = _blk
# media library sort (10/26 17:44): images moved into projects are added; removals and "remove from site" applied
import re as _re, subprocess as _sp
MA = json.load(open('/home/claude/site/media_apply.json'))
ALT = {}
for _p in P:
    for _b in _p['blocks']:
        for _im in _b.get('imgs', []): ALT.setdefault(_im[0], _im[1])
def _alt(a, pname):
    if a['src'] in ALT: return ALT[a['src']]
    n = _re.sub(r'\.(jpe?g|png|webp)$', '', a['name'], flags=_re.I)
    if _re.match(r'^(IMG_|Screen ?[Ss]hot|Untitled|\d+$|DETAIL|bio_)', n) or len(n) < 4: return f'{pname}: process image'
    n = _re.sub(r'[._]?\d+$', '', n).replace('_', ' ').strip(' .')
    return f'{pname}: {n}'
_OFF = set(MA['off']); _RM = {}
for _n, _src in MA['rms']: _RM.setdefault(_n, set()).add(_src)
for _p in P:
    drop = _OFF | _RM.get(_p['num'], set())
    for _b in _p['blocks']:
        if 'imgs' in _b: _b['imgs'] = [x for x in _b['imgs'] if x[0] not in drop]
    _p['blocks'] = [b for b in _p['blocks'] if not ('imgs' in b and not b['imgs'])]
def _dur(k): return round(float(_sp.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', (f'/home/claude/site/shared/v/{k}.mp4' if __import__('os').path.exists(f'/home/claude/site/shared/v/{k}.mp4') else f'/home/claude/site/retired_v/{k}.mp4')])))
def _vtitle(k):
    if k.startswith('watermelon'): return 'Watermelon leather film, part ' + k[-1] + ' of 4'
    if k.startswith('thisland'): return 'This Land This Water, thesis film, part ' + k[-1] + ' of 4'
    return 'Generative study ' + k[-2:]
for _num, adds in sorted(MA['adds'].items()):
    _p = next(x for x in P if x['num'] == _num); pname = _p['full'] if _num != '03' else 'M1ndfield'
    have = {im[0] for b in _p['blocks'] for im in b.get('imgs', [])} | {b.get('src') for b in _p['blocks'] if b['t'] == 'video'}
    vids = sorted(a['src'][len('g/poster-'):-5] for a in adds if a['src'].startswith('g/poster-'))
    imgs = [a for a in adds if not a['src'].startswith('g/poster-')]
    imgs = [a for a in imgs if a['site']] + [a for a in imgs if not a['site']]
    blocks = []
    for k in vids:
        if k in have: continue
        _d = _dur(k); blocks.append({'t': 'video', 'src': k, 'poster': 'poster-' + k, 'title': _vtitle(k), 'dur': f'{_d // 60}:{_d % 60:02d}'})
    lst = [I(a['src'] if a['site'] else f"img/lib/{a['id']}.webp", _alt(a, pname)) for a in imgs]
    lst = [x for x in lst if x[0] not in have]
    if lst: blocks.append({'t': 'gal', 'cols': 1 if len(lst) == 1 else 2 if len(lst) <= 4 else 3, 'imgs': lst, 'cap': None})
    if blocks: put(P.index(_p), blocks, before=False)
# 03 retitled (10/26 17:44): M1ndfield is the subtitle
P[2]['t'] = P[2]['full'] = 'Speculative Design: M1ndfield Collective'; P[2]['sub'] = 'M1ndfield'
# header image on the Projects feature card: only images Ariana has confirmed (others fall back to the stair image)
HERO = {'01': 'img/hero/01_crop.webp', '02': 'img/melon_held.webp', '03': 'img/cfai_pair.webp', '04': 'img/hero/04_servo.webp', '05': 'img/fl_cast.webp',
        '07': 'img/mesh_magenta.webp', '08': 'img/hero/08_crop.webp', '09': 'img/st/st_lines.webp', '11': 'img/hero/11_crop.webp', '16': 'img/ribbons.webp', '17': 'img/bx/bx_incl.webp'}  # confirmed 10/26 13:51
for p in P: p['hero'] = HERO.get(p['num'])
# no confirmed header yet: the card shows the project's first image (no vignetted cut-outs, 10/26 18:21)
for p in P: p['hero2'] = next((b['imgs'][0][0] for b in p['blocks'] if b['t'] == 'gal' and b.get('imgs')), None)
# 10/27 20:46: projects without a confirmed header show their stair tread; 10 keeps its first gallery image
for p in P:
    if p['num'] == '10' and not p.get('hero'): p['hero'] = p['hero2']
    if not p.get('hero'): p['hero2'] = None
# stair treads: wireframes chosen in the stair tuner (10/26 14:50); 12 and 14 keep their tread images
TREAD = {'01': 'img/tread/01.webp', '02': 'img/tread/02.webp', '03': 'img/tread/03.webp', '04': 'img/tread/04.webp', '05': 'img/tread/05.webp', '06': 'img/tread/06.webp', '07': 'img/tread/07.webp', '08': 'img/tread/08.webp', '09': 'img/tread/09.webp', '10': 'img/tread/10.webp', '11': 'img/tread/11.webp', '13': 'img/tread/13.webp', '15': 'img/tread/15.webp', '16': 'img/tread/16.webp', '17': 'img/tread/17.webp'}
TREAD['12'] = 'img/tread/12.webp'  # floor plan wireframe (10/26 18:46)
TREAD['14'] = 'img/tread/14.webp'  # sculptprobe4, finer bands (approved 10/26 18:33)
for p in P: p['tread'] = TREAD.get(p['num'])
# cinematic reel (10/26 19:21): the long films now play at full source quality, cut into parts held in the artifact's asset store
_HQ = json.load(open('/home/claude/site/hq_videos.json'))
_FILMS = {'m1ndfield': ('M1ndfield Collective, commercial site intro', 'Speculative Design: M1ndfield Collective', ['speculative']), 'thisland': ('This Land This Water', 'Learning Bodies · thesis film', ['thesis']),
          'cfai': ('C-FAI, full experience render', 'Speculative Design: M1ndfield Collective', ['speculative']),
          'watermelon': ('Watermelon Leather Investigation', 'Biodesign · film', ['biodesign'])}
def _film(fid):
    ks = sorted(k for k in _HQ if k.startswith(fid + '-'))
    t, sub, tags = _FILMS[fid]
    return [{'src': _HQ[k]['src'], 'dur': round(_HQ[k]['dur'], 1), 'title': f'{t}, part {n + 1} of {len(ks)}', 'tags': tags, 'film': fid, 'filmTitle': t, 'sub': sub, 'part': n + 1, 'parts': len(ks)} for n, k in enumerate(ks)]
_rest = [v for v in data['videos'] if not any(x in v['src'] for x in ('thisland', 'cfai', 'watermelon'))]
for v in _rest: v.setdefault('sub', 'Learning Bodies · generative study')
data['videos'] = _film('thisland') + _film('cfai') + (_film('watermelon') if any(k.startswith('watermelon-') for k in _HQ) else [v for v in data['videos'] if 'watermelon' in v['src']]) + _rest
# project pages play the same full-quality films (10/26 19:38): one block per film, its parts running on without a gap
_AR = {'m1ndfield': '16/9', 'thisland': '7/4', 'cfai': '16/9', 'watermelon': '16/9'}
def _fdur(fid): s = round(sum(_HQ[k]['dur'] for k in _HQ if k.startswith(fid + '-'))); return f'{s // 60}:{s % 60:02d}'
for _p in P:
    out, done = [], set()
    for b in _p['blocks']:
        fid = next((f for f in _FILMS if b['t'] == 'video' and b.get('src', '').startswith(f)), None)
        if fid and fid in ('thisland', 'cfai', 'watermelon', 'm1ndfield'):
            if fid in done: continue
            done.add(fid); t, sub, _ = _FILMS[fid]
            out.append({'t': 'video', 'parts': [v['src'] for v in _film(fid)], 'ar': _AR[fid], 'poster': b['poster'] if fid in ('cfai', 'm1ndfield') else 'poster-' + fid + '-1',
                        'title': {'thisland': 'This Land This Water, thesis film', 'watermelon': 'Watermelon leather film', 'cfai': b['title'], 'm1ndfield': b['title']}[fid], 'dur': _fdur(fid)})
        else: out.append(b)
    _p['blocks'] = out
json.dump(data, open('/home/claude/site/shared/data.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('projects', len(P), [(p['num'], len(p['blocks'])) for p in P])
