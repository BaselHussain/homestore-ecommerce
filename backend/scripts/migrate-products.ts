/**
 * migrate-products.ts
 *
 * Reads a Thunderbit-exported CSV, generates product descriptions,
 * downloads each image, uploads to Cloudinary, and writes a bulk-import CSV.
 *
 * Usage:
 *   npx tsx scripts/migrate-products.ts <input.csv>
 *
 * Example:
 *   npx tsx scripts/migrate-products.ts "../first category.csv"
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CATEGORY = 'Toys';
const DEFAULT_STOCK = 10;
const PRODUCT_LIMIT = 5;

// ── Description generator ─────────────────────────────────────────────────────

function generateDescription(name: string): string {
  const n = name.toLowerCase();

  if (CATEGORY === 'Malta Souvenirs') {
  // ── Malta Souvenirs ──
  if (n.includes('luzzu')) return 'Iconic Maltese luzzu fishing boat souvenir — a colourful symbol of Malta\'s maritime heritage.';
  if (n.includes('malta bus') || n.includes('maltese bus')) return 'Classic vintage Malta bus souvenir, celebrating the island\'s iconic old-style karozzini buses.';
  if (n.includes('valletta')) return 'Beautiful Valletta-themed souvenir, celebrating Malta\'s UNESCO-listed capital city.';
  if (n.includes('mdina')) return 'Elegant Mdina souvenir inspired by Malta\'s ancient walled city, the Silent City.';
  if (n.includes('gozo') || n.includes('cittadella') || n.includes('dwejra') || n.includes('ta pinu') || n.includes('ta\'pinu') || n.includes('mgarr')) return 'Authentic Gozo souvenir capturing the beauty and charm of Malta\'s sister island.';
  if (n.includes('blue grotto')) return 'Stunning Blue Grotto souvenir, inspired by one of Malta\'s most spectacular natural landmarks.';
  if (n.includes('maltese cross') || (n.includes('cross') && (n.includes('malta') || n.includes('knight') || n.includes('scroll')))) return 'Traditional Maltese Cross souvenir — an iconic symbol of Malta\'s Knights of St John heritage.';
  if (n.includes('knight') || n.includes('knights')) return 'Handcrafted Knights of Malta souvenir, inspired by the island\'s rich crusader history.';
  if (n.includes('flag') || n.includes('malta flag') || n.includes('maltese flag')) return 'Malta national flag souvenir — a proud symbol of Maltese identity and heritage.';
  if (n.includes('tile') && (n.includes('malta') || n.includes('magnet') || n.includes('ceramic'))) return 'Traditional Maltese decorative tile souvenir, inspired by the island\'s distinctive balcony tile patterns.';
  if (n.includes('fish') && n.includes('magnet')) return 'Colourful Maltese fish-shaped souvenir magnet, handcrafted with traditional island motifs.';
  if (n.includes('fish')) return 'Decorative fish-shaped Malta souvenir, a nod to the island\'s rich fishing tradition.';
  if (n.includes('opener') || n.includes('bottle opener')) return 'Authentic Malta souvenir bottle opener — a practical and decorative keepsake from the Maltese islands.';
  if (n.includes('magnet')) return 'Authentic Malta souvenir magnet — a charming keepsake celebrating the beauty and culture of the Maltese islands.';
  if (n.includes('resin')) return 'Handcrafted Malta resin souvenir, featuring iconic island imagery and traditional Maltese designs.';
  if (n.includes('ceramic')) return 'Hand-painted Maltese ceramic souvenir, inspired by the island\'s rich artistic tradition.';
  if (n.includes('mdf')) return 'Unique MDF Malta souvenir, beautifully crafted with traditional Maltese designs and motifs.';
  if (n.includes('metal') || n.includes('tinplate')) return 'Quality metal Malta souvenir, featuring classic island scenes and Maltese symbols.';
  if (n.includes('map')) return 'Malta map souvenir — a beautiful reminder of the Maltese archipelago\'s unique shape and geography.';
  }

  if (CATEGORY === 'Toys') {
  // ── Toys ──
  if (n.includes('remote control') || n.includes('rc car') || n.includes('radio control')) return 'Exciting remote control toy, providing hours of fun and entertainment for children.';
  if (n.includes('building blocks') || n.includes('lego') || n.includes('blocks set')) return 'Creative building blocks set encouraging imagination, problem-solving, and learning through play.';
  if (n.includes('teddy') || n.includes('plush') || n.includes('soft toy') || n.includes('stuffed')) return 'Adorable soft plush toy, a cuddly companion and perfect gift for children of all ages.';
  if (n.includes('doll') || n.includes('barbie')) return 'Charming doll toy inspiring imaginative play and creative storytelling for children.';
  if (n.includes('puzzle')) return 'Engaging puzzle toy helping children develop concentration, logic, and problem-solving skills.';
  if (n.includes('board game') || n.includes('card game')) return 'Fun board or card game perfect for family game nights and entertaining children of all ages.';
  if (n.includes('art') || n.includes('craft') || n.includes('paint') || n.includes('colour') || n.includes('drawing')) return 'Creative arts and crafts kit encouraging artistic expression and imagination in children.';
  if (n.includes('bicycle') || n.includes('bike') || n.includes('scooter') || n.includes('tricycle')) return 'Fun ride-on toy promoting outdoor activity, balance, and coordination in children.';
  if (n.includes('ball') || n.includes('football') || n.includes('basketball')) return 'Durable sports ball encouraging active outdoor play and physical development in children.';
  if (n.includes('water') || n.includes('pool') || n.includes('splash')) return 'Exciting water toy perfect for outdoor summer fun and keeping children cool and entertained.';
  if (n.includes('action figure') || n.includes('superhero') || n.includes('robot')) return 'Exciting action figure toy inspiring imaginative adventures and creative play for children.';
  if (n.includes('musical') || n.includes('instrument') || n.includes('drum') || n.includes('guitar')) return 'Fun musical toy encouraging a love of music and creative expression in young children.';
  if (n.includes('car') || n.includes('truck') || n.includes('vehicle') || n.includes('train')) return 'Fun toy vehicle providing hours of imaginative play and entertainment for children.';
  if (n.includes('baby') || n.includes('infant') || n.includes('toddler')) return 'Safe and stimulating baby toy designed to support early development and sensory exploration.';
  if (n.includes('outdoor') || n.includes('garden') || n.includes('sandbox') || n.includes('swing')) return 'Fun outdoor toy encouraging active play, exercise, and enjoyment in the fresh air.';
  if (n.includes('armchair') || n.includes('chair') || n.includes('sofa') || n.includes('seat')) return 'Comfortable and fun children\'s chair or seat, perfectly sized for little ones.';
  }

  if (CATEGORY === 'Home Decor') {
  // ── Home Decor ──
  if (n.includes('mirror')) return 'Elegant decorative mirror adding depth, light, and style to any room in your home.';
  if (n.includes('lamp') || n.includes('light') || n.includes('lighting')) return 'Stylish home lamp or light fitting, creating the perfect ambience in any room.';
  if (n.includes('vase')) return 'Beautiful decorative vase, perfect for displaying fresh or dried flowers in your home.';
  if (n.includes('picture') || n.includes('painting') || n.includes('wall art') || n.includes('canvas')) return 'Stunning wall art piece adding colour, character, and personality to your living space.';
  if (n.includes('diffuser') || n.includes('reed')) return 'Elegant reed diffuser filling your home with a beautiful and long-lasting fragrance.';
  if (n.includes('plant') || n.includes('pot') && n.includes('flower')) return 'Stylish plant pot or planter, perfect for displaying your favourite indoor plants.';
  if (n.includes('clock') && !n.includes('alarm')) return 'Stylish wall or table clock, adding a functional and decorative touch to any room.';
  if (n.includes('photo frame') || n.includes('picture frame') || (n.includes('frame') && !n.includes('bed'))) return 'Elegant decorative frame, perfect for displaying cherished photos and memories.';
  if (n.includes('figurine') || n.includes('ornament') || n.includes('sculpture') || n.includes('statue')) return 'Beautiful decorative figurine or ornament, adding a unique artistic touch to your home.';
  if (n.includes('candle') || n.includes('candleholder') || n.includes('candle holder')) return 'Stylish candle or candle holder, creating a warm and cosy atmosphere in any room.';
  if (n.includes('cushion') || n.includes('pillow')) return 'Soft decorative cushion adding comfort and a stylish finishing touch to your sofa or bed.';
  if (n.includes('throw') || n.includes('blanket')) return 'Cosy decorative throw or blanket, perfect for adding warmth and texture to your living space.';
  if (n.includes('rug') || n.includes('carpet')) return 'Stylish decorative rug adding warmth, colour, and texture to any room in your home.';
  if (n.includes('shelf') || n.includes('shelves')) return 'Elegant floating shelf, perfect for displaying decorative items and keeping your home organised.';
  if (n.includes('curtain') || n.includes('blind')) return 'Stylish curtain or blind adding privacy and elegance to your windows and living spaces.';
  if (n.includes('basket') || n.includes('storage')) return 'Decorative storage basket combining style and functionality in any room of your home.';
  }

  if (CATEGORY === 'Gifts') {
  // ── Gifts ──
  if (n.includes('hamper') || n.includes('gift set') || n.includes('gift box')) return 'Beautifully presented gift set — the perfect choice for any special occasion or celebration.';
  if (n.includes('candle')) return 'Luxurious scented candle, ideal as a thoughtful gift to create a warm and relaxing atmosphere.';
  if (n.includes('photo frame') || n.includes('picture frame') || n.includes('frame')) return 'Elegant photo frame — a heartfelt personalised gift to cherish precious memories.';
  if (n.includes('jewellery') || n.includes('jewelry') || n.includes('bracelet') || n.includes('necklace') || n.includes('ring')) return 'Beautiful jewellery piece — a timeless and elegant gift for someone special.';
  if (n.includes('perfume') || n.includes('fragrance') || n.includes('cologne')) return 'Luxurious fragrance — a classic and sophisticated gift for any occasion.';
  if (n.includes('spa') || n.includes('bath') || n.includes('body')) return 'Indulgent spa and body gift set — perfect for treating someone to a relaxing self-care experience.';
  if (n.includes('chocolate') || n.includes('sweet') || n.includes('confection')) return 'Delightful confectionery gift — a delicious treat perfect for any celebration.';
  if (n.includes('wine') || n.includes('champagne') || n.includes('prosecco')) return 'Premium wine or champagne gift — an elegant choice for celebrations and special occasions.';
  if (n.includes('coffee') || n.includes('tea')) return 'Premium coffee or tea gift set — a perfect treat for the hot drink enthusiast in your life.';
  if (n.includes('teddy') || n.includes('plush') || n.includes('soft toy')) return 'Adorable plush soft toy — a cuddly and heartwarming gift loved by all ages.';
  if (n.includes('personalised') || n.includes('personalized') || n.includes('custom') || n.includes('engraved')) return 'Personalised gift — a unique and meaningful keepsake tailored especially for someone you care about.';
  if (n.includes('wallet') || n.includes('purse')) return 'Stylish wallet or purse — a practical and elegant gift for everyday use.';
  if (n.includes('watch') || n.includes('clock')) return 'Classic timepiece — a sophisticated and timeless gift for any occasion.';
  if (n.includes('bag') || n.includes('tote') || n.includes('handbag')) return 'Stylish bag — a fashionable and practical gift perfect for everyday use.';
  if (n.includes('book') || n.includes('journal') || n.includes('notebook')) return 'Thoughtful book or journal — a perfect gift for the creative or curious mind.';
  }

  if (CATEGORY === 'Household Goods') {
  // ── Household Goods ──
  if (n.includes('cabinet') || n.includes('cupboard') || n.includes('wardrobe')) return 'Sturdy and spacious storage cabinet, perfect for organising clothes, shoes, and household items.';
  if (n.includes('shoe cabinet') || n.includes('shoe rack')) return 'Practical shoe cabinet keeping your hallway tidy and your footwear neatly organised.';
  if (n.includes('drawer')) return 'Functional drawer unit providing ample storage space for everyday household items.';
  if (n.includes('pots') || n.includes('pans') || n.includes('cookware')) return 'Premium quality cookware set, perfect for everyday cooking on all cooktop types.';
  if (n.includes('cutlery') || n.includes('flatware')) return 'Elegant stainless steel cutlery set, dishwasher safe and perfect for everyday dining.';
  if (n.includes('knife') || n.includes('knives')) return 'Sharp and durable kitchen knife, designed for precision cutting and everyday use.';
  if (n.includes('laundry') || n.includes('washing')) return 'Practical laundry storage solution, keeping your home tidy and organised.';
  if (n.includes('basket')) return 'Stylish and functional storage basket, ideal for organising any room in the home.';
  if (n.includes('ladder')) return 'Sturdy and lightweight aluminium ladder, safe and easy to use for home tasks.';
  if (n.includes('heater') || n.includes('radiator')) return 'Efficient home heater providing reliable warmth and comfort during colder months.';
  if (n.includes('fan')) return 'Powerful and energy-efficient fan, keeping your home cool and comfortable.';
  if (n.includes('iron') || n.includes('ironing')) return 'Reliable clothes iron delivering smooth, wrinkle-free results every time.';
  if (n.includes('vacuum') || n.includes('hoover')) return 'Powerful vacuum cleaner for deep cleaning carpets and hard floors with ease.';
  if (n.includes('mop') || n.includes('broom') || n.includes('dustpan')) return 'Practical cleaning tool for keeping your home spotless and hygienic.';
  if (n.includes('bin') || n.includes('waste') || n.includes('trash')) return 'Hygienic and functional waste bin, a practical addition to any kitchen or bathroom.';
  if (n.includes('napkin') || n.includes('tissue')) return 'Elegant napkin holder keeping your dining table neat and stylish.';
  if (n.includes('bowl') || n.includes('mixing bowl')) return 'Versatile mixing bowl set, ideal for cooking, baking, and food preparation.';
  if (n.includes('colander') || n.includes('strainer')) return 'Durable colander for draining pasta, vegetables, and more with ease.';
  if (n.includes('storage') || n.includes('container') || n.includes('box')) return 'Practical storage container keeping your kitchen and home organised and clutter-free.';
  if (n.includes('tray')) return 'Stylish serving tray, perfect for breakfast in bed or entertaining guests.';
  if (n.includes('scale') || n.includes('weighing')) return 'Accurate kitchen scale for precise measurements in cooking and baking.';
  if (n.includes('toaster')) return 'Compact and efficient toaster delivering perfectly golden toast every morning.';
  if (n.includes('kettle')) return 'Fast-boiling electric kettle, a kitchen essential for tea, coffee, and more.';
  if (n.includes('clock')) return 'Stylish wall clock adding a functional and decorative touch to any room.';
  if (n.includes('shelf') || n.includes('shelves') || n.includes('rack')) return 'Space-saving shelf or rack, ideal for organising your home efficiently.';
  if (n.includes('hook') || n.includes('hanger')) return 'Practical wall hooks for keeping coats, bags, and accessories neatly organised.';
  if (n.includes('mat') || n.includes('rug')) return 'Soft and durable mat, adding comfort and style to your home floors.';
  if (n.includes('towel')) return 'Soft and absorbent towel, a bathroom and kitchen essential for everyday use.';
  if (n.includes('curtain') || n.includes('blind')) return 'Stylish window curtain or blind, adding privacy and elegance to any room.';
  if (n.includes('pillow') || n.includes('cushion')) return 'Comfortable cushion or pillow, perfect for adding softness and style to your living space.';
  if (n.includes('blanket') || n.includes('throw')) return 'Cosy blanket or throw, ideal for staying warm and comfortable at home.';
  if (n.includes('bottle') || n.includes('flask') || n.includes('thermos')) return 'Insulated bottle or flask keeping drinks hot or cold for hours on the go.';
  if (n.includes('glass') || n.includes('mug') || n.includes('cup')) return 'Quality glass or mug, perfect for enjoying your favourite hot or cold beverages.';
  if ((n.includes('plate') || n.includes('dish')) && !n.includes('plated')) return 'Durable and elegant plate or dish, a stylish addition to your dining table.';
  }

  if (CATEGORY === 'Outdoor Furniture') {
  // ── Outdoor Furniture ──
  if (n.includes('sofa')) return 'Comfortable and stylish outdoor sofa, perfect for garden lounging and entertaining.';
  if (n.includes('gazebo')) return 'Sturdy outdoor gazebo providing shade and shelter for garden gatherings.';
  if (n.includes('sun bed') || n.includes('sunlounge') || n.includes('sun lounge') || n.includes('lounge')) return 'Adjustable outdoor sun lounger for relaxing poolside or in the garden.';
  if (n.includes('beach bed')) return 'Lightweight beach bed ideal for the beach or poolside relaxation.';
  if (n.includes('camping bed')) return 'Portable and foldable camping bed, great for outdoor adventures.';
  if (n.includes('beach chair') || n.includes('beach')) return 'Durable and portable beach chair with comfortable seating for outdoor use.';
  if (n.includes('director chair')) return 'Classic director chair with side table, ideal for outdoor events and garden use.';
  if (n.includes('camping chair') || n.includes('camp')) return 'Lightweight folding camping chair, easy to carry and set up anywhere outdoors.';
  if (n.includes('zero gravity')) return 'Ergonomic zero gravity recliner chair for ultimate outdoor relaxation.';
  if (n.includes('folding chair') || (n.includes('chair') && n.includes('fold'))) return 'Practical folding chair that is easy to store and ideal for outdoor events.';
  if (n.includes('armchair') || n.includes('arma chair') || n.includes('arm chair')) return 'Comfortable outdoor armchair with sturdy construction for garden and patio use.';
  if (n.includes('stool')) return 'Compact and durable outdoor stool suitable for garden, patio, or camping.';
  if (n.includes('chair')) return 'Durable outdoor chair with a modern design, suitable for garden and patio use.';
  if (n.includes('umbrella stand') || n.includes('parasol base')) return 'Heavy-duty umbrella stand providing a stable base for outdoor parasols.';
  if (n.includes('beach umbrella') || n.includes('hawaii umbrella')) return 'Vibrant and UV-protective beach umbrella, perfect for sun protection outdoors.';
  if (n.includes('umbrella')) return 'Quality outdoor umbrella offering shade and protection from sun and light rain.';
  if (n.includes('folding table') || (n.includes('table') && n.includes('fold'))) return 'Practical folding table that is lightweight and easy to store, ideal for outdoor use.';
  if (n.includes('coffee table')) return 'Stylish outdoor coffee table, perfect for garden seating areas.';
  if (n.includes('side table')) return 'Convenient outdoor side table, great for placing drinks and accessories.';
  if (n.includes('table')) return 'Durable outdoor table with a modern design, perfect for garden dining and entertaining.';
  if (n.includes('set') || n.includes('conversion set')) return 'Complete outdoor furniture set, ideal for creating a stylish and comfortable garden space.';
  if (n.includes('tent')) return 'Lightweight and easy-to-assemble camping tent for outdoor adventures.';
  if (n.includes('beverage cart')) return 'Stylish outdoor beverage cart for serving drinks at garden parties.';
  }

  const categoryFallbacks: Record<string, string> = {
    'Malta Souvenirs': `Authentic Malta souvenir — ${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}. A unique keepsake from the Maltese islands.`,
    'Outdoor Furniture': `Quality outdoor product — ${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}. Durable and designed for outdoor use.`,
    'Household Goods': `Practical household item — ${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}. Quality design for everyday home use.`,
    'Gifts': `Thoughtful gift item — ${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}. Perfect for any occasion.`,
    'Toys': `Fun and engaging toy — ${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}. Designed to inspire creativity and play.`,
    'Home Decor': `Stylish home decor piece — ${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}. Add character and elegance to any room.`,
  };
  return categoryFallbacks[CATEGORY] ?? `${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}.`;
}

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (values[i] ?? '').trim(); });
    return row;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function toCsvLine(values: string[]): string {
  return values.map(v => `"${v.replace(/"/g, '""')}"`).join(',');
}

// ── Image downloader ──────────────────────────────────────────────────────────

function uploadFileToCloudinary(filePath: string, slug: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      folder: 'homestore',
      public_id: slug,
      overwrite: true,
      resource_type: 'image',
    }, (err, result) => {
      if (err || !result) return reject(err ?? new Error('Upload failed'));
      resolve(result.secure_url);
    });
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const [,, inputArg, imagesFolderArg] = process.argv;
  if (!inputArg || !imagesFolderArg) {
    console.error('Usage: npx tsx scripts/migrate-products.ts <input.csv> <images-folder>');
    console.error('Example: npx tsx scripts/migrate-products.ts "../first category.csv" "../images"');
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const imagesFolder = path.resolve(process.cwd(), imagesFolderArg);

  if (!fs.existsSync(inputPath)) { console.error(`CSV not found: ${inputPath}`); process.exit(1); }
  if (!fs.existsSync(imagesFolder)) { console.error(`Images folder not found: ${imagesFolder}`); process.exit(1); }

  // Build a map of filename → full path for quick lookup
  const imageFiles = fs.readdirSync(imagesFolder);
  const imageMap = new Map<string, string>();
  imageFiles.forEach(f => imageMap.set(f.toLowerCase(), path.join(imagesFolder, f)));
  console.log(`\n🖼️  Found ${imageFiles.length} images in folder`);

  const allRows = parseCsv(fs.readFileSync(inputPath, 'utf8'));
  const rows = allRows.slice(0, PRODUCT_LIMIT);
  console.log(`📦 Processing ${rows.length} of ${allRows.length} products | Category: ${CATEGORY} | Stock: ${DEFAULT_STOCK}\n`);

  const outputRows: string[] = [
    toCsvLine(['name', 'description', 'price', 'originalPrice', 'stock', 'category', 'badge', 'images', 'itemCode'])
  ];

  let success = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row['Product Name'] || '';
    const imageUrl = row['Product Image'] || '';
    const itemCode = row['Item Code'] || '';
    const price = (row['Price (EUR)'] || '0').replace(/[^0-9.]/g, '');
    const description = generateDescription(name);

    if (!name) { console.log(`  ⚠️  [${i + 1}/${rows.length}] Skipping — no name`); failed++; continue; }

    const slug = (itemCode || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

    // Extract filename from image URL to find the local file
    const imageFilename = imageUrl ? path.basename(imageUrl).toLowerCase() : '';
    const localFilePath = imageFilename ? imageMap.get(imageFilename) : undefined;

    process.stdout.write(`  [${i + 1}/${rows.length}] ${name.slice(0, 45).padEnd(45)} `);

    let cloudinaryUrl = '';
    try {
      if (localFilePath) {
        cloudinaryUrl = await uploadFileToCloudinary(localFilePath, slug);
        console.log('✅');
        success++;
      } else {
        console.log('⚠️  image not found in folder');
        failed++;
      }
    } catch (err: any) {
      console.log(`❌ ${err.message}`);
      failed++;
    }

    outputRows.push(toCsvLine([
      name, description, price, '', String(DEFAULT_STOCK),
      CATEGORY, '', cloudinaryUrl, itemCode,
    ]));

    await new Promise(r => setTimeout(r, 150));
  }

  const outputName = `products-ready-${CATEGORY}.csv`;
  const outputPath = path.resolve(process.cwd(), '..', outputName);
  fs.writeFileSync(outputPath, outputRows.join('\n'), 'utf8');

  console.log(`\n✅ Done! ${success} uploaded, ${failed} failed`);
  console.log(`📄 Output saved to: ${outputPath}\n`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
