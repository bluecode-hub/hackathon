declare module '*.jsx' {
    const content: any;
    export default content;
}

declare module '*.js' {
    const content: any;
    export default content;
    export const RAW_CSV: any;
    export const ALL_MEMBERS: any;
    export const getMembersBySHG: any;
    export const getAllSHGs: any;
    export const getSHGStats: any;
    export const listAllSHGs: any; // Add more as needed or just use any
}

declare module './data/mockData' {
    export const RAW_CSV: string;
    export const NGOS: any[];
    export const TRAINING_CATALOG: any[];
    export const TRAINING_PROGRESS: any;
    export const BANK_UPI_RECORDS: any;
    export const PENDING_LOANS_INIT: any[];
    export const MEETINGS: any[];
}

declare module './data/dataService' {
    export const getMembersBySHG: (shg: any) => any[];
    export const getAllSHGs: () => string[];
    // add others strictly if needed, or rely on wildcard
    export const getSHGStats: any;
    export const calculateHealthScore: any;
    export const getHealthStatus: any;
    export const getAllSHGSummaries: any;
    export const fmt: any;
    export const getTrainingForMember: any;
}
