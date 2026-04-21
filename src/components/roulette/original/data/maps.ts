import type { MapEntity } from '../types/MapEntity.type';

export type StageDef = {
  title: string;
  entities?: MapEntity[];
  goalY: number;
  zoomY: number;
};

const STATIC_PROPS = { density: 1, angularVelocity: 0, restitution: 0 };

function staticBox(x: number, y: number, width: number, height: number, rotation: number, restitution = 0): MapEntity {
  return {
    position: { x, y },
    type: 'static',
    shape: { type: 'box', width, height, rotation },
    props: { density: 1, angularVelocity: 0, restitution },
  };
}

function wheel(x: number, y: number, angularVelocity: number): MapEntity {
  return {
    position: { x, y },
    type: 'kinematic',
    shape: { type: 'box', width: 2, height: 0.1, rotation: 0 },
    props: { density: 1, angularVelocity, restitution: 0 },
  };
}

export const stages: StageDef[] = [
  {
    title: 'Wheel of fortune',
    goalY: 111,
    zoomY: 106.75,
    entities: [
      {
        position: { x: 0, y: 0 },
        shape: {
          type: 'polyline',
          points: [
            [16.5, -300],
            [9.25, -300],
            [9.25, 8.5],
            [2, 19.25],
            [2, 26],
            [9.75, 30],
            [9.75, 33.5],
            [1.25, 41],
            [1.25, 53.75],
            [8.25, 58.75],
            [8.25, 63],
            [9.25, 64],
            [8.25, 65],
            [8.25, 99.25],
            [15.1, 106.75],
            [15.1, 111.75],
          ],
          rotation: 0,
        },
        type: 'static',
        props: STATIC_PROPS,
      },
      {
        type: 'static',
        position: { x: 0, y: 0 },
        props: STATIC_PROPS,
        shape: {
          type: 'polyline',
          rotation: 0,
          points: [
            [16.5, -300],
            [16.5, 9.25],
            [9.5, 20],
            [9.5, 22.5],
            [17.5, 26],
            [17.5, 33.5],
            [24, 38.5],
            [19, 45.5],
            [19, 55.5],
            [24, 59.25],
            [24, 63],
            [23, 64],
            [24, 65],
            [24, 100.5],
            [16, 106.75],
            [16, 111.75],
          ],
        },
      },
      {
        type: 'static',
        position: { x: 0, y: 0 },
        props: STATIC_PROPS,
        shape: {
          type: 'polyline',
          rotation: 0,
          points: [
            [12.75, 37.5],
            [7, 43.5],
            [7, 49.75],
            [12.75, 53.75],
            [12.75, 37.5],
          ],
        },
      },
      {
        type: 'static',
        position: { x: 0, y: 0 },
        props: STATIC_PROPS,
        shape: {
          type: 'polyline',
          rotation: 0,
          points: [
            [14.75, 37.5],
            [14.75, 43],
            [17.5, 40.25],
            [14.75, 37.5],
          ],
        },
      },
      staticBox(15.5, 30, 0.2, 0.2, -45, 1),
      staticBox(15.5, 32, 0.2, 0.2, -45),
      staticBox(15.5, 28, 0.2, 0.2, -45),
      staticBox(12.5, 30, 0.2, 0.2, -45),
      staticBox(12.5, 32, 0.2, 0.2, -45),
      staticBox(12.5, 28, 0.2, 0.2, -45),
      ...[9.4, 11.3, 13.2, 15.1, 17, 18.9, 20.699999999999996, 22.7].flatMap((x) => [
        staticBox(x, 66.6, 0.6, 0.1, 45),
        staticBox(x, 69.1, 0.6, 0.1, -45),
      ]),
      ...[
        [9.5, 92],
        [12.75, 92],
        [16, 92],
        [19.25, 92],
        [22.5, 92],
        [11, 95],
        [14.25, 95],
        [17.5, 95],
        [20.75, 95],
        [9.5, 98],
        [12.75, 98],
        [16, 98],
        [19.25, 98],
        [22.5, 98],
      ].map(([x, y]) => staticBox(x, y, 0.25, 0.25, 0.7853981633974483)),
      wheel(8, 75, 3.5),
      wheel(12, 75, -3.5),
      wheel(16, 75, 3.5),
      wheel(20, 75, -3.5),
      wheel(24, 75, 3.5),
      wheel(14, 106.75, -1.2),
    ],
  },
];
