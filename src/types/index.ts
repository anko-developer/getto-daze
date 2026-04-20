export type Animal = {
  id: string
  care_nm: string
  care_tel: string
  region_cd: string
  city_cd: string | null
  kind: string
  age: string
  sex: 'M' | 'F' | 'Q'
  weight: string | null
  feature: string | null
  image_url: string | null
  status: '보호중' | 'expired'
  notice_edt: string
  synced_at: string
  stale: boolean
}

export type Favorite = {
  id: string
  user_id: string
  animal_id: string
  created_at: string
}

export type SurveyAnswer = {
  housing: '아파트' | '단독주택' | '기숙사'
  has_yard: boolean
  walk_time: '30분 이하' | '1시간' | '2시간 이상'
  family: '혼자' | '커플' | '가족 (아이 있음)'
  size_pref: '소형' | '중형' | '대형' | '상관없음'
  age_pref: '어린' | '성견' | '노령' | '상관없음'
  region_cd?: string
}
