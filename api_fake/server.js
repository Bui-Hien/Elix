import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper to read and clean JSON comments
function readJsonFile(fileName) {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/^\/\/.*$/gm, ''); // remove single line comments
        return JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing JSON from ${fileName}:`, e);
        return null;
    }
}

// Serve static files
function serveStaticFile(filePath, res) {
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: 'Static file not found' }));
        return;
    }
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: 'Not a file' }));
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const MIME = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    };
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
    // CORS headers
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // Serve static files under /images or /logo
    if (pathname.startsWith('/images/')) {
        const relPath = decodeURIComponent(pathname.substring(8));
        const filePath = path.join(projectRoot, 'public', 'images', relPath);
        serveStaticFile(filePath, res);
        return;
    }

    if (pathname.startsWith('/logo/')) {
        const relPath = decodeURIComponent(pathname.substring(6));
        const filePath = path.join(projectRoot, 'public', 'logo', relPath);
        serveStaticFile(filePath, res);
        return;
    }

    // Default Content-Type to JSON for API endpoints
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // API endpoints
    if (pathname === '/api/stones/categories') {
        // Return 5 main categories that map beautifully to tabs in the Next.js sidebar
        const categories = [
            { id: 1, name: 'Đá Quý', slug: 'stone', isRequiredFirst: false },
            { id: 2, name: 'Linh Vật', slug: 'charm', isRequiredFirst: false },
            { id: 3, name: 'Phụ Kiện', slug: 'spacer', isRequiredFirst: false },
            { id: 4, name: 'Charm Bạc', slug: 'metal', isRequiredFirst: false },
            { id: 5, name: 'Chốt Chặn', slug: 'stopper', isRequiredFirst: true }
        ];
        res.writeHead(200);
        res.end(JSON.stringify(categories));
    } 
    else if (pathname === '/api/beads/categories') {
        const oldCats = readJsonFile('api_beads_categories.json');
        res.writeHead(200);
        res.end(JSON.stringify(oldCats));
    }
    else if (pathname === '/api/beads') {
        const oldBeadsData = readJsonFile('api_beads.json');
        res.writeHead(200);
        res.end(JSON.stringify(oldBeadsData));
    }
    else if (pathname === '/api/stones') {
        const oldBeadsData = readJsonFile('api_beads.json');
        if (!oldBeadsData || !oldBeadsData.success) {
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, message: 'Could not load old beads data' }));
            return;
        }

        const { materials = [], specifications = [] } = oldBeadsData.data;

        // Create a fast lookup map for materials
        const materialMap = new Map(materials.map(m => [m.id, m]));

        const stoneList = [];
        let idCounter = 1;

        for (const spec of specifications) {
            const material = materialMap.get(spec.material_id);
            if (!material) continue;

            // Determine Type / Category mapping based on name and category_id
            let mappedType = 'stone';
            const specNameLower = spec.name.toLowerCase();
            const matNameLower = material.name.toLowerCase();

            const isStopper = specNameLower.includes('chốt') || 
                              specNameLower.includes('chặn') || 
                              matNameLower.includes('chốt') || 
                              matNameLower.includes('chặn');

            if (isStopper) {
                mappedType = 'stopper';
            } else if (material.category_id === 22) { // 隔珠 -> Spacers
                mappedType = 'spacer';
            } else if (material.category_id === 28) { // 异形珠 / 异形 -> Charms
                mappedType = 'charm';
            } else {
                mappedType = 'stone';
            }

            // Extract shapes for charms
            let shape = 'sphere';
            if (mappedType === 'charm') {
                if (specNameLower.includes('trái tim') || specNameLower.includes('tim')) shape = 'heart';
                else if (specNameLower.includes('sao')) shape = 'star';
                else if (specNameLower.includes('tuyết')) shape = 'snowflake';
                else if (specNameLower.includes('bướm')) shape = 'butterfly';
                else if (specNameLower.includes('vòng') || specNameLower.includes('khoen')) shape = 'ring';
                else if (specNameLower.includes('trụ')) shape = 'tube';
            }

            // Build stone objects for each valid size
            const sizes = [0, 4, 6, 8, 10, 11, 12, 15];
            for (const size of sizes) {
                const priceKeyMm = `${size}mm`;
                const priceKeyStr = `${size}`;
                const price = spec.prices?.[priceKeyMm] || spec.prices?.[priceKeyStr];
                
                if (price && price > 0) {
                    const uniqueId = idCounter++;
                    stoneList.push({
                        id: uniqueId,
                        name: size === 0 ? `${spec.name} Đệm` : `${spec.name} ${size}mm`,
                        color: material.hex_color || '#888888',
                        size: size,
                        displaySize: size === 0 ? 'Đệm' : `${size}mm`,
                        price: price,
                        shape: shape,
                        imageUrl: spec.image,
                        stoneCategory: {
                            slug: mappedType,
                            name: mappedType === 'stone' ? 'Đá Quý' : 
                                  mappedType === 'charm' ? 'Linh Vật' : 
                                  mappedType === 'spacer' ? 'Phụ Kiện' : 
                                  mappedType === 'metal' ? 'Charm Bạc' : 'Chốt Chặn'
                        }
                    });
                }
            }
        }

        res.writeHead(200);
        res.end(JSON.stringify(stoneList));
    } 
    else if (pathname === '/api/admin/bracelet-bases/public') {
        // Return 2 realistic mock bracelet bases for mini and single modes
        const mockBases = [
            {
                id: 1,
                name: 'Dây Cáp Bạc (Mini)',
                price: 450000,
                imageUrl: '/brand/vong_2.png',
                ellipseCenterX: 0.5,
                ellipseCenterY: 0.5,
                ellipseRadiusX: 0.38,
                ellipseRadiusY: 0.3,
                arcStartAngle: 3.665, // ~210 degrees in radians
                arcEndAngle: 5.76,     // ~330 degrees in radians
                isSingleStoneMode: false
            },
            {
                id: 2,
                name: 'Dây Chuyền Vàng (Single)',
                price: 850000,
                imageUrl: '/brand/vong_3.png',
                ellipseCenterX: 0.5,
                ellipseCenterY: 0.5,
                ellipseRadiusX: 0.35,
                ellipseRadiusY: 0.35,
                isSingleStoneMode: true,
                singleStoneX: 0.5,
                singleStoneY: 0.78
            }
        ];
        res.writeHead(200);
        res.end(JSON.stringify(mockBases));
    } 
    else if (pathname === '/api/customproducts' && req.method === 'POST') {
        // Mock successful custom product creation
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log('Received custom product body:', body);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, id: Math.floor(Math.random() * 10000) + 1 }));
        });
    } 
    else if (pathname.startsWith('/api/cart/items/') && req.method === 'POST') {
        // Mock successful item addition to cart
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
    }
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: 'API Route not matched in fake server' }));
    }
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 NextJS Fake Backend Server running at http://localhost:${PORT}`);
    console.log(`======================================================`);
});
