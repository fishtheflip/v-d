export type Course = {
    id: string;
    courseName: string;
    authorTitle?: string;
    seasonNum?: number;
    imgUrl?: string;
    simpId?: string;
    simpid?: string; // на случай опечатки в данных
    [k: string]: any;
  };
  
  export const getSimp = (c: Partial<Course> & { id?: string }) =>
    (c.simpId || (c as any).simpid || c.id) as string;
  