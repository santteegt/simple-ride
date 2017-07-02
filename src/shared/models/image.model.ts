import { CollectionObject } from './collection-object.model';

export interface Image extends CollectionObject {
  complete: boolean;
  extension: string;
  name: string;
  progress: number;
  size: number;
  store: string;
  token: string;
  type: string;
  uploadedAt: Date;
  uploading: boolean;
  url: string;
  user_id: string;
  rsvp_id?: string;
  doc_type: number;
  processed?: boolean;

  }

  export class DOCTYPES {
    static DNI: number = 1;
    static LICENSE: number = 2;
    static CAR_REGISTER: number = 3;
    static DEPOSIT_VOUCHER: number = 4;

  }
  