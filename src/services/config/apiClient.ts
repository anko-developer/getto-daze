import axios from 'axios';
import qs from 'qs';

const getTime = (type: string | undefined) => {
  switch (type) {
    case 'apiType-long':
      return 3 * 60 * 1000;
    case 'apiType-longlong':
      return 5 * 60 * 1000;
    case 'file':
      return 5 * 60 * 1000;
    default:
      return 60 * 1000;
  }
};

export const apiClient = (type?: string, responseType?: any) => {
  const headers = {};
  if (type === 'file') {
    headers['Content-Type'] = 'multipart/form-data';
  }

  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false, // 크로스 사이트 접근 제어(cross-site Access-Control) 요청이 필요한 경우 설정합니다.
    headers: headers, // 서버에 전송 될 사용자 정의 헤더 입니다.
    responseType: responseType || undefined, // 서버에서 응답할 데이터 타입을 설정합니다.
    timeout: getTime(type), // 요청이 타임 아웃되는 밀리 초(ms)를 설정합니다.
    params: { serviceKey: import.meta.env.VITE_API_KEY, _type: 'json' }, // 요청과 함께 전송 될 URL 매개 변수입니다.
    paramsSerializer: (params) => {
      // `params`를 직렬화(serializing) 하는 옵션 함수입니다.
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });

  instance.interceptors.request.use(
    (config) => {
      // request 전에 수행할 작업
      return config;
    },
    (error) => {
      // request 오류 처리
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      // 응답 데이터 가공
      return response;
    },
    (error) => {
      // 응답 오류 처리
      return Promise.reject(error);
    },
  );

  return instance;
};
