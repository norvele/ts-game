import { getDeg } from "@/common/helpers/getDeg";
import {getRad} from "@/common/helpers/getRad";

export class Vector {
    public x;
    public y;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    public isZeroVector(): boolean {
        return !this.x && !this.y;
    }

    public add(vector: Vector): void {
        this.x += vector.x;
        this.y += vector.y;
    }

    public subtract(vector: Vector): void {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    public getAngleRad(): number {
        return Math.atan2(this.y, this.x);
    }

    public getAngleDeg(): number {
        const rad = this.getAngleRad();
        return (360 + Math.round(getDeg(rad))) % 360;
    }

    public setAngleDeg(angle: number): void {
        const length = this.getLength();
        this.x = Math.cos(getRad(angle)) * length;
        this.y = Math.sin(getRad(angle)) * length;
    }

    public getLength(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    public getLengthX(): number {
        return Math.cos(this.getAngleRad()) * this.getLength();
    }

    public getLengthY(): number {
        return Math.sin(this.getAngleRad()) * this.getLength();
    }

    public setLength(value: number): void {
        const rad = this.getAngleRad();
        this.x = Math.cos(rad) * value;
        this.y = Math.sin(rad) * value;
    }

    public copy(): Vector {
        return new Vector(this.x, this.y);
    }
}
