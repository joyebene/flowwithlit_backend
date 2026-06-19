export class YouVerifyService {
  async verifyBVN(bvn: string) {
    // later call Youverify API

    return {
      status: true,
      firstName: "John",
      lastName: "Doe",
    };
  }

  async verifyNIN(nin: string) {
    return {
      status: true,
    };
  }
}