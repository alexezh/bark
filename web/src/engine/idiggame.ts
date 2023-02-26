export interface IDigGame {
  init(): Promise<void>;
  start(): void;
  stop(): void;
}