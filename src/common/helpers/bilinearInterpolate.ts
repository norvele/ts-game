import interpolatingPolynomial from 'interpolating-polynomial';

/** x и y значения от 0 до 1 */
export function bilinearInterpolate(x: number, y: number, matrix) {
    const maxRowIndex = matrix.length - 1;
    const interpolatedPairs = matrix.map((row, rowIndex) => {
        const maxColumnIndex = row.length - 1;
        const pairs = row.map((value, columnIndex) => {
            return [columnIndex / maxColumnIndex, value];
        });
        const f = interpolatingPolynomial(pairs);
        return [rowIndex / maxRowIndex, f(x)]
    })
    const f = interpolatingPolynomial(interpolatedPairs);
    return f(y);
}
