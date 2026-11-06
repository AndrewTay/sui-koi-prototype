# Artwork and prompts

The original four assets were generated with the built-in Imagegen tool for this project. No CLI/API fallback was used. Original generated files were copied into this project and their alpha channels were preserved. No external website artwork or rendering code was reused.

## Landscape pond

Saved asset: `assets/pond.png`

Prompt:

Use case: photorealistic-natural. Asset type: background artwork for an immersive premium koi website, landscape 1536x1024. Create a beautiful cinematic straight overhead photograph of a Japanese zen garden pond. Water is deep transparent jade teal with a tranquil large open central expanse, subtle submerged smooth gray river stones visible along the lower right and right edge, dark deep clear water toward center-left so ivory website text can be overlaid. Natural weathered boulders with velvety moss and fine Japanese maple foliage frame ONLY the extreme outer corners, with especially lovely delicate green leaves at top right and lower left. Strong sense of depth, beautifully restrained dappled late afternoon light, slightly hazy painterly botanical richness but photoreal natural detail. Very subtle caustic light, not a strong fixed white grid; moving water effects will be added in code. Composition roughly 80% open water, not a narrow stream. Calm luxurious editorial art direction. Absolutely NO fish, NO animals, NO text, NO logos, NO interface, NO border. Entire scene top-down no horizon. Full bleed.

## Transparent hero koi

Saved asset: `assets/kohaku.png`

Prompt:

Use case: product-mockup. Asset type: transparent PNG sprite for a high-end real-time koi pond website. Generate exactly ONE exquisite photoreal Japanese Kohaku koi, entirely isolated on a genuinely TRANSPARENT background with an alpha channel. Perfectly orthographic straight overhead view, straight body aligned VERTICALLY with rounded HEAD at TOP and tail at BOTTOM. Full animal completely visible with generous transparent padding, centered in a portrait 1024x1536 image. A natural robust koi silhouette, luminous ivory pearly overlapping scales with organic vivid vermilion red patches across its back and crown. Intricately detailed translucent ivory pectoral fins extended symmetrically on both sides, small dark glossy eyes at sides of head, delicate long translucent forked tail. Body essentially straight at rest suitable for mesh animation, NOT curved into a C. Soft warm light from upper left, realistic 3D form, impeccable anatomy. NO background color, NO water, NO ground, NO shadow outside fish, NO objects, NO typography, NO additional fish. It must be a beautiful real fish photographed from directly above, not a diagram or cartoon.

## Three-column transparent catalog sprite sheet

Saved asset: `assets/catalog.png`

Prompt:

Use case: product-mockup. Asset type: THREE-COLUMN sprite sheet for premium koi catalog. Create a landscape 1536x1024 image on genuinely transparent background with alpha. Three separate exquisite photoreal Japanese koi, arranged in THREE EQUAL WIDTH COLUMNS, one koi centered in each column. All three perfectly straight vertical head at TOP tail at BOTTOM, full bodies with transparent space between them, no overlap. LEFT column: Kohaku ivory koi with organic vermilion red patches. MIDDLE column: Showa koi with beautiful black, ivory white, and vermilion patches. RIGHT column: Yamabuki Ogon koi with luminous metallic golden yellow scales. Each has realistic detailed pearly scales, anatomically natural full koi body, delicate translucent fins and forked tail. Each fish occupies about 80 percent image HEIGHT, about 70 percent of its own column WIDTH including fins. Symmetrical orthographic straight overhead catalog photography, warm soft studio light from upper left, consistent scale and lighting. Exactly THREE fish. No water, no shadows outside the animals, no text, no labels, no grid, no lines, no logos. Real transparent background, not a checkerboard pattern.

## Portrait pond, adapted from the landscape pond

Saved asset: `assets/pond-mobile.png`

Prompt:

