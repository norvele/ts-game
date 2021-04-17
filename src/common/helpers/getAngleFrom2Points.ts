import {getDeg} from "@/common/helpers/getDeg";

export function getAngleFrom2Points(x1: number, y1: number, x2: number, y2: number) {
    return getDeg(Math.atan2(x2-x1, y2-y1));
}
