// smart-space/app.js
// Pure JS: Collects form data, validates, computes and renders basic layout suggestion

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('designer-form');
    const output = document.getElementById('designer-output');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Get values
        const roomType = form.roomType.value;
        const length = parseFloat(form.length.value);
        const width = parseFloat(form.width.value);
        const requirements = form.requirements.value.trim();

        // Basic validation
        if (!roomType || isNaN(length) || isNaN(width) || length < 1 || width < 1) {
            renderError('Please provide valid dimensions and room type.');
            return;
        }
        if (!requirements) {
            renderError('Please provide requirements, e.g., "2 beds, 1 bathroom".');
            return;
        }
        // Compute suggestion
        suggestLayout({ roomType, length, width, requirements });
    });

    function renderError(msg) {
        output.innerHTML = `<div class="error-message">${msg}</div>`;
    }

    function suggestLayout({ roomType, length, width, requirements }) {
        output.innerHTML = '';
        const area = length * width;
        // Parse requirements into items
        const reqList = requirements.split(',').map(x => x.trim()).filter(Boolean);

        // Make basic allocation: attempt to assign space for each requirement
        let roomAreas = [];
        let totalRoomArea = 0;
        reqList.forEach((req) => {
            // Extract number and label
            let m = req.match(/(\d+)\s*([A-Za-z ]+)/);
            let count = 1, label = req;
            if (m) {
                count = parseInt(m[1], 10) || 1;
                label = m[2].trim();
            }
            // Typical sizes (ft²) based on type/label
            let typicalSizes = {
                'bed': 120, 'bedroom': 120, 'bathroom': 50, 'toilet': 40, 'kitchen': 80,
                'living': 170, 'living room': 170, 'hall': 170, 'study': 90, 'office': 110,
                'shop': 150, 'store': 70, 'storage': 65, 'parking': 140, 'garage': 180
            };
            let key = label.toLowerCase();
            let szGuess = 70 + Math.floor(Math.random() * 30); // fallback
            Object.keys(typicalSizes).forEach(k => {
                if (key.includes(k)) szGuess = typicalSizes[k];
            });
            for (let i = 1; i <= count; ++i) {
                roomAreas.push({ label: `${label}${count > 1 ? ' ' + i : ''}`, size: szGuess });
                totalRoomArea += szGuess;
            }
        });

        // Add some open/general area
        let openArea = Math.max(0, area - totalRoomArea);
        // Compose layout blocks - up to 7 blocks shown in simple SVG
        let nRooms = roomAreas.length;
        let summary = `<div class="layout-summary">
            <b>Dimensions:</b> ${length} x ${width} ft = <b>${area} ft²</b> <br>
            <b>Room type:</b> ${roomType}<br>
            <b>Requirements:</b> ${reqList.join(', ')}<br>
            <b>Suggested Build-up:</b> ${totalRoomArea} ft² (${nRooms} room${nRooms>1?'s':''})<br>
            <b>Open/unassigned:</b> ${openArea} ft²
        </div>`;

        // If total required room area is too large, show warning
        if (totalRoomArea > area) {
            output.innerHTML = summary + `<div class="error-message">The requirements need about <b>${totalRoomArea} ft²</b>,<br>but the selected area provides only <b>${area} ft²</b>.<br>Consider reducing number of rooms or enlarging the space.</div>`;
            return;
        }
        // Draw a basic layout schematic (SVG rectangles)
        output.innerHTML = summary + renderLayoutSVG(length, width, roomAreas, openArea);
    }

    function renderLayoutSVG(length, width, roomAreas, openArea) {
        // Map the space (scaled 1:10, but fit to 310px wide max)
        const maxPx = 310;
        // Adjust scale so that largest dim matches maxPx
        let scale = Math.min(maxPx/length, 190/width);
        // Room block arrangements
        let svgRooms = '';
        // Sort largest rooms first
        let sortedRooms = roomAreas.slice().sort((a,b)=>b.size-a.size);
        let x = 10, y = 10, pxw = Math.round(length*scale), pxh = Math.round(width*scale);
        let curX = x+3, curY = y+3;
        let nCols = sortedRooms.length > 4 ? 2 : 1;
        let colW = Math.floor(pxw/nCols);
        let roomH = Math.max(32, Math.floor(pxh/(sortedRooms.length/nCols||1)));
        sortedRooms.forEach((room, idx) => {
            let rw = colW - 10;
            let rh = Math.max(22, Math.round((room.size/(length*width))*pxh*1.3));
            rh = Math.min(rh, pxh-20);
            // Position: alternate columns
            let cellX = curX + (idx % nCols) * colW;
            let cellY = curY + Math.floor(idx / nCols) * roomH;
            let colorList = ['#e2e2e2', '#fff9c4', '#b7e4c7', '#cce3f6', '#ffb4a2', '#ffc6ff', '#d0f4f5'];
            let fill = colorList[idx % colorList.length];
            svgRooms += `<rect x="${cellX}" y="${cellY}" width="${rw}" height="${rh}" fill="${fill}" stroke="#888"/>`;
            svgRooms += `<text x="${cellX+7}" y="${cellY+18}" font-size="13" fill="#305280">${room.label}</text>`;
        });
        // Draw open area as a band at far end
        let openW = pxw - 24;
        let openY = y+pxh-24;
        let openFill = '#c2f6e3';
        let openRect = '';
        if (openArea > 1) {
            openRect = `<rect x="${x+12}" y="${openY}" width="${openW}" height="14" fill="${openFill}" stroke="#888"/>
                <text x="${x+19}" y="${openY+12}" font-size="12" fill="#24765f">Open Area</text>`;
        }
        // Full plot boundary
        let svg = `<svg width="${pxw+20}" height="${pxh+35}" viewBox="0 0 ${pxw+20} ${pxh+35}" class="layout-svg" aria-label="Room Layout Diagram" style="border:2.4px solid #3b5998;background:#fcfcfc;border-radius:8px;display:block;margin:auto;">
            <rect x="${x}" y="${y}" width="${pxw}" height="${pxh}" fill="none" stroke="#333" stroke-width="2.4"/>
            ${svgRooms}
            ${openRect}
            <text x="${x+pxw-22}" y="${y+18}" fill="red" font-weight="bold" font-size="13">N</text>
        </svg>`;
        return `<div class="layout-svg-wrapper">${svg}</div>`;
    }
});
