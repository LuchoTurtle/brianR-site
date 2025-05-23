import {
  Mesh,
  MeshBasicMaterial,
  Path,
  Shape,
  ShapeGeometry,
  Vector2
} from "three";

class Figure extends Mesh {
  constructor() {
    let basePts = [];
    let cnt = new Vector2();
    let aStep = Math.PI * 0.5;
    [
      [0.5, 5],
      [0.75, 1.5],
      [2.5, 3]
    ].forEach((p, idx, arr) => {
      let arrLen = arr.length * 2;
      let lastIdx = arrLen - 1;
      for (let i = 0; i < 4; i++) {
        let currQuadrant = arrLen * i;
        basePts[currQuadrant + idx] = new Vector2(p[1], p[0]).rotateAround(
          cnt,
          aStep * i
        );
        basePts[currQuadrant + lastIdx - idx] = new Vector2(
          p[0],
          p[1]
        ).rotateAround(cnt, aStep * i);
      }
    });

    let shape = new Shape(
      [
        [-100, 100],
        [-100, -100],
        [100, -100],
        [100, 100]
      ].map((p) => {
        return new Vector2(p[0], p[1]);
      })
    );
    shape.holes.push(new Path(basePts.reverse()));
    let g = new ShapeGeometry(shape);
    let m = new MeshBasicMaterial({ color: 0x080808 });
    super(g, m);
  }
}
export { Figure };