Use case: photorealistic-natural. Adapt this pond background into a beautiful PORTRAIT 1024x1536 mobile website background. Input image is style and palette reference. Keep the same deep clear jade teal water, organic photoreal detail, luxurious late afternoon zen garden atmosphere. Orthographic top-down view of a Japanese garden pond. Compose delicate Japanese maple foliage and a few moss-covered weathered stones along extreme TOP RIGHT and BOTTOM LEFT corners, with a slim irregular garden bank on the far right edge. Large open center-left water space with deep dark jade suitable for ivory typography in the upper half; clear turquoise lower half for an animated fish that will be added separately. Submerged smooth stones subtly visible near lower right edge. Rich natural photographic detail, restrained dappled sun and subtle caustics. 85 percent water. ABSOLUTELY NO FISH, animals, text, UI, border or watermark. Not a narrow stream. Calm refined full-bleed background.

## Distinct additional varieties — 26 September 2026

These two new sprite sheets replace all six CSS palette treatments. Each is a 1536 × 1024 RGBA image, with its original transparency preserved. Built-in Imagegen was used with `assets/catalog.png` as a style reference. The source PNGs were copied into the project without image manipulation. All imagery is illustrative, not a photograph of real inventory.

### catalog-sanke-tancho-goshiki.png

Saved asset: `assets/catalog-sanke-tancho-goshiki.png`

Prompt:

Create a high fidelity photorealistic product catalog sprite sheet of exactly THREE distinct Japanese koi on a genuinely transparent alpha background. Landscape 1536x1024. Three equal width columns, each fish centered precisely at x=256,768,1280. All fish straight and vertical with head at TOP and tail at BOTTOM. Entire anatomy including delicate translucent pectoral fins and forked tail contained INSIDE its own column; 8% transparent margin around each fish. Each occupies 86% of total height. Match the reference image's overhead view, soft light, natural scales and anatomical detail, but replace its three fish with: LEFT Sanke: ivory base, irregular rich vermilion red patches and SMALL isolated jet-black patches on its BACK, head white and red with NO black on head. CENTER Tancho Kohaku: entirely pearl ivory white body, exactly one circular vermilion red mark centered on its forehead; NO red anywhere else, NO black anywhere. RIGHT Goshiki: dark slate blue-grey reticulated scale ground, rich deep red islands on top, darker netting along flank. Natural robust mature koi proportions, not skinny eels, not sharks. Consistent size and soft warm light from upper left. Reference is style only. No water, no background, no baked shadows, no backdrop glow, no text, no dividing lines, no labels. The alpha channel outside each fish must be fully transparent. This is a production sprite sheet, not an infographic.

### catalog-kujaku-shiro-chagoi.png

Saved asset: `assets/catalog-kujaku-shiro-chagoi.png`

Prompt:

Create a high fidelity photorealistic product catalog sprite sheet of exactly THREE distinct Japanese koi on a genuinely transparent alpha background. Landscape 1536x1024. Three equal width columns, each fish centered precisely at x=256,768,1280. All fish straight and vertical with head at TOP and tail at BOTTOM. Entire anatomy including delicate translucent pectoral fins and forked tail contained INSIDE its own column; 8% transparent margin around each fish. Each occupies 86% of total height. Match the reference image's overhead view, soft light, natural scales and anatomical detail, but replace its three fish with: LEFT Kujaku: metallic platinum white base, striking orange-red patches across head and back, fine dark netlike reticulation clearly visible on individual dorsal scales. CENTER Shiro Utsuri: black base with large crisp ivory white wraps, black and white on head and body, NO red NO orange NO gold. RIGHT Chagoi: solid earthy tea-brown bronze body, slightly darker scale edges; NO red, NO white patches, NO black patches, NOT bright gold. Natural robust mature koi proportions, not skinny eels, not sharks. Consistent size and soft warm light from upper left. Reference is style only. No water, no background, no baked shadows, no backdrop glow, no text, no dividing lines, no labels. The alpha channel outside each fish must be fully transparent. This is a production sprite sheet, not an infographic.

## Mizu marketplace update

The six PNGs in the supplied Mizu App export were compared with the existing files and were byte-identical. Marketplace icons and component media reuse `packages/mizu-ui/src/assets`. `assets/inter.woff2` was downloaded from the Inter font URL referenced by the export (`https://static.figma.com/font/Inter_1`) and is served locally. Non-koi department photos are data-supplied Unsplash URLs retained from the export; they are previews and require network access.
