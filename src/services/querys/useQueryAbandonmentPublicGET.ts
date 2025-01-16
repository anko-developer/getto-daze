import { apiClient } from '@/services/config/apiClient';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

/**
 * @name   getAbandonmentPublic
 * @base   /
 * @path   /abandonmentPublic
 * @method GET
 * @update 2025. 01. 15. 오후 14:51
 */

export interface abandonmentPublicParams {
  bgnde?: string;
  endde?: string;
  upkind?: string;
  kind?: string;
  upr_cd?: string;
  org_cd?: string;
  care_reg_no?: string;
  state?: string;
  neuter_yn?: string;
  pageNo?: number;
  numOfRows?: number;
}

export interface abandonmentPublicResponse {
  response: {
    header: abandonmentPublicHeader;
    body: abandonmentPublicBody;
  };
}

export interface abandonmentPublicHeader {
  reqNo: number;
  resultCode: string;
  resultMsg: string;
}

export interface abandonmentPublicBody {
  items: abandonmentPublicItems;
}

export interface abandonmentPublicItems {
  item: abandonmentPublicItem[];
}

export interface abandonmentPublicItem {
  desertionNo: string; // 유기번호
  filename: string; // 썸네일 이미지 URL
  happenDt: string; // 발견일자 (YYYYMMDD)
  happenPlace: string; // 발견장소
  kindCd: string; // 품종
  colorCd: string; // 색상
  age: string; // 나이 (출생연도)
  weight: string; // 몸무게
  noticeNo: string; // 공고번호
  noticeSdt: string; // 공고시작일자 (YYYYMMDD)
  noticeEdt: string; // 공고종료일자 (YYYYMMDD)
  popfile: string; // 상세 이미지 URL
  processState: string; // 상태 (예: 보호중)
  sexCd: string; // 성별 (M: 수컷, F: 암컷, Q: 미상)
  neuterYn: string; // 중성화 여부 (Y/N/U)
  specialMark: string; // 특징
  careNm: string; // 보호소 이름
  careTel: string; // 보호소 전화번호
  careAddr: string; // 보호소 주소
  orgNm: string; // 관할 기관
  chargeNm: string; // 담당자명
  officetel: string; // 담당자 연락처
}

type ResponseData = abandonmentPublicResponse;

const URL = '/abandonmentPublic';

export const fetchAbandonmentPublicGET = async (
  params?: abandonmentPublicParams,
) => {
  if (!params) {
    return new Promise(() => {
      return undefined;
    });
  }

  const response = await apiClient()
    .get(URL, { params })
    .then((res) => {
      return res.data;
    });
  return response;
};

export const useQueryAbandonmentPublicGET = (
  params?: abandonmentPublicParams,
  options?,
) => {
  return useQuery<ResponseData, AxiosError>({
    ...options,
    queryKey: [URL, params],
    queryFn: () => fetchAbandonmentPublicGET(params),
    placeholderData: keepPreviousData,
    withCredentials: false,
    suspense: true,
  });
};
