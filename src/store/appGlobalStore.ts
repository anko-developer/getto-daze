// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// import { immer } from 'zustand/middleware/immer';
// import { getDefaultInfosUsingGET } from '@/api/querys/common/common/defaultInfos/useQueryGetDefaultInfosUsingGET.ts';

// export interface AppGlobalStore {
//   imgPath: getDefaultInfosUsingGET.ResponseImgPath;
//   defaultInfos: getDefaultInfosUsingGET.Response;
//   action?: {
//     setDefaultInfos: (arg: getDefaultInfosUsingGET.Response) => void;
//     setImgPath: (arg: getDefaultInfosUsingGET.ResponseImgPath) => void;
//   };
// }

// const initialState: AppGlobalStore = {
//   imgPath: {},
//   defaultInfos: {},
// };

// export const useAppGlobalStore = create<AppGlobalStore>()(
//   devtools(
//     immer((set, get) => ({
//       ...initialState,
//       action: {
//         setDefaultInfos(arg: getDefaultInfosUsingGET.Response) {
//           set((state) => {
//             state.defaultInfos = arg;
//           });
//         },
//         setImgPath(arg: getDefaultInfosUsingGET.ResponseImgPath) {
//           set((state) => {
//             state.imgPath = arg;
//           });
//         },
//       },
//     })),
//     {
//       name: 'AppGlobalStore',
//       enabled:
//         import.meta.env.NODE_ENV === 'development' ||
//         import.meta.env.NODE_ENV === 'local',
//     },
//   ),
// );
