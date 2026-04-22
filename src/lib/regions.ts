export const SIDO_LIST = [
  { code: '6110000', name: '서울특별시' },
  { code: '6260000', name: '부산광역시' },
  { code: '6270000', name: '대구광역시' },
  { code: '6280000', name: '인천광역시' },
  { code: '6290000', name: '광주광역시' },
  { code: '6300000', name: '대전광역시' },
  { code: '6310000', name: '울산광역시' },
  { code: '6500000', name: '세종특별자치시' },
  { code: '6410000', name: '경기도' },
  { code: '6530000', name: '강원특별자치도' },
  { code: '6430000', name: '충청북도' },
  { code: '6440000', name: '충청남도' },
  { code: '6450000', name: '전북특별자치도' },
  { code: '6460000', name: '전라남도' },
  { code: '6470000', name: '경상북도' },
  { code: '6480000', name: '경상남도' },
  { code: '6690000', name: '제주특별자치도' },
] as const

export type SidoCode = typeof SIDO_LIST[number]['code']
