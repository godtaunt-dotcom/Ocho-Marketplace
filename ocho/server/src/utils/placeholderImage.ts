export function createSvgPlaceholder(params: {
  title: string;
  category: string;
  bgColor?: string;
  textColor?: string;
}): string {
  const {
    title,
    category,
    bgColor = '#EBF0FF',
    textColor = '#283B99',
  } = params;

  // Clean title for display
  const cleanTitle = title.replace(/[<>&"]/g, '');
  const cleanCat = category.replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="${bgColor}"/>
    <rect x="20" y="20" width="560" height="410" rx="16" fill="white" fill-opacity="0.6" stroke="${textColor}" stroke-opacity="0.15" stroke-width="2"/>
    <g transform="translate(40, 50)">
      <rect width="120" height="32" rx="16" fill="${textColor}" fill-opacity="0.15"/>
      <text x="60" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${textColor}" text-anchor="middle">
        ${cleanCat.toUpperCase()}
      </text>
    </g>
    <g transform="translate(300, 210)">
      <circle r="44" fill="${textColor}" fill-opacity="0.12"/>
      <text y="14" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="800" fill="${textColor}" text-anchor="middle">
        8
      </text>
    </g>
    <text x="300" y="300" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="${textColor}" text-anchor="middle">
      ${cleanTitle}
    </text>
    <text x="300" y="330" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="${textColor}" fill-opacity="0.7" text-anchor="middle">
      Ocho Preloved Unpad Jatinangor
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
