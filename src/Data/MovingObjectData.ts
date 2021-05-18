import PhysicsData from "./PhysicsData";

export default class MovingObjectData {
  public static readonly MAX_LIVES = 3;

  public lives: number;
  public physics: PhysicsData;
}
