export type IVietQrBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
};

type VietQrBanksResponse = {
  code: string;
  desc: string;
  data: IVietQrBank[];
};

const VIETQR_BANKS_URL = 'https://api.vietqr.io/v2/banks';

export const vietqrService = {
  getBanks: async (): Promise<IVietQrBank[]> => {
    const response = await fetch(VIETQR_BANKS_URL);
    if (!response.ok) {
      throw new Error('Không tải được danh sách ngân hàng');
    }
    const json = (await response.json()) as VietQrBanksResponse;
    if (json.code !== '00' || !Array.isArray(json.data)) {
      throw new Error(json.desc || 'Không tải được danh sách ngân hàng');
    }
    return json.data;
  },
};
