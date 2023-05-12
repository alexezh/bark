interface IDigSprite {
  get x(): number;
  get y(): number;
  get z(): number;
  get name(): string;
  get id(): number;
}

interface IDigBlock {
  get x(): number;
  get y(): number;
  get z(): number;
}

interface IDigBoundary {
  get x(): number;
  get y(): number;
  get z(): number;
}
