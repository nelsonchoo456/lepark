  export interface RegisterVisitorData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    contactNumber: string;
  }
  
  export interface VisitorResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    contactNumber: string;
  }
  
  export interface VisitorLoginData {
    email: string;
    password: string;
  }
  
  export interface VisitorLogoutResponse {
    message: string;
  }
  
  export interface VisitorUpdateData {
    firstName?: string;
    lastName?: string;
    contactNumber?: string;
    email?: string;
  }
  
  export interface VisitorPasswordResetRequestData {
    email: string;
  }
  
  export interface VisitorPasswordResetData {
    token: string;
    newPassword: string;
  }
  