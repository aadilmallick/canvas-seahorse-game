export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  {
    x,
    sides,
    y,
    radius,
  }: {
    x: number;
    y: number;
    sides: number;
    radius: number;
  }
) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);

  let angleOnEachSide = (Math.PI * 2) / sides;
  let angle = 0;

  for (let i = 1; i < sides; i++) {
    // For each of the remaining vertices
    angle += angleOnEachSide; // Add the angle for the next vertex
    ctx.lineTo(
      x + radius * Math.sin(angle), // Add line to next vertex
      y - radius * Math.cos(angle)
    );
  }

  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
