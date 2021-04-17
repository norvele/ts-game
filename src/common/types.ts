import {Vector} from "@/common/helpers/vector";

export interface PlayerPosition {
    x: number;
    y: number;
    anglePrev: number;
    angle: number;
    speedVector: Vector,
}
