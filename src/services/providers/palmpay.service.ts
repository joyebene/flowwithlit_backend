import axios from "axios";

export class PalmPayService {
  private baseUrl = process.env.PALMPAY_BASE_URL!;
  private apiKey = process.env.PALMPAY_API_KEY!;

  async createVirtualAccount(data: {
    name: string;
    email: string;
    phone: string;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/virtual-account/create`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }

  async initiateTransfer(data: {
    accountNumber: string;
    bankCode: string;
    amount: number;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/transfer`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    return response.data;
  }
}