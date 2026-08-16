import { fabric } from 'fabric';

const GUIDE_COLOR = 'rgba(236, 72, 153, 0.9)';
const SNAP_MARGIN = 5;
const LINE_OFFSET = 4;

/**
 * Augments the canvas with object-to-object alignment guidelines (snap + guide
 * lines). Based on Fabric.js official "Aligning Guidelines" extension.
 */
export function initAligningGuidelines(canvas: fabric.Canvas): void {
  const ctx = canvas.getSelectionContext();
  const aligningLineOffset = LINE_OFFSET;
  const aligningLineMargin = SNAP_MARGIN;
  const aligningLineWidth = 1;
  const aligningLineColor = GUIDE_COLOR;

  let viewportTransform: number[] = [];
  let zoom = 1;

  function drawVerticalLine(coords: { x: number; y1: number; y2: number }) {
    drawLine(
      coords.x + 0.5,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.5,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1
    );
  }

  function drawHorizontalLine(coords: { y: number; x1: number; x2: number }) {
    drawLine(
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.5,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.5
    );
  }

  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (!ctx) return;
    ctx.save();
    ctx.lineWidth = aligningLineWidth;
    ctx.strokeStyle = aligningLineColor;
    ctx.beginPath();
    ctx.moveTo(x1 * zoom + viewportTransform[4], y1 * zoom + viewportTransform[5]);
    ctx.lineTo(x2 * zoom + viewportTransform[4], y2 * zoom + viewportTransform[5]);
    ctx.stroke();
    ctx.restore();
  }

  function isInRange(value1: number, value2: number) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (let i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
      if (i === value2) return true;
    }
    return false;
  }

  const verticalLines: { x: number; y1: number; y2: number }[] = [];
  const horizontalLines: { y: number; x1: number; x2: number }[] = [];

  canvas.on('mouse:down', () => {
    viewportTransform = canvas.viewportTransform as number[];
    zoom = canvas.getZoom();
  });

  canvas.on('object:moving', (e) => {
    const activeObject = e.target as fabric.Object;
    if (!activeObject) return;
    if (activeObject.angle !== 0) return;

    const canvasObjects = canvas.getObjects();
    const activeObjectCenter = activeObject.getCenterPoint();
    const activeObjectLeft = activeObjectCenter.x;
    const activeObjectTop = activeObjectCenter.y;

    const activeObjectBoundingRect = activeObject.getBoundingRect();
    const activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3];
    const activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0];

    let horizontalInTheRange = false;
    let verticalInTheRange = false;

    const transform = (canvas as any)._currentTransform;
    if (!transform) return;

    verticalLines.length = 0;
    horizontalLines.length = 0;

    for (let i = canvasObjects.length; i--; ) {
      if (canvasObjects[i] === activeObject) continue;

      const objectCenter = canvasObjects[i].getCenterPoint();
      const objectLeft = objectCenter.x;
      const objectTop = objectCenter.y;
      const objectBoundingRect = canvasObjects[i].getBoundingRect();
      const objectHeight = objectBoundingRect.height / viewportTransform[3];
      const objectWidth = objectBoundingRect.width / viewportTransform[0];

      // right side of the active object touches the left side of the object
      if (isInRange(activeObjectLeft + activeObjectWidth / 2, objectLeft - objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft - objectWidth / 2,
          y1: objectTop < activeObjectTop
            ? objectTop - objectHeight / 2 - aligningLineOffset
            : objectTop + objectHeight / 2 + aligningLineOffset,
          y2: activeObjectTop > objectTop
            ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
            : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft - objectWidth / 2 - activeObjectWidth / 2, activeObjectTop),
          'center',
          'center'
        );
      }

      // left side of the active object touches the right side of the object
      if (isInRange(activeObjectLeft - activeObjectWidth / 2, objectLeft + objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft + objectWidth / 2,
          y1: objectTop < activeObjectTop
            ? objectTop - objectHeight / 2 - aligningLineOffset
            : objectTop + objectHeight / 2 + aligningLineOffset,
          y2: activeObjectTop > objectTop
            ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
            : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft + objectWidth / 2 + activeObjectWidth / 2, activeObjectTop),
          'center',
          'center'
        );
      }

      // bottom of the object touches the top of the active object
      if (isInRange(objectTop + objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop + objectHeight / 2,
          x1: objectLeft < activeObjectLeft
            ? objectLeft - objectWidth / 2 - aligningLineOffset
            : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2: activeObjectLeft > objectLeft
            ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
            : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 + activeObjectHeight / 2),
          'center',
          'center'
        );
      }

      // top of the object touches the bottom of the active object
      if (isInRange(objectTop - objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop - objectHeight / 2,
          x1: objectLeft < activeObjectLeft
            ? objectLeft - objectWidth / 2 - aligningLineOffset
            : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2: activeObjectLeft > objectLeft
            ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
            : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 - activeObjectHeight / 2),
          'center',
          'center'
        );
      }

      // horizontal center line
      if (isInRange(objectLeft, activeObjectLeft)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft,
          y1: objectTop < activeObjectTop
            ? objectTop - objectHeight / 2 - aligningLineOffset
            : objectTop + objectHeight / 2 + aligningLineOffset,
          y2: activeObjectTop > objectTop
            ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
            : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
      }

      // left edge
      if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft - objectWidth / 2,
          y1: objectTop < activeObjectTop
            ? objectTop - objectHeight / 2 - aligningLineOffset
            : objectTop + objectHeight / 2 + aligningLineOffset,
          y2: activeObjectTop > objectTop
            ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
            : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop),
          'center',
          'center'
        );
      }

      // right edge
      if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft + objectWidth / 2,
          y1: objectTop < activeObjectTop
            ? objectTop - objectHeight / 2 - aligningLineOffset
            : objectTop + objectHeight / 2 + aligningLineOffset,
          y2: activeObjectTop > objectTop
            ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
            : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop),
          'center',
          'center'
        );
      }

      // vertical center line
      if (isInRange(objectTop, activeObjectTop)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop,
          x1: objectLeft < activeObjectLeft
            ? objectLeft - objectWidth / 2 - aligningLineOffset
            : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2: activeObjectLeft > objectLeft
            ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
            : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
      }

      // top edge
      if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop - objectHeight / 2,
          x1: objectLeft < activeObjectLeft
            ? objectLeft - objectWidth / 2 - aligningLineOffset
            : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2: activeObjectLeft > objectLeft
            ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
            : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2),
          'center',
          'center'
        );
      }

      // bottom edge
      if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop + objectHeight / 2,
          x1: objectLeft < activeObjectLeft
            ? objectLeft - objectWidth / 2 - aligningLineOffset
            : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2: activeObjectLeft > objectLeft
            ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
            : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2),
          'center',
          'center'
        );
      }
    }

    if (!horizontalInTheRange) horizontalLines.length = 0;
    if (!verticalInTheRange) verticalLines.length = 0;
  });

  canvas.on('before:render', () => {
    if ((canvas as any).contextTop) {
      canvas.clearContext((canvas as any).contextTop);
    }
  });

  canvas.on('after:render', () => {
    for (let i = verticalLines.length; i--; ) drawVerticalLine(verticalLines[i]);
    for (let i = horizontalLines.length; i--; ) drawHorizontalLine(horizontalLines[i]);
    verticalLines.length = horizontalLines.length = 0;
  });

  canvas.on('mouse:up', () => {
    verticalLines.length = horizontalLines.length = 0;
    canvas.renderAll();
  });
}

