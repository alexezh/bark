import { MeshPhongMaterial } from "three";

export class GameColors {
  public static transparent: string = "rgba(0, 0, 0, 0)";
  public static black: string = "black";
  public static tileBlock: string = "red";
  public static region: string = "blue";
  public static regionN: number = 0x0455d8;
  public static barButtonBack: string = "gray";
  public static barButtonSelected: string = "blue";
  public static wallHidglight = "#50f6cfcb";
  public static buttonFont: '24px serif';
  public static readLineFont: '24px serif';

  public static material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });
}
