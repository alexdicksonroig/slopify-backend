export class User {
  constructor(
    readonly id: number,
    readonly email: string,
    readonly passwordHash: string,
  ) {}
}