/**
 * Augments the canvas with snapping/guidelines relative to the canvas page
 * itself: object center to page center, object edges to page edges and to the
 * central axis. Works in logical A4 coordinates so it stays correct at any zoom.
 */
export function initCenteringGuidelines(canvas: fabric.Canvas): void {
  const ctx = canvas.getSelectionContext();
  const margin = SNAP_MARGIN;
  const lineColor = GUIDE_COLOR;

  let zoom = 1;

  // Vertical snapping within this page rectangle (logical px)
  function getPageWidth() {
    return canvas.getWidth() / zoom;
  }

  function getPageHeight() {
    return canvas.getHeight() / zoom;
  }

  function drawVerticalLine(x: number) {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const y1 = 0 * zoom;
    const y2 = getPageHeight() * zoom;
    ctx.moveTo(x * zoom + 0.5, y1);
    ctx.lineTo(x * zoom + 0.5, y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHorizontalLine(y: number) {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const x1 = 0 * zoom;
    const x2 = getPageWidth() * zoom;
    ctx.moveTo(x1, y * zoom + 0.5);
    ctx.lineTo(x2, y * zoom + 0.5);
    ctx.stroke();
    ctx.restore();
  }

  function isInRange(value1: number, value2: number) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (let i = value1 - margin, len = value1 + margin; i <= len; i++) {
      if (i === value2) return true;
    }
    return false;
  }

  let showVertical = false;
  let showHorizontal = false;

  canvas.on('mouse:down', () => {
    zoom = canvas.getZoom();
  });

  canvas.on('object:moving', (e) => {
    const object = e.target as fabric.Object;
    if (!object) return;
    if (object.angle !== 0) return;
    const transform = (canvas as any)._currentTransform;
    if (!transform) return;

    const pageW = getPageWidth();
    const pageH = getPageHeight();
    const center = object.getCenterPoint();
    const box = object.getBoundingRect();

    const objCenterX = center.x / zoom;
    const objCenterY = center.y / zoom;
    const objHalfW = box.width / 2 / zoom;
    const objHalfH = box.height / 2 / zoom;

    const candidateXs = [objCenterX - objHalfW, objCenterX, objCenterX + objHalfW];
    const targetXs = [0, pageW / 2, pageW];
    const candidateYs = [objCenterY - objHalfH, objCenterY, objCenterY + objHalfH];
    const targetYs = [0, pageH / 2, pageH];

    let snapX: number | null = null;
    let snapY: number | null = null;

    for (let i = 0; i < candidateXs.length; i++) {
      for (let j = 0; j < targetXs.length; j++) {
        if (isInRange(candidateXs[i], targetXs[j])) {
          const delta = targetXs[j] - candidateXs[i];
          const newCenterX = objCenterX + delta;
          if (snapX === null || Math.abs(newCenterX - objCenterX) < Math.abs(snapX - objCenterX)) {
            snapX = newCenterX;
          }
        }
      }
    }

    for (let i = 0; i < candidateYs.length; i++) {
      for (let j = 0; j < targetYs.length; j++) {
        if (isInRange(candidateYs[i], targetYs[j])) {
          const delta = targetYs[j] - candidateYs[i];
          const newCenterY = objCenterY + delta;
          if (snapY === null || Math.abs(newCenterY - objCenterY) < Math.abs(snapY - objCenterY)) {
            snapY = newCenterY;
          }
        }
      }
    }

    if (snapX !== null || snapY !== null) {
      object.setPositionByOrigin(
        new fabric.Point(snapX !== null ? snapX : objCenterX, snapY !== null ? snapY : objCenterY),
        'center',
        'center'
      );
    }

    showVertical = snapX !== null && (isInRange(objCenterX, pageW / 2) || isInRange(snapX, pageW / 2));
    showHorizontal = snapY !== null && (isInRange(objCenterY, pageH / 2) || isInRange(snapY, pageH / 2));
  });

  canvas.on('before:render', () => {
    if ((canvas as any).contextTop) {
      canvas.clearContext((canvas as any).contextTop);
    }
  });

  canvas.on('after:render', () => {
    if (showVertical) drawVerticalLine(getPageWidth() / 2);
    if (showHorizontal) drawHorizontalLine(getPageHeight() / 2);
    showVertical = showHorizontal = false;
  });

  canvas.on('mouse:up', () => {
    showVertical = showHorizontal = false;
  });
}

/** Enable both aligning and centering guidelines on the given canvas. */
export function initSmartGuides(canvas: fabric.Canvas): void {
  initAligningGuidelines(canvas);
  initCenteringGuidelines(canvas);
}