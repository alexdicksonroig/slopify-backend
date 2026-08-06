export class ProductOption {
  constructor(
    readonly id: number,
    readonly possibleValues: string[],
    readonly label: string,
  ) {}
}
