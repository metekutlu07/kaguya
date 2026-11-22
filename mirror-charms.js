// Original artwork is shared by every layer; no extra bitmap downloads.
export function animateMirrorArtwork(fallback){
 const charms=[
  {p:'153,260 173,247 222,235 244,241 267,302 264,326 217,345 222,360 207,368 195,355 195,345 177,342 149,284',x:209,y:245,a:6,t:3.8,d:-1},
  {p:'705,255 730,247 765,253 790,271 804,302 798,329 781,343 748,343 727,334 704,323 691,302 696,279',x:748,y:257,a:6,t:4.6,d:-2.4},
  {p:'466,219 483,219 488,240 501,260 496,279 479,290 458,281 449,264 459,242',x:475,y:221,a:9,t:3.2,d:-.7},
  {p:'135,345 147,343 165,353 171,366 155,384 142,396 120,376 116,357',x:141,y:345,a:9,t:3.5,d:-2},
  {p:'799,340 816,340 834,350 836,367 813,391 786,367 784,351',x:810,y:342,a:8,t:4.2,d:-1.6},
  {p:'237,1487 251,1487 253,1509 276,1527 252,1540 244,1558 235,1541 217,1527 234,1512',x:244,y:1488,a:10,t:4.9,d:-2.7},
  {p:'686,1487 701,1487 704,1508 726,1528 704,1540 695,1558 687,1541 665,1528 685,1512',x:695,y:1488,a:10,t:4.5,d:-.9},
 ];
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 941 1672');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','treasure-frame-art mirror-animated-art');
 const bitmap='<image href="assets/composition/mirror-overlay.png" x="0" y="0" width="941" height="1672"/>';
 svg.innerHTML=`<defs><mask id="mirror-charms-base" maskUnits="userSpaceOnUse" x="0" y="0" width="941" height="1672"><rect width="941" height="1672" fill="white"/>${charms.map(c=>`<polygon points="${c.p}" fill="black"/>`).join('')}</mask>${charms.map((c,i)=>`<clipPath id="mirror-charm-${i}" clipPathUnits="userSpaceOnUse"><polygon points="${c.p}"/></clipPath>`).join('')}</defs><g mask="url(#mirror-charms-base)">${bitmap}</g>${charms.map((c,i)=>`<g class="mirror-charm" style="--swing:${c.a}deg;--duration:${c.t}s;--phase:${c.d}s;transform-origin:${c.x}px ${c.y}px"><g clip-path="url(#mirror-charm-${i})">${bitmap}</g></g>`).join('')}`;
 fallback.replaceWith(svg);
}
